"""
Repack unpacked PyTorch model directories into .pth files.
The models/ directory contains extracted PyTorch archives that need to be zipped back.
"""
import os
import zipfile

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")

def repack_model(model_dir_name):
    """Repack an unpacked PyTorch model directory into a .pth file."""
    model_dir = os.path.join(MODELS_DIR, model_dir_name)
    output_file = os.path.join(MODELS_DIR, f"{model_dir_name}.pth")
    
    if os.path.isfile(output_file):
        print(f"  [SKIP] {output_file} already exists")
        return output_file
    
    if not os.path.isdir(model_dir):
        print(f"  [MISSING] {model_dir}")
        return None
    
    # Check if it has the PyTorch archive structure
    required = ["data.pkl"]
    for req in required:
        if not os.path.exists(os.path.join(model_dir, req)):
            print(f"  [SKIP] Not a PyTorch archive (missing {req})")
            return None
    
    print(f"  Repacking {model_dir_name} -> {output_file}")
    
    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_STORED) as zf:
        for root, dirs, files in os.walk(model_dir):
            for file in files:
                filepath = os.path.join(root, file)
                # Archive name relative to model dir, prefixed with model name
                arcname = os.path.join(
                    model_dir_name,
                    os.path.relpath(filepath, model_dir)
                )
                zf.write(filepath, arcname)
    
    size_mb = os.path.getsize(output_file) / (1024 * 1024)
    print(f"  Created {output_file} ({size_mb:.1f} MB)")
    return output_file


if __name__ == "__main__":
    models = ["netrx_vit_b16_best", "netrx_idrid_dme_vit_b16_best", "netrx_drive_vessel_best"]
    for model_name in models:
        print(f"\n=== {model_name} ===")
        result = repack_model(model_name)
        if result:
            # Verify it can be loaded
            import torch
            try:
                model = torch.load(result, map_location="cpu", weights_only=False)
                print(f"  ✓ Loaded successfully: {type(model).__name__}")
                if hasattr(model, 'state_dict'):
                    params = sum(p.numel() for p in model.parameters())
                    print(f"  Parameters: {params:,}")
                    # Find classification head
                    for key in model.state_dict().keys():
                        if any(kw in key.lower() for kw in ['head', 'fc', 'classifier']):
                            print(f"  Head layer: {key} shape={model.state_dict()[key].shape}")
                    # Print top-level modules
                    for name, child in model.named_children():
                        print(f"  Module: {name} -> {child.__class__.__name__}")
            except Exception as e:
                print(f"  ✗ Load failed: {e}")
