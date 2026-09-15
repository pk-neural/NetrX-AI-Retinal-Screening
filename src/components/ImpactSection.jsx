import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const IMPACT_STATS = [
  {
    label: 'Earlier Screening',
    desc: 'Identify risk sooner through structured, AI-assisted retinal image analysis.',
    icon: '👁️',
    arrow: '→',
    outcome: 'Identify risk sooner',
  },
  {
    label: 'Clearer Insights',
    desc: 'Structured screening results support understanding of potential retinal changes.',
    icon: '💡',
    arrow: '→',
    outcome: 'Understand screening outcomes',
  },
  {
    label: 'Smarter Follow-Up',
    desc: 'Risk-stratified output supports appropriate and timely clinical referral decisions.',
    icon: '🏥',
    arrow: '→',
    outcome: 'Support appropriate referral',
  },
];

export default function ImpactSection() {
  const [ref, isVisible] = useScrollReveal();

  return (
    <section
      id="impact"
      className="relative w-full py-24 px-4 sm:px-8 lg:px-14 overflow-hidden min-h-[500px] flex items-center"
    >
      {/* Background — eye image with dark overlay */}
      <div className="absolute inset-0">
        <img
          src="/images/photo-1627502208346-b835b72c0f05.avif"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'grayscale(30%) brightness(0.22) saturate(1.3)' }}
        />
        {/* Deep navy overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(6,13,31,0.97) 0%, rgba(10,17,40,0.92) 50%, rgba(30,0,10,0.88) 100%)',
          }}
        />
        {/* Subtle coral glow */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(250,73,92,0.12) 0%, transparent 70%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full">

        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-[#FA495C] text-[11px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA495C] inline-block animate-blink-dot" />
            Impact
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Early Detection Can<br />
            <span className="text-[#FA495C]">Change the Journey.</span>
          </h2>
          <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Screen earlier.&nbsp; Identify risk sooner.&nbsp; Connect patients to appropriate care.
          </p>
        </div>

        {/* Impact statements */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {IMPACT_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-3xl p-7 border border-white/10 bg-white/5 backdrop-blur-sm
                hover:bg-white/10 hover:border-[#FA495C]/30 transition-all duration-350 group
                ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="text-3xl mb-4" role="img" aria-hidden="true">{stat.icon}</div>

              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-extrabold text-lg">{stat.label}</h3>
                <span className="text-[#FA495C] font-bold text-lg">{stat.arrow}</span>
              </div>

              <div className="text-[#FA495C] font-bold text-sm mb-3">{stat.outcome}</div>

              <p className="text-slate-400 text-sm leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Note — no unsupported stats */}
        <div className="text-center mt-10">
          <p className="text-slate-500 text-xs max-w-lg mx-auto leading-relaxed">
            NetrX is an AI-assisted screening and referral-support concept. Impact outcomes
            are illustrative and should not be interpreted as clinical guarantees or medical claims.
          </p>
        </div>
      </div>
    </section>
  );
}
