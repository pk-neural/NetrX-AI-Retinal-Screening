import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Microscope, Sparkles, Activity, Eye, FileText, GitBranch } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const PIPELINE = [
  {
    id: 'upload',
    icon: Microscope,
    label: 'Retinal Image',
    sub: 'Fundus photograph upload',
    scrollTo: null,
    path: '/screening',
  },
  {
    id: 'quality',
    icon: Eye,
    label: 'Image Quality',
    sub: 'Automated quality check',
    scrollTo: 'image-quality',
    path: null,
  },
  {
    id: 'analysis',
    icon: Activity,
    label: 'AI Analysis',
    sub: 'ML-based DR screening',
    scrollTo: 'ai-screening',
    path: null,
  },
  {
    id: 'severity',
    icon: Sparkles,
    label: 'Severity Grade',
    sub: 'DR classification result',
    scrollTo: 'screening-result',
    path: null,
  },
  {
    id: 'explainability',
    icon: GitBranch,
    label: 'Explainability',
    sub: 'Visual model insights',
    scrollTo: 'explainability',
    path: null,
  },
  {
    id: 'referral',
    icon: FileText,
    label: 'Referral Support',
    sub: 'Structured clinical output',
    scrollTo: 'referral',
    path: '/referral',
  },
];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function MeetNetrxSection() {
  const navigate = useNavigate();
  const [headingRef, headingVisible] = useScrollReveal();
  const [pipelineRef, pipelineVisible] = useScrollReveal();

  return (
    <section
      id="meet-netrx"
      className="relative w-full py-24 px-4 sm:px-8 lg:px-14 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F0F4FF 0%, #F8FAFC 60%, #FFF5F6 100%)' }}
    >
      {/* Decorative blobs */}
      <div aria-hidden="true" className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[#FA495C]/4 blur-3xl pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-50/60 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto">

        {/* Large statement */}
        <div
          ref={headingRef}
          className={`text-center mb-6 transition-all duration-700 ${headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-slate-400 text-lg sm:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed">
            "What if every retinal image could be screened intelligently?"
          </p>
        </div>

        <div
          className={`text-center mb-16 transition-all duration-700 delay-150 ${headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 bg-[#FA495C]/8 border border-[#FA495C]/20 text-[#FA495C] text-[11px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA495C] inline-block" />
            Introducing
          </div>
          <h2 className="text-5xl sm:text-6xl font-extrabold text-[#0A1128] leading-tight">
            Meet <span className="text-[#FA495C]">NetrX</span>
          </h2>
          <p className="mt-5 text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            An AI-powered retinal screening and referral-support platform designed to help
            identify diabetic retinopathy risk and support smarter clinical decisions.
          </p>
        </div>

        {/* Pipeline Visual */}
        <div
          ref={pipelineRef}
          className="flex flex-col lg:flex-row items-center justify-center gap-0 lg:gap-0"
        >
          {PIPELINE.map((stage, i) => {
            const Icon = stage.icon;
            const isLast = i === PIPELINE.length - 1;

            const handleClick = () => {
              if (stage.scrollTo) scrollTo(stage.scrollTo);
              else if (stage.path) navigate(stage.path);
            };

            return (
              <React.Fragment key={stage.id}>
                {/* Stage node */}
                <button
                  type="button"
                  onClick={handleClick}
                  className={`group flex flex-col items-center gap-3 px-4 py-5 rounded-2xl
                    hover:bg-white hover:shadow-lg border border-transparent hover:border-slate-100
                    transition-all duration-300 cursor-pointer min-w-[120px]
                    ${pipelineVisible ? 'animate-fade-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  aria-label={`Go to ${stage.label} section`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100
                    group-hover:bg-[#FA495C] group-hover:border-[#FA495C] group-hover:shadow-rose-200
                    transition-all duration-300 flex items-center justify-center">
                    <Icon
                      className="w-6 h-6 text-[#0A1128] group-hover:text-white transition-colors duration-300"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-[#0A1128] group-hover:text-[#FA495C] transition-colors leading-tight">
                      {stage.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-tight max-w-[100px]">
                      {stage.sub}
                    </div>
                  </div>
                  {/* Step number */}
                  <div className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </button>

                {/* Connector arrow */}
                {!isLast && (
                  <div className="flex lg:flex-row flex-col items-center text-slate-300">
                    {/* Desktop: horizontal arrow */}
                    <div className="hidden lg:flex items-center">
                      <div className="w-8 h-px bg-gradient-to-r from-slate-200 to-[#FA495C]/30" />
                      <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                        <path d="M0 0L8 6L0 12" stroke="#FA495C" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {/* Mobile: vertical arrow */}
                    <div className="lg:hidden flex flex-col items-center py-1">
                      <div className="w-px h-5 bg-gradient-to-b from-slate-200 to-[#FA495C]/30" />
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path d="M0 0L6 8L12 0" stroke="#FA495C" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Explore CTA */}
        <div className={`text-center mt-12 transition-all duration-700 delay-500 ${pipelineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            type="button"
            onClick={() => navigate('/solution')}
            className="inline-flex items-center gap-2 border border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128] hover:text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-md cursor-pointer"
          >
            Explore the Full Solution <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
