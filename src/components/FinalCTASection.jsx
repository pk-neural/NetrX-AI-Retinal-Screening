import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function FinalCTASection() {
  const navigate = useNavigate();
  const [ref, isVisible] = useScrollReveal({ threshold: 0.2 });

  return (
    <section
      id="cta"
      className="relative w-full py-28 px-4 sm:px-8 lg:px-14 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0A1128 0%, #14213D 50%, #1E0612 100%)',
      }}
    >
      {/* Decorative elements */}
      <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FA495C]/20 to-transparent pointer-events-none" />
      <div aria-hidden="true" className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FA495C]/8 blur-3xl pointer-events-none" />
      <div aria-hidden="true" className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-indigo-500/6 blur-3xl pointer-events-none" />

      {/* Grid pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div
        ref={ref}
        className={`max-w-[1440px] mx-auto text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/images/netrx-logo-transparent.png"
            alt="NetrX — See Better. Detect Earlier. Refer Smarter."
            className="w-[220px] sm:w-[250px] md:w-[270px] h-auto object-contain"
          />
        </div>

        {/* Tagline */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-4 h-4 text-[#FA495C]" />
          <span className="text-[11px] font-extrabold text-[#FA495C] uppercase tracking-widest">
            See Better. Detect Earlier. Refer Smarter.
          </span>
          <Sparkles className="w-4 h-4 text-[#FA495C]" />
        </div>

        {/* Main heading */}
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
          Ready to See<br />
          <span className="text-[#FA495C]">Smarter?</span>
        </h2>

        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
          Experience the NetrX retinal screening workflow — from fundus image upload
          to structured referral support.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            id="cta-start-screening-btn"
            onClick={() => navigate('/screening')}
            className="bg-[#FA495C] hover:bg-[#E11D48] text-white px-8 py-4 rounded-full font-extrabold text-base shadow-2xl shadow-rose-500/30 flex items-center gap-2.5 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer animate-glow-pulse"
          >
            Start a Screening <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            id="cta-explore-solution-btn"
            onClick={() => navigate('/solution')}
            className="border-2 border-white/20 text-white hover:bg-white/8 hover:border-white/40 px-8 py-4 rounded-full font-semibold text-base flex items-center gap-2 transition-all cursor-pointer"
          >
            Explore Our Solution <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Secondary links */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-slate-500">
          <button
            type="button"
            onClick={() => navigate('/about')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            About NetrX
          </button>
          <span className="text-slate-700">·</span>
          <button
            type="button"
            onClick={() => navigate('/resources')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Resources
          </button>
          <span className="text-slate-700">·</span>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Contact Us
          </button>
        </div>

        {/* Medical disclaimer */}
        <div className="mt-12 max-w-2xl mx-auto">
          <p className="text-xs text-slate-600 leading-relaxed">
            NetrX is a screening and referral-support concept developed for Smart India Hackathon 2026.
            It is not a substitute for professional medical diagnosis or clinical judgment.
            All demonstration results are sample data only.
          </p>
        </div>
      </div>
    </section>
  );
}
