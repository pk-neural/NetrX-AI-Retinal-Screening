import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, ArrowRight, Upload, Eye, CheckCircle2,
  Activity, FileText, Zap
} from 'lucide-react';

const WORKFLOW_STEPS = [
  { step: 1, icon: Upload, title: 'Upload Fundus Image', desc: 'Capture or upload a retinal photograph directly into NetrX.' },
  { step: 2, icon: Eye,    title: 'Image Quality Check', desc: 'Automated quality assessment ensures clinical-grade image fidelity.' },
  { step: 3, icon: Zap,    title: 'AI DR Analysis', desc: 'EfficientNet + ResNet ensemble classifies DR severity in under 3 seconds.' },
  { step: 4, icon: Activity, title: 'Explainability (Grad-CAM)', desc: 'Visual heatmaps highlight suspicious retinal lesions for clinician review.' },
  { step: 5, icon: FileText, title: 'Referral Report', desc: 'Auto-generated referral recommendation with printable clinical report.' },
];

export default function WatchDemoModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  // Escape key to close
  React.useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1128]/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FA495C]">INTERACTIVE DEMO</span>
            <h2 className="text-xl font-extrabold text-[#0A1128] mt-1">NetrX Workflow Overview</h2>
          </div>
          <button
            type="button"
            onClick={(e) => {
              console.log("X BUTTON CLICKED");
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#FA495C] cursor-pointer z-10 relative"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Video Player */}
        <div className="w-full bg-black relative flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <video 
            src="/videos/netrx-demo.mp4"
            className="w-full max-h-[60vh] object-contain outline-none"
            controls
            controlsList="nodownload"
            playsInline
            preload="metadata"
            poster="/images/hero-fundus.png"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => { onClose(); navigate('/screening'); }}
            className="flex-1 bg-[#FA495C] hover:bg-[#E11D48] text-white px-6 py-3 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Start Live Demo <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => { onClose(); navigate('/solution'); }}
            className="flex-1 border border-slate-200 text-slate-600 hover:text-[#FA495C] hover:border-rose-300 px-6 py-3 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            View Solution Details
          </button>
        </div>
      </div>
    </div>
  );
}
