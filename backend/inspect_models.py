"""
Quick script to inspect the NetrX model architectures.
Run: python backend/inspect_models.py
"""
import sys
import os
import pickle

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")

def inspect_pkl(model_name):
    pkl_path = os.path.join(MODELS_DIR, model_name, "data.pkl")
    if not os.path.exists(pkl_path):
        print(f"  [MISSING] {pkl_path}")
        return
    
    print(f"\n=== {model_name} ===")
    print(f"  pkl size: {os.path.getsize(pkl_path)} bytes")
    
    # Try to read the pickle to understand the architecture
    try:
        import torch
        model = torch.load(os.path.join(MODELS_DIR, model_name), map_location="cpu", weights_only=False)
        print(f"  Type: {type(model)}")
        if hasattr(model, '__class__'):
            print(f"  Class: {model.__class__.__name__}")
        if hasattr(model, 'state_dict'):
            sd = model.state_dict()
            print(f"  State dict keys (first 10): {list(sd.keys())[:10]}")
            print(f"  Total params: {sum(p.numel() for p in model.parameters()):,}")
            # Look for the classification head
            for key in sd.keys():
                if 'head' in key.lower() or 'fc' in key.lower() or 'classifier' in key.lower():
                    print(f"  Classification layer: {key} shape={sd[key].shape}")
        print(f"  Full architecture (summary):")
        # Print just the top-level modules
        if hasattr(model, 'named_children'):
            for name, child in model.named_children():
                print(f"    {name}: {child.__class__.__name__}")
    except Exception as e:
        print(f"  Error loading: {e}")

if __name__ == "__main__":
    for model_name in ["netrx_vit_b16_best", "netrx_idrid_dme_vit_b16_best", "netrx_drive_vessel_best"]:
        inspect_pkl(model_name)
