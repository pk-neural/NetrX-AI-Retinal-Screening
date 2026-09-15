import React from 'react';
import { Eye, Clock, AlertCircle } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const PROBLEMS = [
  {
    num: '01',
    icon: Eye,
    title: 'Silent Progression',
    desc: 'Diabetic Retinopathy can develop and advance before any noticeable change in vision, making routine screening essential for early identification.',
    gradient: 'from-rose-50/80 to-pink-50/60',
    border: 'border-rose-100/70',
    iconBg: 'bg-rose-100',
    iconColor: 'text-[#FA495C]',
    numColor: 'text-rose-100',
  },
  {
    num: '02',
    icon: Clock,
    title: 'Limited Screening Access',
    desc: 'Access to specialist retinal screening can be difficult in many settings, particularly in resource-limited or rural environments.',
    gradient: 'from-indigo-50/80 to-slate-50/60',
    border: 'border-indigo-100/70',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-[#0A1128]',
    numColor: 'text-indigo-100',
  },
  {
    num: '03',
    icon: AlertCircle,
    title: 'Delayed Referral',
    desc: 'Identifying which patients need urgent specialist attention can be challenging without structured, AI-assisted screening support.',
    gradient: 'from-amber-50/80 to-orange-50/60',
    border: 'border-amber-100/70',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    numColor: 'text-amber-100',
  },
];

export default function ProblemSection() {
  const [ref, isVisible] = useScrollReveal();

  return (
    <section
      id="problem"
      className="relative w-full py-24 px-4 sm:px-8 lg:px-14 bg-white overflow-hidden"
    >
      {/* Subtle decorative gradient blob */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rose-50/60 blur-3xl pointer-events-none"
      />

      {/* Top section divider */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FA495C]/15 to-transparent"
      />

      <div className="max-w-[1440px] mx-auto">

        {/* Section heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-[#FA495C] text-[11px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA495C] inline-block animate-blink-dot" />
            The Challenge
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0A1128] leading-tight">
            Diabetic Retinopathy<br />Can Be Silent.
          </h2>
          <p className="mt-5 text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Diabetic Retinopathy can progress without noticeable symptoms. Early screening
            can help identify risk before vision is significantly affected.
          </p>
        </div>

        {/* Problem cards */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.num}
                className={`relative rounded-3xl p-8 bg-gradient-to-br ${p.gradient} border ${p.border}
                  shadow-sm hover:shadow-lg transition-all duration-350 hover:-translate-y-1.5
                  ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Background number */}
                <div className={`absolute top-5 right-6 text-6xl font-extrabold select-none leading-none ${p.numColor}`}>
                  {p.num}
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl ${p.iconBg} flex items-center justify-center mb-5 relative z-10`}>
                  <Icon className={`w-6 h-6 ${p.iconColor}`} strokeWidth={2} />
                </div>

                <h3 className="text-xl font-bold text-[#0A1128] mb-3 relative z-10">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed relative z-10">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
