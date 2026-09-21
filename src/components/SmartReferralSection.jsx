import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const FLOW_STEPS = [
  { label: 'Screening', sub: 'Image analysis complete' },
  { label: 'Risk Assessment', sub: 'Severity classification' },
  { label: 'Referral Priority', sub: 'Urgency determination' },
  { label: 'Specialist Review', sub: 'Clinical follow-up' },
];

const REFERRAL_TIERS = [
  {
    priority: 'ROUTINE',
    icon: '🟢',
    colorClass: 'border-emerald-200 bg-emerald-50/60',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    title: 'Low-Risk Result',
    desc: 'Screening result indicates low risk. Standard follow-up according to local diabetes management guidelines.',
    meta: 'Scheduled ophthalmic review',
  },
  {
    priority: 'PRIORITY',
    icon: '🟡',
    colorClass: 'border-amber-200 bg-amber-50/60 ring-2 ring-amber-100',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    title: 'Timely Evaluation',
    desc: 'Screening result indicates changes that may benefit from timely ophthalmic evaluation.',
    meta: 'Within recommended timeframe',
  },
  {
    priority: 'URGENT',
    icon: '🔴',
    colorClass: 'border-red-200 bg-red-50/60',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    title: 'Prompt Attention',
    desc: 'Screening result indicates findings that may require prompt specialist attention.',
    meta: 'Expedited specialist referral',
  },
];

export default function SmartReferralSection() {
  const navigate = useNavigate();
  const [ref, isVisible] = useScrollReveal();

  return (
    <section
      id="referral"
      className="relative w-full py-24 px-4 sm:px-8 lg:px-14 bg-white overflow-hidden"
    >
      <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
      <div aria-hidden="true" className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-rose-50/60 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-[#FA495C] text-[11px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            Referral Support
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0A1128] leading-tight">
            From Detection to Action.
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
            Support smarter referral decisions with structured screening insights.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-0 mb-16">
          {FLOW_STEPS.map((step, i) => {
            const isLast = i === FLOW_STEPS.length - 1;
            return (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center text-center px-4 py-3">
                  <div className="w-12 h-12 rounded-full bg-[#0A1128] text-white text-sm font-extrabold flex items-center justify-center mb-2 shadow-md">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="text-sm font-bold text-[#0A1128]">{step.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{step.sub}</div>
                </div>
                {!isLast && (
                  <div className="hidden sm:flex items-center text-slate-200 sm:rotate-0 rotate-90">
                    <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                      <line x1="0" y1="8" x2="24" y2="8" stroke="#E2E8F0" strokeWidth="1.5"/>
                      <path d="M22 3L30 8L22 13" stroke="#FA495C" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Referral tier cards */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {REFERRAL_TIERS.map((tier, i) => (
            <div
              key={tier.priority}
              className={`rounded-3xl p-7 border-2 ${tier.colorClass} transition-all duration-300 hover:-translate-y-1 hover:shadow-md
                ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl" role="img" aria-hidden="true">{tier.icon}</span>
                <span className={`text-[10px] font-extrabold uppercase tracking-widest border px-2.5 py-1 rounded-full ${tier.badgeClass}`}>
                  {tier.priority}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#0A1128] mb-2">{tier.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{tier.desc}</p>
              <div className="text-xs text-slate-400 font-medium border-t border-current/10 pt-3">
                {tier.meta}
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 max-w-2xl mx-auto mb-10 bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Referral categories shown here are illustrative workflow examples and do not
            replace clinical judgment. Actual referral decisions should be made by qualified
            healthcare professionals.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/referral')}
            className="inline-flex items-center gap-2 bg-[#FA495C] text-white px-7 py-3.5 rounded-full font-semibold text-base hover:bg-[#E11D48] transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-rose-500/20"
          >
            Explore Referral Workflow <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
