import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, RefreshCcw } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const SEVERITY_LABELS = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative'];
const SEVERITY_COLORS = ['#10B981', '#84CC16', '#F59E0B', '#EF4444', '#7C3AED'];

export default function AIScreeningSection() {
  const navigate = useNavigate();
  const [ref, isVisible] = useScrollReveal({ threshold: 0.15 });
  const [state, setState] = useState('idle'); // idle | analyzing | complete
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const severityIndex = 2; // Moderate
  const confidence = 87.4;

  const runAnalysis = () => {
    if (state === 'analyzing') return;
    setState('analyzing');
    setProgress(0);

    let p = 0;
    intervalRef.current = setInterval(() => {
      p += Math.random() * 4.5 + 1.5;
      if (p >= 100) {
        p = 100;
        clearInterval(intervalRef.current);
        setTimeout(() => setState('complete'), 600);
      }
      setProgress(Math.min(Math.round(p * 10) / 10, 100));
    }, 75);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState('idle');
    setProgress(0);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <section
      id="ai-screening"
      className="relative w-full py-24 px-4 sm:px-8 lg:px-14 overflow-hidden"
      style={{ background: 'linear-gradient(170deg, #060D1F 0%, #0A1128 55%, #0F1A3A 100%)' }}
    >
      {/* Background glow effects */}
      <div aria-hidden="true" className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-[#FA495C]/6 blur-3xl pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto">

        {/* Heading */}
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-[#FA495C] text-[11px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <Zap className="w-3 h-3" />
            AI-Powered Analysis
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            AI-Powered Retinal Screening.
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
            Turn retinal images into actionable screening insights.
          </p>
        </div>

        {/* Main interactive area */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Left — Fundus image with overlay */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl bg-black">
              <img
                src="/images/uploaded_fundus_v2.png"
                alt="Retinal image undergoing AI screening analysis"
                className="w-full h-full object-contain object-center p-2"
                style={{ filter: state !== 'idle' ? 'brightness(0.75)' : 'brightness(0.6)' }}
              />

              {/* Dark tint overlay */}
              <div className="absolute inset-0 bg-[#0A1128]/50" />

              {/* Scanning grid */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(250,73,92,0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(250,73,92,0.06) 1px, transparent 1px)
                  `,
                  backgroundSize: '32px 32px',
                }}
              />

              {/* Scanning sweep line — visible when analyzing */}
              {state === 'analyzing' && (
                <div
                  className="absolute left-0 right-0 h-0.5 animate-scan-sweep pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, #FA495C80 30%, #FA495C 50%, #FA495C80 70%, transparent 100%)',
                    boxShadow: '0 0 12px #FA495C60',
                  }}
                />
              )}

              {/* Detection markers */}
              {state === 'complete' && (
                <>
                  {/* Corner brackets around iris */}
                  {[
                    { top: '28%', left: '28%', rotate: 0 },
                    { top: '28%', left: '66%', rotate: 90 },
                    { top: '62%', left: '28%', rotate: -90 },
                    { top: '62%', left: '66%', rotate: 180 },
                  ].map((b, i) => (
                    <svg
                      key={i}
                      width="20" height="20"
                      viewBox="0 0 20 20"
                      className="absolute animate-fade-up"
                      style={{ top: b.top, left: b.left, transform: `rotate(${b.rotate}deg)`, animationDelay: `${i * 0.06}s` }}
                    >
                      <path d="M0 7 L0 0 L7 0" fill="none" stroke="#FA495C" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  ))}
                  {/* Center crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-up">
                    <div className="w-6 h-6 relative">
                      <div className="absolute top-0 left-1/2 w-px h-2.5 bg-[#FA495C] -translate-x-1/2" />
                      <div className="absolute bottom-0 left-1/2 w-px h-2.5 bg-[#FA495C] -translate-x-1/2" />
                      <div className="absolute left-0 top-1/2 h-px w-2.5 bg-[#FA495C] -translate-y-1/2" />
                      <div className="absolute right-0 top-1/2 h-px w-2.5 bg-[#FA495C] -translate-y-1/2" />
                      <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#FA495C]" />
                    </div>
                  </div>
                </>
              )}

              {/* Status overlay when idle */}
              {state === 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-7 h-7 text-white/60" />
                    </div>
                    <div className="text-white/60 text-sm font-medium">Ready for analysis</div>
                  </div>
                </div>
              )}

              {/* Progress overlay when analyzing */}
              {state === 'analyzing' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="text-white font-bold text-lg">Analyzing...</div>
                  <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FA495C] rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[#FA495C] font-extrabold text-xl">{progress.toFixed(0)}%</div>
                </div>
              )}

              {/* Label */}
              <div className="absolute top-4 left-4">
                <div className="bg-[#0A1128]/80 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-white/10">
                  Fundus Image
                </div>
              </div>
            </div>
          </div>

          {/* Right — Controls + Result */}
          <div className="space-y-6">

            {/* Analyze button */}
            {state !== 'complete' ? (
              <button
                type="button"
                id="run-analysis-btn"
                onClick={runAnalysis}
                disabled={state === 'analyzing'}
                className={`w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer
                  ${state === 'analyzing'
                    ? 'bg-white/10 text-white/60 cursor-not-allowed border border-white/10'
                    : 'bg-[#FA495C] text-white hover:bg-[#E11D48] shadow-lg shadow-rose-500/20 hover:scale-[1.02] animate-glow-pulse'
                  }`}
              >
                <Zap className="w-5 h-5" />
                {state === 'analyzing' ? `Analyzing... ${progress.toFixed(0)}%` : 'Run Sample Analysis'}
              </button>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="w-full py-4 rounded-2xl font-semibold text-sm text-white/60 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/5 transition-all cursor-pointer"
              >
                <RefreshCcw className="w-4 h-4" /> Reset Demo
              </button>
            )}

            {/* Result card */}
            {state === 'complete' && (
              <div className="bg-white/8 border border-white/15 rounded-2xl p-6 space-y-5 animate-fade-up">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#FA495C]">
                    Screening Result
                  </div>
                  <div className="bg-[#FA495C]/15 border border-[#FA495C]/30 text-[#FA495C] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    SAMPLE RESULT
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-white">
                    Moderate Diabetic Retinopathy
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="text-2xl font-extrabold text-[#FA495C]">{confidence}%</div>
                    <div className="text-slate-400 text-sm">Confidence Score</div>
                  </div>
                </div>

                {/* Severity bar */}
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-medium">Severity Scale</div>
                  <div className="flex flex-col sm:flex-row gap-1.5">
                    {SEVERITY_LABELS.map((label, i) => (
                      <div
                        key={label}
                        className={`flex-1 rounded-md py-2 text-center transition-all duration-500`}
                        style={{
                          background: i === severityIndex ? SEVERITY_COLORS[i] : 'rgba(255,255,255,0.07)',
                          border: i === severityIndex ? `1px solid ${SEVERITY_COLORS[i]}` : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div className={`text-[9px] font-extrabold uppercase leading-tight ${i === severityIndex ? 'text-white' : 'text-slate-500'}`}>
                          {label.split(' ').map(w => w[0]).join('')}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 px-0.5">
                    <span>No DR</span>
                    <span>Proliferative</span>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Confidence</span>
                    <span className="text-[#FA495C] font-bold">{confidence}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FA495C] rounded-full animate-draw-line"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Demonstration result for interface preview only. Not a clinical diagnosis or medical recommendation.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/screening')}
                  className="w-full py-3 bg-[#FA495C] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#E11D48] transition-all cursor-pointer"
                >
                  Try with Your Image <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Info when idle */}
            {state === 'idle' && (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Click <strong className="text-white">"Run Sample Analysis"</strong> to see a demonstration
                  of the NetrX AI screening workflow — from image analysis to severity classification.
                </p>
                {[
                  'Severity grading (5-level ETDRS scale)',
                  'Confidence score visualization',
                  'Structured result output',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FA495C]/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FA495C]" />
                    </div>
                    <span className="text-sm text-slate-300">{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Navigate to real screening */}
            <button
              type="button"
              onClick={() => navigate('/screening')}
              className="w-full py-3 border border-white/15 text-white/70 rounded-xl text-sm font-medium hover:bg-white/5 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Go to Live Screening <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
