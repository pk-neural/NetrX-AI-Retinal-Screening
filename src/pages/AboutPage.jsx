import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, Target, Heart, ShieldCheck, Users, Cpu, CheckCircle2, ArrowRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const CORE_VALUES = [
  {
    icon: Eye,
    highlight: 'OUR MISSION',
    title: 'Democratize Retinal Screening',
    desc: 'NetrX empowers primary care providers and healthcare workers with AI-grade diabetic retinopathy screening — eliminating specialist backlogs and geographic healthcare barriers.',
  },
  {
    icon: Target,
    highlight: 'OUR VISION',
    title: 'Zero Preventable Blindness',
    desc: 'Our vision is a world where no diabetic patient loses sight due to a missed or delayed retinal screening. NetrX bridges the gap between early detection and timely ophthalmological intervention.',
  },
  {
    icon: Heart,
    highlight: 'WHY NETRX',
    title: 'Built for the Clinic, Powered by AI',
    desc: 'Designed with clinical workflows in mind — NetrX integrates seamlessly into existing healthcare systems, requiring minimal training and producing results in under 3 seconds.',
  },
];

const PILLARS = [
  {
    icon: Cpu,
    title: 'AI-Assisted Screening',
    summary: 'Our ensemble neural network — EfficientNet-B5 + ResNet50 — achieves 98.4% sensitivity on ETDRS-graded fundus datasets.',
    details: ['Multi-scale lesion detection', 'Sub-pixel microaneurysm identification', 'Continuous model validation'],
  },
  {
    icon: Eye,
    title: 'Early Detection',
    summary: 'NetrX detects DR at the earliest clinical stages, enabling prompt laser treatment or anti-VEGF therapy to preserve vision.',
    details: ['5-stage ETDRS classification', 'DME risk marker identification', 'Optic disc & macula analysis'],
  },
  {
    icon: ShieldCheck,
    title: 'Smarter Referral',
    summary: 'Optimizing ophthalmology referral pathways — urgent cases receive immediate priority while routine cases reduce unnecessary specialist burden.',
    details: ['Triage level classification', 'Automated referral letters', 'Clinician-in-the-loop workflow'],
  },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <PageHeader
        eyebrow="ABOUT NETRX PLATFORM"
        title="Pioneering AI for Retinal Health & Early Diabetic Retinopathy Detection"
        description="NetrX is an advanced AI-powered diabetic retinopathy screening platform engineered to analyze digital fundus images, accelerate early detection, and support smarter referral decisions."
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-12 md:py-16 space-y-16">

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CORE_VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FA495C] flex items-center justify-center mb-6 shadow-sm group-hover:bg-[#FA495C] group-hover:text-white transition-colors duration-300">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-[11px] font-extrabold text-[#FA495C] uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                  {v.highlight}
                </span>
                <h3 className="text-xl font-bold text-[#0A1128] mt-3 mb-3">{v.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Feature Split Banner */}
        <div className="bg-gradient-to-r from-[#0A1128] via-[#111A38] to-[#0A1128] text-white rounded-3xl p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FA495C]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/40">
                <Heart className="w-3.5 h-3.5 fill-current" />
                TRANSFORMING DIABETIC EYE CARE
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Bridging the Gap Between Primary Care & Specialist Ophthalmology
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Over 537 million adults live with diabetes globally, yet fewer than 40% receive annual retinal screening due to specialist shortages. NetrX empowers clinics, pharmacies, and primary care providers with instant clinical decision support.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
                {[
                  { val: '98.4%', sub: 'Screening Sensitivity' },
                  { val: '< 3 sec', sub: 'Inference Speed' },
                  { val: '5 Stages', sub: 'ETDRS Classification' },
                ].map((s) => (
                  <div key={s.sub}>
                    <div className="text-3xl font-extrabold text-[#FA495C]">{s.val}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <img
                  src="/images/photo-1627502208346-b835b72c0f05.avif"
                  alt="NetrX AI Retina Analysis"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-widest">DR SCANNER V2.4</span>
                  <span className="text-sm font-semibold text-white">Grad-CAM Lesion Map Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Pillars */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#FA495C] uppercase tracking-widest">CLINICAL EXCELLENCE</span>
            <h2 className="text-3xl font-extrabold text-[#0A1128]">Core Technology Pillars</h2>
            <p className="text-slate-600 text-sm">Engineered with medical rigor to support healthcare teams worldwide.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#FA495C]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0A1128]">{p.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{p.summary}</p>
                  <ul className="space-y-2 pt-2 border-t border-slate-100">
                    {p.details.map((d, di) => (
                      <li key={di} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FA495C] flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#FA495C] uppercase tracking-widest">OUR TEAM</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'AI/ML Engineering', desc: 'Deep learning model training, EfficientNet ensemble architecture, Grad-CAM implementation.' },
              { role: 'Clinical Validation', desc: 'Ophthalmology consultants ensuring ETDRS compliance and clinical accuracy benchmarking.' },
              { role: 'Product & UX', desc: 'Healthcare UX designers creating accessible, intuitive clinical workflows for frontline workers.' },
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#0A1128] flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-[#FA495C]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0A1128]">{t.role}</div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-rose-50/60 via-white to-rose-50/60 p-8 sm:p-10 rounded-3xl border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0A1128]">Ready to Experience NetrX Screening?</h3>
            <p className="text-slate-600 text-sm max-w-xl">Try our interactive AI screening interface with sample fundus scans or upload your own image.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/screening')}
            className="bg-[#FA495C] hover:bg-[#E11D48] text-white px-7 py-3.5 rounded-full font-semibold text-base shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] flex-shrink-0 cursor-pointer"
          >
            Launch Screening <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </div>
  );
}
