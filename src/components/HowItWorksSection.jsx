import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Eye, Activity, FileText, ArrowRight, AlertCircle } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const QUALITY_DEMO = [
  { label: 'Focus', val: 92 },
  { label: 'Illumination', val: 87 },
  { label: 'Field of View', val: 95 },
  { label: 'Contrast', val: 89 },
];

function QualityBar({ label, val }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FA495C]/70 rounded-full transition-all duration-1000"
          style={{ width: `${val}%` }}
        />
      </div>
      <span className="text-xs font-bold text-[#0A1128] w-10 text-right">{val}%</span>
    </div>
  );
}

const STEPS = [
  {
    num: '01',
    icon: Upload,
    title: 'Upload a Retinal Image',
    desc: 'Start the NetrX workflow by uploading a fundus photograph. Supported formats include JPEG, PNG, and TIFF.',
    detail: null,
    action: { label: 'Start Screening →', path: '/screening' },
    accent: '#FA495C',
  },
  {
    num: '02',
    icon: Eye,
    title: 'Check Image Quality',
    desc: 'NetrX evaluates retinal image quality before analysis to identify images that may require better capture.',
    detail: 'quality',
    action: { label: 'See Quality Details →', path: '/quality' },
    accent: '#6366F1',
  },
  {
    num: '03',
    icon: Activity,
    title: 'Analyze With AI',
    desc: 'The AI screening engine classifies the retinal image and provides a severity result with a confidence score.',
    detail: 'screening',
    action: { label: 'Try AI Screening →', path: '/screening' },
    accent: '#0A1128',
  },
  {
    num: '04',
    icon: FileText,
    title: 'Support Smarter Referral',
    desc: 'NetrX generates structured screening insights and referral guidance to support appropriate clinical follow-up.',
    detail: 'referral',
    action: { label: 'Explore Workflow →', path: '/screening' },
    accent: '#FA495C',
  },
];

export default function HowItWorksSection() {
  const navigate = useNavigate();
  const [ref, isVisible] = useScrollReveal();

  return (
    <section
      id="how-it-works"
      className="relative w-full py-24 px-4 sm:px-8 lg:px-14 bg-white overflow-hidden"
    >
      <div aria-hidden="true" className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-slate-50 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto">

        {/* Heading */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            The Workflow
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0A1128] leading-tight">
            From Image to Insight.
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
            Four clear steps from fundus image upload to structured referral support.
          </p>
        </div>

        {/* Steps */}
        <div ref={ref} className="space-y-16 lg:space-y-24">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 === 0;

            return (
              <div
                key={step.num}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-center
                  ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Content */}
                <div className="flex-1 space-y-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${step.accent}15`, border: `1.5px solid ${step.accent}25` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: step.accent }} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: step.accent }}>
                        Step {step.num}
                      </div>
                      <h3 className="text-2xl font-extrabold text-[#0A1128] leading-tight">{step.title}</h3>
                    </div>
                  </div>

                  <p className="text-slate-500 leading-relaxed text-base">{step.desc}</p>

                  <button
                    type="button"
                    onClick={() => navigate(step.action.path)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#FA495C] hover:gap-3 transition-all cursor-pointer group"
                  >
                    {step.action.label}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

                {/* Visual Card */}
                <div className="flex-1 w-full max-w-md lg:max-w-none">
                  {step.detail === 'quality' && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-bold text-[#0A1128]">Quality Report</div>
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          PASS
                        </div>
                      </div>
                      {QUALITY_DEMO.map((m) => <QualityBar key={m.label} {...m} />)}
                      <div className="pt-2 border-t border-slate-50 flex items-center gap-2 text-[11px] text-slate-400">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Sample quality values — not clinical measurements
                      </div>
                    </div>
                  )}

                  {step.detail === 'screening' && (
                    <div className="bg-[#0A1128] rounded-2xl p-6 space-y-4 text-white">
                      <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#FA495C]">
                        AI Screening — SAMPLE RESULT
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Severity</div>
                          <div className="text-2xl font-extrabold text-white">Moderate</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Confidence Score</div>
                          <div className="flex items-end gap-2">
                            <span className="text-3xl font-extrabold text-[#FA495C]">87.4%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FA495C] rounded-full" style={{ width: '87.4%' }} />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                        Demonstration result for interface preview. Not a medical diagnosis.
                      </p>
                    </div>
                  )}

                  {step.detail === 'referral' && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                      <div className="text-sm font-bold text-[#0A1128] mb-3">Referral Support — SAMPLE</div>
                      {[
                        { label: 'Screening Result', val: 'Moderate DR' },
                        { label: 'Risk Level', val: 'Elevated' },
                        { label: 'Referral Priority', val: 'Ophthalmic Evaluation Advised' },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <span className="text-xs text-slate-400">{row.label}</span>
                          <span className="text-xs font-bold text-[#0A1128]">{row.val}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Illustrative sample — not clinical guidance
                      </div>
                    </div>
                  )}

                  {step.detail === null && (
                    <div
                      className="rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[180px]"
                      style={{ background: `${step.accent}08`, border: `1.5px dashed ${step.accent}20` }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: `${step.accent}15` }}
                      >
                        <Icon className="w-8 h-8" style={{ color: step.accent }} strokeWidth={1.5} />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-[#0A1128]">Upload &amp; Begin</div>
                        <div className="text-xs text-slate-400 mt-1">JPEG · PNG · TIFF supported</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/screening')}
                        className="bg-[#FA495C] text-white text-xs font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-[#E11D48] transition-colors cursor-pointer"
                      >
                        Start Screening <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
