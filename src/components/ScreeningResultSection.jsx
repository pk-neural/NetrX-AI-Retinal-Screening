import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const RESULT_FIELDS = [
  { label: 'Status', value: 'SCREENING COMPLETE', tag: true, tagColor: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'Severity Grade', value: 'MODERATE', tag: true, tagColor: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: 'Confidence Score', value: '87.4%', tag: false },
  { label: 'Image Quality', value: 'EXCELLENT', tag: true, tagColor: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'Risk Assessment', value: 'ELEVATED', tag: true, tagColor: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Recommendation', value: 'Ophthalmic Evaluation Advised', tag: false },
];

export default function ScreeningResultSection() {
  const navigate = useNavigate();
  const [ref, isVisible] = useScrollReveal();

  return (
    <section
      id="screening-result"
      className="relative w-full py-24 px-4 sm:px-8 lg:px-14 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F0F4FF 100%)' }}
    >
      <div aria-hidden="true" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full bg-[#FA495C]/4 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-500 text-[11px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            Screening Results
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0A1128] leading-tight">
            Clear Results. Better Decisions.
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
            NetrX generates a structured screening result card to support clear communication of findings.
          </p>
        </div>

        {/* Result card */}
        <div
          ref={ref}
          className={`max-w-2xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

            {/* Card Header */}
            <div className="bg-[#0A1128] px-4 sm:px-8 py-6 flex items-center justify-between">
              <div>
                <img
                  src="/images/netrx-logo-transparent.png"
                  alt="NetrX"
                  className="h-9 w-auto object-contain"
                />
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1.5">
                  Screening Result Summary
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Report ID</div>
                <div className="text-sm font-extrabold text-[#FA495C]">NETRX-DEMO-2026</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Sample Data Only</div>
              </div>
            </div>

            {/* DEMO banner */}
            <div className="bg-amber-50 border-b border-amber-100 px-4 sm:px-8 py-2.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs text-amber-700 font-medium">
                DEMO RESULT — All values shown are sample data for interface demonstration only.
              </span>
            </div>

            {/* Fields */}
            <div className="px-4 sm:px-8 py-6 space-y-0">
              {RESULT_FIELDS.map((field, i) => (
                <div
                  key={field.label}
                  className={`flex items-center justify-between py-4 ${i < RESULT_FIELDS.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <span className="text-sm text-slate-400 font-medium">{field.label}</span>
                  {field.tag ? (
                    <span className={`text-xs font-extrabold uppercase tracking-wide px-3 py-1 rounded-full border ${field.tagColor}`}>
                      {field.value}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-[#0A1128]">{field.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Safety note */}
            <div className="px-4 sm:px-8 pb-4">
              <div className="flex items-start gap-2.5 text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3">
                <ShieldCheck className="w-4 h-4 text-[#FA495C] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  NetrX provides AI-assisted screening support. Results should be reviewed by a
                  qualified healthcare professional. This is not a substitute for clinical judgment.
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-4 sm:px-8 pb-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate('/results')}
                className="flex-1 bg-[#FA495C] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#E11D48] transition-all cursor-pointer shadow-md shadow-rose-500/20"
              >
                <ExternalLink className="w-4 h-4" /> View Detailed Result
              </button>
              <button
                type="button"
                onClick={() => navigate('/referral')}
                className="flex-1 border border-slate-200 text-[#0A1128] py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#0A1128] hover:text-white hover:border-[#0A1128] transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
