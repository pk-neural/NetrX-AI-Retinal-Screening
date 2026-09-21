import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp, Info, AlertCircle } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const METRICS = [
  { label: 'Focus', value: 92.4, color: '#FA495C' },
  { label: 'Illumination', value: 87.1, color: '#6366F1' },
  { label: 'Field of View', value: 94.6, color: '#0A1128' },
  { label: 'Contrast', value: 89.2, color: '#F59E0B' },
];

export default function ImageQualitySection() {
  const navigate = useNavigate();
  const [ref, isVisible] = useScrollReveal();
  const [animated, setAnimated] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  useEffect(() => {
    if (isVisible && !animated) {
      // Small delay so section is visible before bars start
      setTimeout(() => setAnimated(true), 200);
    }
  }, [isVisible, animated]);

  return (
    <section
      id="image-quality"
      className="relative w-full py-24 px-4 sm:px-8 lg:px-14 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F0F4FF 100%)' }}
    >
      <div aria-hidden="true" className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FA495C]/5 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-500 text-[11px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            Quality Assessment
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0A1128] leading-tight">
            Good Decisions Start<br />With Good Images.
          </h2>
          <p className="mt-5 text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            NetrX evaluates retinal image quality before AI screening to help identify
            images that may require better capture quality.
          </p>
        </div>

        {/* Two-column layout */}
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Eye image */}
          <div className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-black">
              <img
                src="/images/uploaded_fundus_v2.png"
                alt="Sample retinal fundus image for quality assessment"
                className="w-full h-full object-contain object-center p-2"
              />
              {/* Quality grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />
              {/* Quality badge */}
              <div className="absolute top-4 left-4 bg-white/92 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/80 shadow-sm">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Overall Quality</div>
                <div className="text-sm font-extrabold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  EXCELLENT
                </div>
              </div>
              {/* Sample label */}
              <div className="absolute bottom-4 right-4 bg-[#0A1128]/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <div className="text-[10px] text-slate-300 font-semibold">Sample fundus image</div>
              </div>
            </div>
          </div>

          {/* Right — Quality report */}
          <div className={`space-y-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>

            {/* Report header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#FA495C] mb-1">
                  Sample NetrX Quality Assessment
                </div>
                <h3 className="text-2xl font-extrabold text-[#0A1128]">Quality Report</h3>
              </div>
              <div className="flex flex-col items-center gap-1 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-2xl">
                <div className="text-2xl font-extrabold text-emerald-600">94.3</div>
                <div className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">Score</div>
              </div>
            </div>

            {/* Metric bars */}
            <div className="space-y-5">
              {METRICS.map((m, i) => (
                <div key={m.label} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-[#0A1128]">{m.label}</span>
                    <span className="text-sm font-extrabold" style={{ color: m.color }}>
                      {m.value}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all ease-out"
                      style={{
                        width: animated ? `${m.value}%` : '0%',
                        backgroundColor: m.color,
                        transitionDuration: '1200ms',
                        transitionDelay: `${i * 120}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Overall status */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9l4 4 8-8" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-extrabold text-emerald-700">EXCELLENT — Image Quality</div>
                <div className="text-xs text-emerald-500 mt-0.5">Suitable for AI screening analysis</div>
              </div>
            </div>

            {/* Why quality matters — expandable */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setWhyOpen(!whyOpen)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-[#0A1128] hover:bg-slate-50 transition-colors cursor-pointer"
                aria-expanded={whyOpen}
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#FA495C]" />
                  Why does image quality matter?
                </span>
                {whyOpen
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />
                }
              </button>
              {whyOpen && (
                <div className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-4 bg-slate-50/50">
                  AI screening models perform best on high-quality retinal images. Poor
                  focus, inadequate illumination, or incorrect field of view can affect the
                  reliability of screening predictions. NetrX assesses image quality as the
                  first step to help flag images that may need recapture before analysis.
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Values shown are sample demonstration data only.
                Not representative of clinical measurements.
              </span>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => navigate('/quality')}
              className="inline-flex items-center gap-2 bg-[#0A1128] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#FA495C] transition-all duration-300 cursor-pointer shadow-sm"
            >
              Check Image Quality <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
