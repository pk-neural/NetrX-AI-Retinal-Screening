import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, Share2, RefreshCw, CheckCircle2, AlertTriangle,
  Activity, Eye, Info, ShieldCheck, HeartPulse, FileText, Sparkles
} from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { fullResult, resetScreening } = useScreening();

  // Guard: no data
  if (!fullResult || !fullResult.dr) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#0A1128]">No Analysis Results Found</h2>
          <p className="text-slate-500">Please start a new screening.</p>
          <button onClick={() => { resetScreening(); navigate('/screening'); }}
            className="bg-[#FA495C] text-white px-6 py-3 rounded-full font-bold cursor-pointer">
            Start New Screening
          </button>
        </div>
      </div>
    );
  }

  const { dr, dme, vessels, gradcam, rag, input, report_id, date, time: reportTime } = fullResult;

  // Safe fallbacks
  const drGrade = dr?.grade ?? 0;
  const drLabel = dr?.label ?? 'Unknown';
  const drConfidence = dr?.confidence ?? 0;
  const drReferable = dr?.referable ?? false;
  const drReferableProbability = dr?.referable_probability ?? 0;
  const dmeRisk = dme?.risk ?? 0;
  const dmeLabel = dme?.label ?? 'Unknown';
  const dmeConfidence = dme?.confidence ?? 0;
  const vesselStatus = vessels?.status ?? 'unavailable';
  const vesselCoverage = vessels?.coverage ?? 0;
  const gradcamImage = gradcam?.gradcam_image ?? null;
  const originalImage = fullResult.preprocessing?.original_image ?? null;

  // RAG data with safe fallbacks
  const clinicalImpression = rag?.clinical_impression ?? 'Clinical impression not available.';
  const recommendation = rag?.recommendation ?? { title: 'Continue Monitoring', bullets: [] };
  const drInterpretation = rag?.dr_interpretation ?? {};
  const dmeInterpretation = rag?.dme_interpretation ?? {};
  const referableInfo = rag?.referable ?? { status: false, probability: null };
  const evidence = rag?.evidence ?? [];

  // Theme colors
  const isReferable = drReferable || dmeRisk >= 2;

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* ═══ REPORT CONTAINER ═══ */}
      <div className="max-w-[900px] mx-auto w-full px-4 sm:px-6 py-8 report-container">

        {/* ─── Report Header ─── */}
        <div className="bg-[#0A1128] text-white rounded-t-3xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FA495C]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/images/netrx-logo-transparent.png" alt="NetrX" className="h-8 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                NetrX
              </h1>
              <p className="text-lg font-semibold text-white/90 mt-1">
                AI-ASSISTED RETINAL SCREENING REPORT
              </p>
              <p className="text-sm text-white/60 mt-2">
                Comprehensive Analysis for Diabetic Retinopathy, DME and Retinal Health
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-sm flex-shrink-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="font-bold text-white">REPORT</span>
                  <span className="text-xs font-mono text-white/80">#{report_id || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>📅</span> <span>{date || 'N/A'}</span>
                  <span className="mx-1">|</span>
                  <span>{reportTime || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <span className="text-sm text-[#FA495C] font-semibold">See Better. Detect Earlier. Refer Smarter.</span>
          </div>
        </div>

        {/* ─── Report Body ─── */}
        <div className="bg-white border-x border-slate-200 p-8 sm:p-10 space-y-10">

          {/* ═══ 0. INPUT FUNDUS IMAGE ═══ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-[#FA495C]" />
              <h2 className="text-lg font-extrabold text-[#0A1128] uppercase tracking-wide">
                Input Fundus Image
              </h2>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 relative" style={{ aspectRatio: '16 / 9' }}>
              {originalImage ? (
                <img src={`data:image/jpeg;base64,${originalImage}`} alt="Original Uploaded Fundus" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">Image unavailable</div>
              )}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Page break before DR Assessment for print */}
          <div className="print-page-break" />

          {/* ═══ 1. DIABETIC RETINOPATHY ASSESSMENT ═══ */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-[#FA495C]" />
              <h2 className="text-lg font-extrabold text-[#0A1128] uppercase tracking-wide">
                Diabetic Retinopathy Assessment
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Original Image beside Grade */}
              <div className="w-full md:w-1/3 flex-shrink-0">
                <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-900" style={{ aspectRatio: '1 / 1' }}>
                  {originalImage ? (
                    <img src={`data:image/jpeg;base64,${originalImage}`} alt="Original Fundus" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">Image unavailable</div>
                  )}
                </div>
              </div>

              {/* Right: DR Results */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Grade Box */}
                <div className={`p-6 rounded-2xl border-2 sm:col-span-2 ${
                  drGrade >= 3 ? 'bg-rose-50 border-rose-200' :
                  drGrade >= 2 ? 'bg-amber-50 border-amber-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">AI Classification</div>
                  <div className={`text-5xl font-extrabold ${
                    drGrade >= 3 ? 'text-[#FA495C]' :
                    drGrade >= 2 ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    Grade {drGrade}
                  </div>
                  <div className="text-sm font-bold text-[#0A1128] mt-2">{drLabel}</div>
                  <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between items-center text-sm">
                    <span className="text-slate-500">Model Confidence:</span>
                    <span className="text-lg font-extrabold text-[#0A1128]">{drConfidence}%</span>
                  </div>
                </div>

                {/* Referable DR */}
                <div className="p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1.5 mb-3">
                    {isReferable
                      ? <AlertTriangle className="w-5 h-5 text-[#FA495C]" />
                      : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    <span className="text-sm font-bold text-[#0A1128]">Referable DR</span>
                  </div>
                  <div className={`text-3xl font-extrabold ${isReferable ? 'text-[#FA495C]' : 'text-green-600'}`}>
                    {isReferable ? 'YES' : 'NO'}
                  </div>
                  {referableInfo.probability !== null && (
                    <div className="mt-3 text-center">
                      <div className="text-xs text-slate-400">Referable Probability</div>
                      <div className="text-lg font-bold text-[#0A1128]">{referableInfo.probability}%</div>
                    </div>
                  )}
                </div>

                {/* Clinical Meaning */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-[#0A1128] mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" /> Clinical Meaning
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {drInterpretation.clinical_meaning || 'Clinical meaning not available.'}
                  </p>
                </div>
              </div>
            </div>

            {/* DR Severity Scale */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-[#0A1128] mb-4 uppercase tracking-wide">Diabetic Retinopathy Severity</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {[
                  { grade: 0, label: 'No apparent DR', color: 'bg-green-100 border-green-300 text-green-700' },
                  { grade: 1, label: 'Mild NPDR', color: 'bg-lime-100 border-lime-300 text-lime-700' },
                  { grade: 2, label: 'Moderate NPDR', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
                  { grade: 3, label: 'Severe NPDR', color: 'bg-orange-100 border-orange-300 text-orange-700' },
                  { grade: 4, label: 'Proliferative DR', color: 'bg-rose-100 border-rose-300 text-rose-700' },
                ].map((level, i) => (
                  <React.Fragment key={level.grade}>
                    <div className={`flex-1 p-3 rounded-xl border ${drGrade === level.grade ? 'ring-2 ring-offset-2 ring-slate-800 shadow-md scale-105' : 'opacity-60'} ${level.color} flex flex-col items-center justify-center text-center transition-all`}>
                      <div className="font-bold text-sm">
                        {drGrade === level.grade && <span className="mr-1">●</span>}
                        Grade {level.grade}
                      </div>
                      <div className="text-[10px] font-bold mt-1 opacity-80">{level.label}</div>
                    </div>
                    {i < 4 && <div className="hidden sm:block text-slate-300 font-bold">→</div>}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                Diabetic retinopathy severity increases from Grade 0 to Grade 4, with Grade 0 indicating no apparent diabetic retinopathy and Grade 4 representing proliferative diabetic retinopathy.
              </p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Page break before Grad-CAM / DME / Vessels for print */}
          <div className="print-page-break" />

          {/* ═══ 2. GRAD-CAM + DME + VESSELS ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Grad-CAM */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-[#FA495C]" />
                <h2 className="text-base font-extrabold text-[#0A1128] uppercase tracking-wide">
                  AI Explainability (Grad-CAM)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">Regions contributing to the model's prediction</p>

              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 relative mb-3" style={{ aspectRatio: '1 / 1' }}>
                {gradcamImage ? (
                  <img src={`data:image/png;base64,${gradcamImage}`} alt="Grad-CAM heatmap"
                    className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-sm p-6 text-center">
                    <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                    Heatmap generation unavailable
                  </div>
                )}
              </div>

              {/* Color bar */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-slate-400">Lower contribution</span>
                <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-blue-500 via-green-400 via-yellow-400 to-red-500" />
                <span className="text-[10px] text-slate-400">Higher contribution</span>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  The highlighted regions show areas that contributed most to the AI model's prediction. 
                  These are AI-generated explanations and are not confirmed clinical annotations.
                </p>
              </div>
            </div>

            {/* Right side: DME + Vessels */}
            <div className="space-y-6">
              {/* DME */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-[#FA495C]" />
                  <h2 className="text-base font-extrabold text-[#0A1128] uppercase tracking-wide">
                    DME Risk Assessment (IDRiD-based)
                  </h2>
                </div>
                <div className="p-6 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        dmeRisk >= 2 ? 'bg-rose-100 text-[#FA495C]' : dmeRisk >= 1 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                      }`}>
                        <HeartPulse className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">DME Risk Level</div>
                        <div className={`text-xl font-extrabold ${
                          dmeRisk >= 2 ? 'text-[#FA495C]' : dmeRisk >= 1 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {dmeInterpretation.short || dmeLabel}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Model Confidence</div>
                      <div className="text-xl font-extrabold text-[#0A1128]">{dmeConfidence}%</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {dmeInterpretation.meaning || 'DME interpretation not available.'}
                  </p>
                </div>
              </div>

              {/* Vessels */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <HeartPulse className="w-5 h-5 text-[#FA495C]" />
                  <h2 className="text-base font-extrabold text-[#0A1128] uppercase tracking-wide">
                    Retinal Vessel Analysis (DRIVE-based)
                  </h2>
                </div>
                <div className="p-6 rounded-2xl border border-slate-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#0A1128] text-sm mb-2">
                        {vesselStatus === 'completed' ? 'Vascular Analysis Complete' : 'Vessel Analysis'}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        AI-based retinal vessel segmentation was performed using the DRIVE-trained vessel model. The displayed overlay highlights the vessels identified by the model.
                        {vesselStatus === 'completed' && ` Vessel coverage (${vesselCoverage}%) represents the proportion of the retinal field classified as vessel pixels and should be interpreted as an AI-derived measurement, not a standalone clinical diagnosis.`}
                      </p>
                    </div>
                  </div>
                  {vessels?.overlay && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
                      <img src={`data:image/png;base64,${vessels.overlay}`} alt="Vessel overlay"
                        className="w-full h-auto object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Page break before Clinical Impression for print */}
          <div className="print-page-break" />

          {/* ═══ 3. CLINICAL IMPRESSION ═══ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#FA495C]" />
              <h2 className="text-lg font-extrabold text-[#0A1128] uppercase tracking-wide">
                Clinical Impression
              </h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {clinicalImpression}
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* ═══ 4. RECOMMENDATION ═══ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-[#FA495C]" />
              <h2 className="text-lg font-extrabold text-[#0A1128] uppercase tracking-wide">
                Recommendation
              </h2>
            </div>

            <div className={`p-6 rounded-2xl border ${isReferable ? 'bg-rose-50/50 border-rose-200' : 'bg-green-50/50 border-green-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isReferable ? 'bg-[#FA495C] text-white' : 'bg-green-500 text-white'}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0A1128]">{recommendation.title}</h3>
              </div>
              <ul className="space-y-2.5 mb-4">
                {recommendation.bullets?.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-[#FA495C] flex-shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ═══ CLINICAL NOTE ═══ */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FA495C] text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#0A1128] mb-1">Important Clinical Note</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                NetrX is an AI-assisted screening and decision-support tool. Results are intended to support, not replace,
                the clinical judgment, examination and diagnosis by a qualified eye-care professional.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Report Footer Actions (hidden in PDF) ─── */}
        <div className="bg-white border border-t-0 border-slate-200 rounded-b-3xl p-6 sm:p-8 no-print">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => window.print()}
                title="Opens your browser's Print dialog — select 'Save as PDF' to download"
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#0A1128] rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
                <Download className="w-4 h-4" /> Download Report (PDF)
              </button>
              <button disabled
                title="Share functionality is not yet implemented"
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-400 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed opacity-60">
                <Share2 className="w-4 h-4" /> Share Report
              </button>
              <button onClick={() => { resetScreening(); navigate('/screening'); }}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <RefreshCw className="w-4 h-4" /> New Analysis
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-3 h-3 text-[#FA495C]" />
              <span>Powered by AI. Guided by Clinicians.<br />Built for a Healthier Tomorrow.</span>
            </div>
          </div>
        </div>

        {/* ─── Print-only Report Footer ─── */}
        <div className="print-only bg-white border border-t-0 border-slate-200 rounded-b-3xl p-6">
          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4">
            <span><strong className="text-[#0A1128]">NetrX</strong> — AI-Assisted Retinal Screening Report</span>
            <span>Report #{report_id || 'N/A'} · {date || 'N/A'}</span>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 text-center">
            This report was generated by NetrX AI. Results are intended to support, not replace, clinical judgment.
          </div>
        </div>

        {/* ─── Very Bottom Footer (hidden in PDF) ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 mt-4 px-2 text-center sm:text-left no-print">
          <span><strong className="text-[#0A1128]">NetrX</strong> © 2026 NetrX. All rights reserved.</span>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </div>
  );
}
