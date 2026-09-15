import React, { useState } from 'react';
import { X, ArrowRight, BookOpen, Eye, Cpu, Camera, Activity, Brain } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const CATEGORIES = ['All', 'Diabetic Retinopathy', 'Fundus Imaging', 'AI & Grad-CAM', 'Clinical Guidelines', 'Image Quality'];

const RESOURCES = [
  {
    id: 1, category: 'Diabetic Retinopathy', icon: Eye, readTime: '5 min read',
    title: 'Understanding Diabetic Retinopathy: Stages & Clinical Signs',
    summary: 'A comprehensive overview of the ETDRS 5-stage DR classification system — from No DR to Proliferative DR — and the pathological hallmarks at each grade.',
    content: `Diabetic Retinopathy (DR) is a microvascular complication of diabetes mellitus that affects the blood vessels of the retina. It remains the leading cause of preventable blindness in working-age adults worldwide.

ETDRS Classification System:
• Grade 0 — No DR: Normal fundus with no microvascular lesions
• Grade 1 — Mild NPDR: At least one microaneurysm, but no other DR features
• Grade 2 — Moderate NPDR: More than mild, with dot-blot hemorrhages, hard exudates
• Grade 3 — Severe NPDR: 4-2-1 rule (20+ hemorrhages, venous beading in 2+ quadrants, IRMA)
• Grade 4 — Proliferative DR: Neovascularization of disc (NVD) or elsewhere (NVE)

Pathological Features:
Microaneurysms are the earliest clinical sign — small outpouchings from retinal capillary walls. As DR progresses, hard exudates (lipid deposits), cotton wool spots (nerve fiber infarcts), and dot-blot hemorrhages appear. In Proliferative DR, new fragile blood vessels grow and can cause vitreous hemorrhage or tractional retinal detachment.`,
    keyTakeaways: ['Annual screening reduces blindness risk by 94% in type 1 DM', 'Microaneurysms are the earliest hallmark detectable by fundus photography', 'Proliferative DR requires urgent pan-retinal photocoagulation or anti-VEGF therapy'],
  },
  {
    id: 2, category: 'Clinical Guidelines', icon: BookOpen, readTime: '4 min read',
    title: 'ETDRS Screening Protocols for Primary Care Providers',
    summary: 'How to implement the American Academy of Ophthalmology ETDRS-aligned screening protocol in a primary care or diabetes clinic setting.',
    content: `The Early Treatment Diabetic Retinopathy Study (ETDRS) established the global standard for diabetic retinopathy grading. NetrX follows this validated protocol.

Screening Recommendations:
• Type 1 DM: First screening 5 years after diagnosis, then annually
• Type 2 DM: Screening at diagnosis, then annually (or every 2 years if no DR)
• Pregnant diabetic patients: First trimester and every trimester thereafter

Equipment Requirements:
Non-mydriatic fundus cameras are preferred for primary care screening. A 45° field-of-view capturing the macula, optic disc, and superior/inferior arcades is sufficient for ETDRS-aligned grading.

Referral Thresholds:
• Mild-Moderate NPDR: Ophthalmologist review within 6 months
• Severe NPDR or PDR: Urgent referral within 1–2 weeks
• Diabetic Macular Edema (DME): Prompt anti-VEGF evaluation`,
    keyTakeaways: ['Type 2 DM patients need screening at diagnosis', 'Non-mydriatic cameras suffice for primary care screening', 'Severe NPDR warrants urgent specialist referral within 2 weeks'],
  },
  {
    id: 3, category: 'Fundus Imaging', icon: Camera, readTime: '6 min read',
    title: 'Fundus Photography: Clinical Quality Standards',
    summary: 'Technical specifications for acquiring clinical-grade fundus photographs — focus, illumination, field of view, and common artifact identification.',
    content: `High-quality fundus photography is the prerequisite for reliable AI-assisted DR screening. NetrX evaluates 5 quality metrics before running AI analysis.

Quality Metrics:
1. Focus & Sharpness — Vessel edges must be crisp (minimum 90% focus score)
2. Illumination Uniformity — No bright spots or dark corners
3. Field of View (FOV) — Minimum 45° covering disc and macula
4. Contrast — Sufficient vessel-background contrast
5. Artifact Score — No lens reflections, dust, or patient motion blur

Common Causes of Poor Quality:
• Patient blink or movement during capture
• Incorrect pupil alignment
• Insufficient pupil dilation
• Lens contamination or camera artifact
• Over/under exposure from incorrect flash settings

Resolution Requirements:
NetrX requires a minimum 1024×1024 pixel resolution. Higher resolution (2048×2048) is preferred for sub-pixel microaneurysm detection.`,
    keyTakeaways: ['Minimum 45° FOV captures clinically necessary retinal anatomy', 'Image quality check prevents unreliable AI predictions', 'CLAHE enhancement can partially compensate for underexposure'],
  },
  {
    id: 4, category: 'AI & Grad-CAM', icon: Cpu, readTime: '7 min read',
    title: 'Explainable AI in Retinal Imaging: How Grad-CAM Works',
    summary: 'A technical deep-dive into Gradient-weighted Class Activation Mapping (Grad-CAM) — how it generates visual saliency maps to explain AI DR predictions.',
    content: `Gradient-weighted Class Activation Mapping (Grad-CAM) is an explainability technique that produces visual heatmaps showing which regions of an image most influenced a neural network's classification decision.

How Grad-CAM Works in NetrX:
1. The fundus image is processed through the EfficientNet-B5 backbone
2. Forward pass produces a DR severity prediction
3. Grad-CAM computes gradients of the predicted class score with respect to the final convolutional feature maps
4. Gradients are globally pooled to produce importance weights
5. A weighted sum of feature maps is passed through ReLU to produce the heatmap
6. The heatmap is upsampled to the original image resolution

Clinical Interpretation:
Red/orange regions in the Grad-CAM overlay represent areas that most strongly contributed to the DR prediction. For Moderate NPDR, the model typically highlights the macula (microaneurysms, hard exudates) and superior temporal arcades.

Trust Calibration:
Grad-CAM explanations help clinicians verify that the AI is attending to pathologically meaningful regions — not spurious imaging artifacts — improving clinical trust in the AI decision.`,
    keyTakeaways: ['Grad-CAM reveals the "why" behind AI predictions for clinical trust', 'Activation heatmaps should align with known pathological DR regions', 'Unexplained activations in image margins warrant clinical skepticism'],
  },
  {
    id: 5, category: 'Image Quality', icon: Activity, readTime: '3 min read',
    title: 'Why Image Quality Matters for AI Accuracy',
    summary: 'How blurry, underexposed, or improperly framed fundus images can cause false negatives or false positives in AI-based DR screening.',
    content: `Deep learning models for DR screening are highly sensitive to image quality degradation. Unlike human graders who can partially compensate for poor images, neural networks trained on clinical-grade photographs may fail silently on suboptimal inputs.

Impact of Poor Quality:
• Blurry images → Microaneurysms missed → False negatives (under-staging)
• Underexposure → Contrast features lost → Grade 0 predicted for Grade 2 DR
• Overexposure → Hard exudates obscured → False negative for CSME
• Partial FOV → Missing peripheral DR signs → Under-grading

NetrX Quality Gate:
NetrX implements a pre-analysis quality assessment module that scores 5 metrics. Images scoring below 70% overall are flagged for retake before AI inference — preventing unreliable predictions.

Clinical Recommendation:
Always validate fundus camera calibration, clean optical surfaces regularly, and ensure patient cooperation for blink-free capture.`,
    keyTakeaways: ['Poor images cause AI false negatives — not just low confidence', 'NetrX rejects images scoring below the 70% quality threshold', 'Camera maintenance is as important as model accuracy'],
  },
  {
    id: 6, category: 'AI & Grad-CAM', icon: Brain, readTime: '9 min read',
    title: 'Multi-Scale Neural Networks for Microaneurysm Detection',
    summary: 'Technical analysis of Feature Pyramid Network architectures for detecting 10-micron retinal microaneurysms using EfficientNet + FPN.',
    content: `Retinal microaneurysms represent the earliest clinical hallmark of Diabetic Retinopathy, typically measuring only 10–100 microns in diameter.

NetrX Multi-Scale Architecture:
• Feature Pyramid Networks (FPN) combined with EfficientNet-B5 backbones
• Analyzes fundus images across 4 spatial resolutions simultaneously
• Maintains sensitivity for isolated dot-blot microaneurysms while filtering vessel bifurcations
• Achieves 98.4% sensitivity on the MESSIDOR-2 benchmark dataset

Training Strategy:
The ensemble model (EfficientNet-B5 + ResNet50) is trained using a combination of binary cross-entropy and focal loss to handle class imbalance between DR and no-DR cases. Transfer learning from ImageNet weights is used as initialization, followed by fine-tuning on APTOS-2019, MESSIDOR, and EyePACS datasets.

Inference Optimization:
Model quantization (INT8) and ONNX export enable sub-2-second inference on clinical hardware, making real-time screening feasible in point-of-care settings.`,
    keyTakeaways: ['Multi-scale FPN captures sub-pixel microaneurysms without downsampling loss', 'Focal loss addresses DR class imbalance in training', 'ONNX quantization enables real-time point-of-care inference'],
  },
];

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  const filtered = selectedCategory === 'All'
    ? RESOURCES
    : RESOURCES.filter((r) => r.category === selectedCategory);

  return (
    <div className="w-full">
      <PageHeader
        eyebrow="EDUCATIONAL & CLINICAL RESOURCES"
        title="Knowledge Base & Ophthalmic AI Research"
        description="Explore clinical guidelines, fundus image quality standards, Grad-CAM explainability, and primary care DR screening protocols."
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-12 md:py-16 space-y-12">

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0A1128] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-rose-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((res) => {
            const Icon = res.icon;
            return (
              <div
                key={res.id}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FA495C] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                      {res.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{res.readTime}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-[#FA495C] transition-colors">
                    <Icon className="w-5 h-5 text-[#FA495C] group-hover:text-white transition-colors stroke-[2]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0A1128] group-hover:text-[#FA495C] transition-colors leading-snug">
                    {res.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{res.summary}</p>
                </div>
                <div className="pt-6 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveArticle(res)}
                    className="text-xs font-extrabold text-[#FA495C] hover:text-[#E11D48] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    Read Full Guide <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Article Modal */}
        {activeArticle && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1128]/70 backdrop-blur-md"
            onClick={() => setActiveArticle(null)}
          >
            <div
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FA495C] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    {activeArticle.category}
                  </span>
                  <h3 className="font-extrabold text-xl text-[#0A1128] mt-2 leading-tight max-w-lg">
                    {activeArticle.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 ml-4 flex-shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed whitespace-pre-line flex-1">
                <div>{activeArticle.content}</div>
                <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-3">
                  <h4 className="font-bold text-[#0A1128] text-xs uppercase tracking-wider">Key Clinical Takeaways:</h4>
                  <ul className="space-y-2">
                    {activeArticle.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FA495C] flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Modal Footer */}
              <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>NetrX Clinical Knowledge Base</span>
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="bg-[#0A1128] text-white px-5 py-2 rounded-full font-semibold cursor-pointer"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
