import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, Image as ImageIcon, ArrowRight, Cpu, RefreshCw,
  CheckCircle2, AlertTriangle, XCircle, Shield, Heart
} from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

const SAMPLE_IMAGES = [
  { id: '1', name: 'Sample — Moderate DR', finding: 'Moderate Non-Proliferative Diabetic Retinopathy', url: '/images/samples/mild.avif' },
  { id: '2', name: 'Sample — No DR Detected', finding: 'No Diabetic Retinopathy Detected (Normal)', url: '/images/samples/healthy.avif' },
];

const PROGRESS_STEPS = [
  { num: 1, label: 'Image Upload', sub: 'Upload fundus image' },
  { num: 2, label: 'Input Check', sub: 'Validating image' },
  { num: 3, label: 'AI Analysis', sub: 'Detecting DR & DME' },
  { num: 4, label: 'Results', sub: 'View detailed report' },
];

export default function ScreeningPage() {
  const navigate = useNavigate();
  const {
    currentFile, previewUrl, stage, domainResult, error,
    handleFileUpload, runDomainCheck, runFullAnalysis, resetScreening
  } = useScreening();
  const fileInputRef = useRef(null);
  const [selectedSample, setSelectedSample] = useState(null);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { handleFileUpload(file); setSelectedSample(null); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) { handleFileUpload(file); setSelectedSample(null); }
  };

  const handleRemove = () => {
    resetScreening();
    setSelectedSample(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step 1: Run YOLO domain check
  const handleCheckImage = async () => {
    if (!currentFile) return;
    await runDomainCheck();
  };

  // Step 2: Run full analysis after YOLO passes
  const handleContinueToAnalysis = async () => {
    if (!currentFile) return;
    await runFullAnalysis();
    // Navigation is handled by the useEffect below or the stage change
  };

  // Navigate on stage change
  React.useEffect(() => {
    if (stage === 'REPORT_READY' || stage === 'QUALITY_UNGRADABLE') {
      navigate('/quality');
    }
  }, [stage, navigate]);

  const isDomainChecking = stage === 'DOMAIN_CHECKING';
  const isDomainValid = stage === 'DOMAIN_VALID';
  const isDomainInvalid = stage === 'DOMAIN_INVALID';
  const isAnalyzing = stage === 'AI_ANALYZING';
  const hasImage = !!previewUrl;
  const showCheckButton = stage === 'UPLOAD_SELECTED';

  // Determine active progress step
  let activeStep = 1;
  if (isDomainChecking || isDomainValid || isDomainInvalid) activeStep = 2;
  if (isAnalyzing) activeStep = 3;

  // Get primary rejected object info for display
  const primaryRejected = domainResult?.rejected_objects?.[0] || null;
  const rejectionConfidence = primaryRejected
    ? (primaryRejected.confidence * 100).toFixed(1)
    : domainResult?.highest_relevant_confidence
      ? (domainResult.highest_relevant_confidence * 100).toFixed(1)
      : '0';

  return (
    <div className="w-full">
      {/* Simple header */}
      <div className="w-full bg-gradient-to-b from-slate-50/80 to-transparent border-b border-slate-100/80 py-6 md:py-8 px-4 sm:px-8 lg:px-14">
        <div className="max-w-[1440px] mx-auto" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ═══ LEFT COLUMN — Upload & Samples ═══ */}
          <div className="lg:col-span-7 space-y-6">

            {/* Upload Box */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0A1128] uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#FA495C]" /> Upload Fundus Image
                </span>
                {hasImage && !isAnalyzing && !isDomainChecking && (
                  <button type="button" onClick={handleRemove}
                    className="text-xs font-semibold text-slate-400 hover:text-[#FA495C] flex items-center gap-1 cursor-pointer">
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>

              {!hasImage ? (
                <div id="drop-zone" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-[#FA495C] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4 group-hover:bg-[#FA495C] transition-colors">
                    <Upload className="w-7 h-7 text-[#FA495C] group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-[#0A1128]">Drop your fundus image here</p>
                  <p className="text-xs text-slate-500 mt-1">
                    or <span className="text-[#FA495C] font-semibold underline">browse files</span>
                  </p>
                  <div className="mt-4 text-[11px] text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    DICOM · JPG · PNG · TIFF · Min 1024×1024px
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*,.dcm" className="hidden" onChange={onFileChange} />
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                  <img src={previewUrl} alt="Selected fundus scan" className="w-full h-64 object-cover" />
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-white">
                    <span className="truncate max-w-[200px] font-mono text-[11px] text-slate-300">{currentFile?.name}</span>
                    <span className="text-rose-400 font-bold">READY</span>
                  </div>
                </div>
              )}
            </div>

            {/* Demo Samples */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#0A1128]">Or Select a Clinical Demo Sample</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Test the NetrX AI pipeline instantly with pre-loaded fundus scans.</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                  DEMO
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SAMPLE_IMAGES.map((sample) => {
                  const isSelected = selectedSample === sample.id;
                  return (
                    <button key={sample.id} type="button"
                      onClick={() => setSelectedSample(sample.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected ? 'border-[#FA495C] bg-rose-50/40 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0">
                        <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#0A1128] truncate">{sample.name}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{sample.finding}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FA495C] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN — Preview & Results ═══ */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0A1128] uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#FA495C]" /> Image Preview
                </span>
                <span className="text-xs text-slate-400 font-mono">100% SCALE</span>
              </div>

              {/* Preview Box */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                {hasImage ? (
                  <>
                    <img src={previewUrl} alt="Uploaded image preview" className="w-full h-full object-cover" />
                    {(isDomainChecking || isAnalyzing) && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-slate-900/30">
                        <div className="w-32 h-32 rounded-full border-2 border-dashed border-rose-500/80 animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                    )}
                    {isDomainInvalid && (
                      <div className="absolute inset-0 bg-red-900/40 flex flex-col items-center justify-center pointer-events-none">
                        <div className="bg-[#FA495C] text-white px-4 py-2 rounded-xl font-extrabold text-sm tracking-wider shadow-lg">
                          ❌ INVALID IMAGE
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-600">
                    <ImageIcon className="w-10 h-10 text-slate-700" />
                    <span className="text-xs font-medium text-slate-500">No image selected</span>
                  </div>
                )}
              </div>

              {/* ─── DOMAIN VALID STATE ─── */}
              {isDomainValid && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-green-700 text-sm">✓ Valid Fundus Image</div>
                      <p className="text-xs text-green-600 mt-0.5">Retinal fundus detected with high confidence.</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleContinueToAnalysis}
                    disabled={isAnalyzing}
                    className="bg-[#FA495C] hover:bg-[#E11D48] disabled:opacity-60 text-white px-6 py-4 rounded-2xl font-bold text-base shadow-lg shadow-rose-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.98] w-full cursor-pointer">
                    <Cpu className="w-5 h-5" />
                    <span>Continue to AI Screening Analysis</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ─── DOMAIN INVALID STATE ─── */}
              {isDomainInvalid && domainResult && (
                <div className="space-y-4">
                  <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[#FA495C] font-bold">
                        <XCircle className="w-6 h-6" />
                        <span className="text-base">Invalid Image</span>
                      </div>
                      <span className="text-lg font-extrabold text-[#FA495C]">{rejectionConfidence}%</span>
                    </div>
                    <p className="text-sm text-rose-700 mb-4">Non-fundus object detected</p>

                    {/* Detection Details */}
                    <div className="bg-white rounded-xl p-4 border border-rose-100 space-y-2 mb-4">
                      <div className="text-xs font-bold text-[#0A1128] flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" /> Detection Details
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Detected object</span>
                          <span className="font-semibold text-[#0A1128]">: {primaryRejected?.object || 'unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Confidence</span>
                          <span className="font-semibold text-[#0A1128]">: {rejectionConfidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Reason</span>
                          <span className="font-semibold text-[#0A1128]">: Not a retinal fundus image</span>
                        </div>
                      </div>
                    </div>

                    {/* Help text */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-700">Please upload a clear retinal fundus image captured from a fundus camera.</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">Supported formats: DICOM, JPG, PNG, TIFF</p>
                      </div>
                    </div>
                  </div>

                  <button type="button" onClick={handleRemove}
                    className="bg-[#FA495C] hover:bg-[#E11D48] text-white px-6 py-4 rounded-2xl font-bold text-base shadow-lg shadow-rose-500/25 flex items-center justify-center gap-3 transition-all w-full cursor-pointer">
                    <RefreshCw className="w-5 h-5" />
                    <span>Try Another Image</span>
                  </button>
                </div>
              )}

              {/* ─── ANALYZING STATE ─── */}
              {isAnalyzing && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-rose-400 font-bold animate-pulse flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> ANALYZING...
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#FA495C] h-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                  <p className="text-xs text-slate-300 font-mono">Running ViT-B/16 DR + DME models...</p>
                </div>
              )}

              {/* ─── CHECKING STATE ─── */}
              {isDomainChecking && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-rose-400 font-bold animate-pulse flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> VALIDATING...
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#FA495C] h-full animate-pulse" style={{ width: '40%' }} />
                  </div>
                  <p className="text-xs text-slate-300 font-mono">Running YOLO input-domain validation...</p>
                </div>
              )}

              {/* ─── INITIAL CHECK BUTTON ─── */}
              {showCheckButton && (
                <button type="button" onClick={handleCheckImage}
                  className="bg-[#FA495C] hover:bg-[#E11D48] text-white px-6 py-4 rounded-2xl font-bold text-base shadow-lg shadow-rose-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.98] w-full cursor-pointer">
                  <Cpu className="w-5 h-5" />
                  <span>Start AI Screening Analysis</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM — Progress Steps ═══ */}
        <div className="mt-10 flex items-center justify-center">
          <div className="flex items-center gap-3 sm:gap-6 bg-white rounded-2xl px-6 py-4 border border-slate-200 shadow-sm">
            {PROGRESS_STEPS.map((step, i) => {
              const isActive = step.num === activeStep;
              const isComplete = step.num < activeStep;
              return (
                <React.Fragment key={step.num}>
                  {i > 0 && <div className={`hidden sm:block w-8 h-px ${isComplete ? 'bg-[#FA495C]' : 'bg-slate-200'}`} />}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      isActive ? 'bg-[#FA495C] text-white' : isComplete ? 'bg-[#FA495C] text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isComplete ? '✓' : step.num}
                    </div>
                    <div className={`text-[11px] font-bold ${isActive ? 'text-[#0A1128]' : 'text-slate-400'}`}>{step.label}</div>
                    <div className="text-[10px] text-slate-400 hidden sm:block">{step.sub}</div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ═══ BOTTOM — Why do we check ═══ */}
        <div className="mt-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#FA495C]" />
            <div>
              <div className="text-sm font-bold text-[#0A1128]">Why do we check your image?</div>
              <p className="text-xs text-slate-500 mt-0.5">
                We use an advanced AI model (YOLOv11) to ensure the uploaded image is a retinal fundus photograph.
                This helps provide accurate and reliable results.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
            <span className="font-semibold text-[#FA495C]">Safe Inputs</span>
            <span className="font-semibold text-[#FA495C]">Better Results</span>
            <Heart className="w-4 h-4 text-[#FA495C] fill-[#FA495C]" />
          </div>
        </div>
      </div>
    </div>
  );
}
