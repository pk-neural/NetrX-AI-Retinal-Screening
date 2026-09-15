import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Eye, Cpu, BarChart2, Brain, Users, FileText, CheckCircle, ArrowRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const WORKFLOW_STEPS = [
  {
    id: 1, icon: Camera, name: 'Fundus Image Capture',
    description: 'The clinician captures a high-resolution digital fundus photograph using a non-mydriatic or mydriatic fundus camera. The image is uploaded directly to NetrX via the web interface.',
    technicalDetails: ['DICOM / JPEG / PNG / TIFF support', '45° or 30° field of view', 'Minimum 1024×1024 px resolution', 'Real-time upload progress'],
    output: 'Raw Fundus Image',
    short: 'High-res retinal image capture',
  },
  {
    id: 2, icon: Eye, name: 'Image Quality Assessment',
    description: 'NetrX evaluates the uploaded fundus image across 5 clinical quality metrics before initiating AI analysis — ensuring only diagnostic-grade images proceed.',
    technicalDetails: ['Focus & sharpness scoring', 'Illumination uniformity check', 'Field-of-view coverage assessment', 'Contrast ratio measurement', 'Artifact detection'],
    output: 'Quality Score + PASS/FAIL',
    short: '5-metric automated quality gate',
  },
  {
    id: 3, icon: Cpu, name: 'Image Preprocessing',
    description: 'Accepted images undergo automated preprocessing to standardize quality: CLAHE enhancement, vessel contrast boosting, color normalization, and adaptive histogram equalization.',
    technicalDetails: ['CLAHE retinal enhancement', 'Vessel contrast normalization', 'Color space standardization', 'Adaptive histogram equalization'],
    output: 'Preprocessed Retinal Tensor',
    short: 'Clinical-grade image normalization',
  },
  {
    id: 4, icon: Brain, name: 'AI Analysis Engine',
    description: 'The preprocessed image is passed through NetrX\'s ensemble deep learning model — EfficientNet-B5 and ResNet50 trained on MESSIDOR, APTOS, and EyePACS datasets.',
    technicalDetails: ['EfficientNet-B5 + ResNet50 ensemble', 'Multi-scale Feature Pyramid Network', 'Transfer learning from 80K+ fundus images', 'Inference: 1.84 seconds average'],
    output: 'DR Probability Distribution',
    short: 'Ensemble neural network inference',
  },
  {
    id: 5, icon: BarChart2, name: 'DR Severity Classification',
    description: 'AI output is mapped to the 5-stage ETDRS scale: No DR, Mild NPDR, Moderate NPDR, Severe NPDR, and Proliferative DR. Confidence scores are included.',
    technicalDetails: ['Grade 0: No DR', 'Grade 1: Mild NPDR', 'Grade 2: Moderate NPDR', 'Grade 3: Severe NPDR', 'Grade 4: Proliferative DR'],
    output: 'ETDRS Severity Grade + Confidence',
    short: '5-stage ETDRS classification',
  },
  {
    id: 6, icon: Brain, name: 'Explainable AI (Grad-CAM)',
    description: 'NetrX generates Gradient-weighted Class Activation Maps (Grad-CAM) to visually explain the AI\'s decision — highlighting suspicious retinal regions that influenced the prediction.',
    technicalDetails: ['Grad-CAM visualization overlay', 'Lesion hotspot localization', 'Pathological region annotation', 'Explainability confidence scores'],
    output: 'Saliency Heatmap + Annotations',
    short: 'Visual AI explainability heatmap',
  },
  {
    id: 7, icon: Users, name: 'Clinical Review',
    description: 'The clinician reviews the AI prediction alongside the Grad-CAM visualization. The system supports clinician-in-the-loop override — the final clinical decision remains with the healthcare professional.',
    technicalDetails: ['Side-by-side original + heatmap view', 'Clinician override toggle', 'Annotation capability', 'Review timestamp logging'],
    output: 'Clinician-Reviewed Result',
    short: 'Clinician-in-the-loop review',
  },
  {
    id: 8, icon: FileText, name: 'Referral Recommendation',
    description: 'Based on DR severity and risk assessment, NetrX generates a structured referral recommendation with priority level, suggested timeline, and a printable clinical report.',
    technicalDetails: ['4-tier referral system', 'Automated report generation', 'Print & PDF export', 'HIPAA-compliant data handling'],
    output: 'Referral Letter + Clinical Report',
    short: 'Auto-generated clinical referral',
  },
];

export default function SolutionPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="w-full">
      <PageHeader
        eyebrow="NETRX AI PIPELINE"
        title="Complete DR Screening & Referral Solution"
        description="NetrX follows a rigorous 8-step clinical AI pipeline — from fundus image ingestion through DR severity classification, explainability, and structured referral recommendation."
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-12 md:py-16 space-y-16">

        {/* Interactive Pipeline */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#FA495C] uppercase tracking-widest">WORKFLOW STEPS</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128]">Interactive Pipeline Timeline</h2>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium">
              Click any step to inspect technical details
            </span>
          </div>

          {/* Step Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {WORKFLOW_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.id}
                  type="button"
                  id={`step-btn-${step.id}`}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3.5 rounded-2xl flex flex-col items-center text-center transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-[#0A1128] text-white border-[#0A1128] shadow-lg scale-105'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-xs ${
                    isActive ? 'bg-[#FA495C] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {step.id}
                  </div>
                  <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-[#FA495C]' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold leading-tight line-clamp-2">{step.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Detail */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FA495C] flex items-center justify-center font-bold">
                  {React.createElement(WORKFLOW_STEPS[activeStep].icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <span className="text-xs font-extrabold text-[#FA495C] uppercase tracking-widest">STEP {WORKFLOW_STEPS[activeStep].id} OF 8</span>
                  <h3 className="text-2xl font-extrabold text-[#0A1128]">{WORKFLOW_STEPS[activeStep].name}</h3>
                </div>
              </div>
              <p className="text-slate-600 text-base leading-relaxed">{WORKFLOW_STEPS[activeStep].description}</p>
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold text-[#0A1128] uppercase tracking-wider">Technical Specifications:</h4>
                <ul className="space-y-2">
                  {WORKFLOW_STEPS[activeStep].technicalDetails.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-[#FA495C] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-3 text-xs pt-2">
                <span className="font-bold text-slate-500">Output Artifact:</span>
                <span className="bg-rose-50 text-[#FA495C] px-3 py-1 rounded-full font-bold border border-rose-200">
                  {WORKFLOW_STEPS[activeStep].output}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#0A1128] text-[#FA495C] flex items-center justify-center shadow-lg">
                {React.createElement(WORKFLOW_STEPS[activeStep].icon, { className: 'w-10 h-10 stroke-[2]' })}
              </div>
              <span className="font-extrabold text-sm text-[#0A1128]">{WORKFLOW_STEPS[activeStep].name}</span>
              <p className="text-xs text-slate-500">{WORKFLOW_STEPS[activeStep].short}</p>
              <div className="w-full pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  className="text-xs font-semibold text-slate-600 disabled:opacity-40 hover:text-[#FA495C] cursor-pointer"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  disabled={activeStep === WORKFLOW_STEPS.length - 1}
                  onClick={() => setActiveStep(Math.min(WORKFLOW_STEPS.length - 1, activeStep + 1))}
                  className="text-xs font-semibold text-[#FA495C] disabled:opacity-40 hover:underline cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Flow Grid */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[#0A1128]">Complete Diagnostic Pipeline Flow</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {WORKFLOW_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3 cursor-pointer"
                  onClick={() => setActiveStep(step.id - 1)}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-[#FA495C] font-bold text-xs flex items-center justify-center">
                      {step.id}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-sm text-[#0A1128]">{step.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.short}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#0A1128] text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-2xl font-extrabold">Test NetrX AI Pipeline Live</h3>
            <p className="text-slate-300 text-sm mt-1">Upload your fundus scan or select a demo sample to see quality checks and DR classification in action.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/screening')}
            className="bg-[#FA495C] hover:bg-[#E11D48] text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-rose-500/30 flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer"
          >
            Start Screening Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
