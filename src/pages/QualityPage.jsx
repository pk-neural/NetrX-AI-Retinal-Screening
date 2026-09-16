import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, ArrowRight, RefreshCw,
  Eye, Sparkles, Shield, XCircle, ArrowRightCircle
} from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

const PROGRESS_STEPS = [
  { num: 1, label: 'Image Upload', sub: 'Upload fundus image' },
  { num: 2, label: 'Input Check', sub: 'Validates & Preprocesses' },
  { num: 3, label: 'AI Analysis', sub: 'Detecting DR & DME' },
  { num: 4, label: 'Results', sub: 'View detailed report' },
];

const PROCESSING_STEPS = [
  'Contrast enhancement (CLAHE)',
  'Illumination correction',
  'Noise reduction',
  'Color normalization',
  'Preserved retinal structures',
];

export default function QualityPage() {
  const navigate = useNavigate();
  const { currentFile, fullResult, resetScreening, stage } = useScreening();
  const [showProgress, setShowProgress] = useState(true);

  // Guard: no data
  if (!fullResult || !fullResult.quality) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#0A1128]">No Quality Data Found</h2>
          <p className="text-slate-500">Please start a new screening.</p>
          <button onClick={() => { resetScreening(); navigate('/screening'); }}
            className="bg-[#FA495C] text-white px-6 py-3 rounded-full font-bold cursor-pointer">
            Start New Screening
          </button>
        </div>
      </div>
    );
  }

  const qualityOriginal = fullResult.quality.original;
  const qualityEnhanced = fullResult.quality.enhanced;
  const qualityChange = fullResult.quality.change;
  const qualityStatus = fullResult.quality.status; // ACCEPTED, BORDERLINE, UNGRADABLE
  const isPassed = qualityStatus === 'ACCEPTED' || qualityStatus === 'BORDERLINE';

  const originalImage = fullResult.preprocessing?.original_image;
  const enhancedImage = fullResult.preprocessing?.enhanced_image;

  // Quality metrics table data
  const metricsRows = [
    {
      label: 'Focus (Sharpness)',
      original: qualityOriginal.focus,
      enhanced: qualityEnhanced.focus,
      change: qualityChange.focus,
    },
    {
      label: 'Illumination',
      original: qualityOriginal.illumination,
      enhanced: qualityEnhanced.illumination,
      change: qualityChange.illumination,
    },
    {
      label: 'Contrast',
      original: qualityOriginal.contrast,
      enhanced: qualityEnhanced.contrast,
      change: qualityChange.contrast,
    },
    {
      label: 'Retinal Detail',
      original: qualityOriginal.detail,
      enhanced: qualityEnhanced.detail,
      change: qualityChange.detail,
    },
    {
      label: 'Field of View (FOV)',
      original: qualityOriginal.fov,
      enhanced: qualityEnhanced.fov,
      change: qualityChange.fov,
    },
    {
      label: 'Overall Quality',
      original: qualityOriginal.overall,
      enhanced: qualityEnhanced.overall,
      change: qualityChange.overall,
    },
  ];

  const formatChange = (val) => {
    if (val === 0) return '0%';
    const pct = qualityOriginal.overall > 0
      ? ((val / Math.max(qualityOriginal.overall, 1)) * 100).toFixed(1)
      : val.toFixed(1);
    return val > 0 ? `+${pct}%` : `${pct}%`;
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* ═══ TOP: Navbar spacer + Progress Steps ═══ */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-4">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {PROGRESS_STEPS.map((step, i) => {
              const isActive = step.num === 2;
              const isComplete = step.num < 2;
              return (
                <React.Fragment key={step.num}>
                  {i > 0 && <div className={`hidden sm:block w-8 h-px ${step.num <= 2 ? 'bg-[#FA495C]' : 'bg-slate-200'}`} />}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mb-1 ${
                      isActive ? 'bg-[#FA495C] text-white' : isComplete ? 'bg-[#FA495C] text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isComplete ? '✓' : step.num}
                    </div>
                    <div className={`text-[10px] font-bold ${isActive ? 'text-[#0A1128]' : 'text-slate-400'}`}>{step.label}</div>
                    <div className="text-[9px] text-slate-400 hidden sm:block">{step.sub}</div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-8 md:py-12">

        {/* Title + Quality Status */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#FA495C] animate-pulse" />
              <span className="text-xs font-extrabold text-[#FA495C] uppercase tracking-widest">Step 2</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0A1128] leading-tight">
              Image Validation & Preprocessing
            </h1>
            <p className="text-slate-500 text-sm mt-2 max-w-xl">
              We enhance the image to improve visibility of retinal structures for better AI analysis.
            </p>
          </div>

          {/* Status Badge */}
          <div className={`flex-shrink-0 p-4 rounded-2xl border ${
            isPassed
              ? 'bg-green-50 border-green-200'
              : 'bg-rose-50 border-rose-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {isPassed
                ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                : <AlertTriangle className="w-5 h-5 text-[#FA495C]" />}
              <span className={`font-bold text-sm ${isPassed ? 'text-green-700' : 'text-[#FA495C]'}`}>
                {isPassed ? 'Image Quality Accepted' : 'Image Quality Too Low'}
              </span>
            </div>
            <p className={`text-xs ${isPassed ? 'text-green-600' : 'text-rose-600'} max-w-xs`}>
              {isPassed
                ? 'Image quality is acceptable for AI analysis.'
                : 'Image quality is below the minimum required for reliable analysis. Please capture the retinal image again.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ─── LEFT: Preprocessing Images ─── */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-[#0A1128]">Preprocessing & Enhancement</h2>
                <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Processing Complete
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-6">Enhancing image quality using advanced image processing techniques.</p>

              {/* Side-by-side images */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                    Original Fundus Image
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                    {originalImage ? (
                      <img src={`data:image/jpeg;base64,${originalImage}`} alt="Original" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No image</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                    Enhanced Fundus Image (Processed)
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                    {enhancedImage ? (
                      <img src={`data:image/jpeg;base64,${enhancedImage}`} alt="Enhanced" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No image</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhancing progress bar */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="font-semibold">Enhancing image quality...</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FA495C] rounded-full" style={{ width: '100%' }} />
                </div>
                <span className="font-bold text-[#0A1128]">100%</span>
              </div>
            </div>

            {/* ─── Proceed / Retake ─── */}
            {isPassed ? (
              <button type="button" onClick={() => navigate('/results')}
                className="bg-[#FA495C] hover:bg-[#E11D48] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-rose-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] w-full cursor-pointer">
                <Sparkles className="w-5 h-5" />
                <span>Proceed to AI Analysis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-[#FA495C] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#FA495C] text-sm">Quality below threshold</div>
                    <p className="text-xs text-rose-600 mt-1">
                      Image quality is below the minimum required for reliable analysis. Please capture the retinal image again.
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => { resetScreening(); navigate('/screening'); }}
                  className="bg-[#FA495C] hover:bg-[#E11D48] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-rose-500/25 flex items-center justify-center gap-3 transition-all w-full cursor-pointer">
                  <RefreshCw className="w-5 h-5" />
                  <span>Take Image Again</span>
                </button>
              </div>
            )}

            <p className="text-xs text-slate-400 text-center">
              {isPassed
                ? 'Enhanced image will be used for DR & DME detection.'
                : 'AI analysis will be available after a better quality image is captured.'}
            </p>
          </div>

          {/* ─── RIGHT: Quality Metrics ─── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quality Improvement Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
              <h3 className="text-base font-bold text-[#0A1128] mb-5">Quality Improvement</h3>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="text-left pb-3">Metric</th>
                    <th className="text-right pb-3">Original</th>
                    <th className="text-right pb-3">Enhanced</th>
                    <th className="text-right pb-3">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {metricsRows.map((row, i) => {
                    const changeVal = row.enhanced - row.original;
                    const changePct = row.original > 0
                      ? ((changeVal / row.original) * 100).toFixed(1)
                      : '0.0';
                    const isPositive = changeVal >= 0;
                    return (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-3 font-semibold text-[#0A1128] text-xs">{row.label}</td>
                        <td className="py-3 text-right text-slate-500">{row.original.toFixed(2)}</td>
                        <td className="py-3 text-right font-bold text-[#0A1128]">{row.enhanced.toFixed(2)}</td>
                        <td className={`py-3 text-right font-bold text-xs ${isPositive ? 'text-green-600' : 'text-[#FA495C]'}`}>
                          ↑ {isPositive ? '+' : ''}{changePct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* What did we do? */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
              <h3 className="text-base font-bold text-[#0A1128] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FA495C]" /> What did we do?
              </h3>
              <ul className="space-y-2.5">
                {PROCESSING_STEPS.map((step, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className="w-full border-t border-slate-200 bg-white py-4 px-4 sm:px-8 lg:px-14 mt-auto">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span><strong className="text-[#0A1128]">NetrX</strong> © 2026 NetrX. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#FA495C]" />
            Powered by AI. Guided by Clinicians. Built for a Healthier Tomorrow.
          </span>
        </div>
      </div>
    </div>
  );
}
