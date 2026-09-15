import React from 'react';
import { Zap, Eye, GitBranch, FileText } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const ADVANTAGES = [
  {
    icon: Zap,
    title: 'Fast Screening',
    desc: 'Designed for a streamlined retinal screening workflow that fits into busy clinical environments.',
    accent: '#FA495C',
    bg: 'from-rose-50/70 to-pink-50/50',
    border: 'border-rose-100/70',
  },
  {
    icon: Eye,
    title: 'AI-Powered',
    desc: 'Machine-learning assisted retinal image analysis designed to support structured screening workflows.',
    accent: '#6366F1',
    bg: 'from-indigo-50/70 to-blue-50/50',
    border: 'border-indigo-100/70',
  },
  {
    icon: GitBranch,
    title: 'Explainable',
    desc: 'Visual evidence can help users understand which regions of a retinal image influenced an AI prediction.',
    accent: '#0A1128',
    bg: 'from-slate-50/70 to-gray-50/50',
    border: 'border-slate-200/70',
  },
  {
    icon: FileText,
    title: 'Smarter Referral',
    desc: 'Structured screening insights support appropriate follow-up decisions and clinical communication.',
    accent: '#F59E0B',
    bg: 'from-amber-50/70 to-orange-50/50',
    border: 'border-amber-100/70',
  },
];

export default function AdvantagesSection() {
  const [ref, isVisible] = useScrollReveal();

  return (
    <section
      id="advantages"
      className="relative w-full py-24 px-4 sm:px-8 lg:px-14 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #F0F4FF 100%)' }}
    >
      <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-white/60 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-500 text-[11px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            NetrX Advantages
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0A1128] leading-tight">
            Why <span className="text-[#FA495C]">NetrX</span>?
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
            Purpose-built for retinal screening — from image quality to referral support.
          </p>
        </div>

        {/* Cards */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADVANTAGES.map((adv, i) => {
            const Icon = adv.icon;
            return (
              <div
                key={adv.title}
                className={`relative rounded-3xl p-7 bg-gradient-to-br ${adv.bg} border ${adv.border}
                  hover:shadow-xl hover:-translate-y-2 transition-all duration-350 group cursor-default
                  ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: `${adv.accent}15`, border: `1.5px solid ${adv.accent}20` }}
                >
                  <Icon className="w-7 h-7" style={{ color: adv.accent }} strokeWidth={1.8} />
                </div>

                <h3 className="text-lg font-extrabold text-[#0A1128] mb-3 group-hover:text-[#FA495C] transition-colors duration-300">
                  {adv.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{adv.desc}</p>

                {/* Hover accent line */}
                <div
                  className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ background: adv.accent }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
