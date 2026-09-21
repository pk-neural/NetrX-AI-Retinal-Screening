import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function ExplainableAISection() {
  const navigate = useNavigate();
  const [ref, isVisible] = useScrollReveal();
  const [viewMode, setViewMode] = useState('original'); // 'original' | 'heatmap'
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <section
      id="explainability"
      className="relative w-full py-24 px-4 sm:px-8 lg:px-14 bg-white overflow-hidden"
    >
      <div aria-hidden="true" className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-50/60 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            Explainable AI
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0A1128] leading-tight max-w-3xl mx-auto">
            AI That Doesn't Just Predict.<br />
            <span className="text-[#FA495C]">It Helps Explain.</span>
          </h2>
          <p className="mt-5 text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Visual explanations can help users understand which regions of a retinal image
            contributed to an AI screening prediction.
          </p>
        </div>

        {/* Interactive area */}
        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >

          {/* Left — image toggle */}
          <div className="space-y-4">

            {/* Toggle control */}
            <div className="flex flex-col sm:flex-row items-center bg-slate-100 p-1 rounded-xl w-full sm:w-fit">
              {['original', 'heatmap'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    viewMode === mode
                      ? 'bg-white shadow-sm text-[#0A1128]'
                      : 'text-slate-500 hover:text-[#0A1128]'
                  }`}
                >
                  {mode === 'original' ? 'Original Image' : 'Explainability View'}
                </button>
              ))}
            </div>

            {/* Image container */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-xl border border-slate-100">
              <img
                src={viewMode === 'heatmap' ? '/images/uploaded_gradcam_v2.jpg' : '/images/uploaded_fundus_v2.png'}
                alt="Retinal fundus image with AI attention regions"
                className="w-full h-full object-contain object-center bg-black p-2"
                style={{ filter: viewMode === 'heatmap' ? 'brightness(1)' : 'brightness(0.85)' }}
              />

              {/* Heatmap overlay */}
              {viewMode === 'heatmap' && (
                <div
                  className="absolute inset-0 animate-heatmap-reveal pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(ellipse 22% 18% at 50% 48%, rgba(255,30,30,0.72) 0%, transparent 100%),
                      radial-gradient(ellipse 14% 12% at 63% 38%, rgba(255,140,0,0.60) 0%, transparent 100%),
                      radial-gradient(ellipse 12% 10% at 42% 55%, rgba(255,200,0,0.50) 0%, transparent 100%),
                      radial-gradient(ellipse 18% 14% at 55% 52%, rgba(255,60,60,0.45) 0%, transparent 100%),
                      radial-gradient(ellipse 10% 8% at 37% 42%, rgba(255,180,0,0.38) 0%, transparent 100%)
                    `,
                    mixBlendMode: 'screen',
                  }}
                />
              )}

              {/* Mode badge */}
              <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                  viewMode === 'heatmap'
                    ? 'bg-red-500/80 border-red-400/30 text-white backdrop-blur-sm'
                    : 'bg-[#0A1128]/70 border-white/10 text-white backdrop-blur-sm'
                }`}>
                  {viewMode === 'heatmap' ? 'Explainability View — SAMPLE' : 'Original Image'}
                </div>
              </div>
            </div>
          </div>

          {/* Right — info panel */}
          <div className="space-y-6">

            {/* What you see */}
            <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-extrabold text-[#0A1128]">
                {viewMode === 'heatmap' ? 'What You\'re Seeing' : 'Original Retinal Image'}
              </h3>
              {viewMode === 'heatmap' ? (
                <p className="text-slate-500 text-sm leading-relaxed">
                  The color overlay indicates regions where the AI model focused its attention
                  when generating its screening prediction. Warmer colors (red/orange) represent
                  areas of higher model attention.
                </p>
              ) : (
                <p className="text-slate-500 text-sm leading-relaxed">
                  This is the fundus photograph as captured. Toggle to "Explainability View"
                  to see which regions of the image the AI model focused on during analysis.
                </p>
              )}

              {viewMode === 'heatmap' && (
                <div className="space-y-3 pt-2">
                  {[
                    { zone: 'High Attention', desc: 'Central retinal region — primary focus area', dot: 'bg-red-500' },
                    { zone: 'Moderate Attention', desc: 'Peripheral regions of interest', dot: 'bg-orange-400' },
                    { zone: 'Low Attention', desc: 'Areas with minimal model focus', dot: 'bg-amber-300' },
                  ].map((item) => (
                    <div key={item.zone} className="flex items-start gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.dot} mt-1 flex-shrink-0`} />
                      <div>
                        <div className="text-sm font-semibold text-[#0A1128]">{item.zone}</div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Why Explainability — expandable */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setWhyOpen(!whyOpen)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-[#0A1128] hover:bg-slate-50 transition-colors cursor-pointer"
                aria-expanded={whyOpen}
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500" />
                  Why Explainability?
                </span>
                {whyOpen
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />
                }
              </button>
              {whyOpen && (
                <div className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-4 bg-slate-50/50">
                  Visual evidence from AI models can improve transparency by showing which
                  retinal regions contributed to a screening prediction. This supports
                  clinician review, helps identify potential model focus areas, and builds
                  user confidence in AI-assisted screening workflows.
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 text-xs text-slate-400 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Sample explainability visualization only. The heatmap shown is a
                frontend demonstration and does not represent a clinically validated
                Grad-CAM output from a connected AI backend.
              </span>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => navigate('/results')}
              className="w-full py-3.5 bg-[#0A1128] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#FA495C] transition-all duration-300 cursor-pointer"
            >
              View Full Results &amp; Explainability →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
