import React from 'react';

export default function TrustFooter() {
  return (
    <div className="w-full border-t border-slate-100 px-4 sm:px-8 lg:px-14 py-4">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <span className="font-medium">Trusted for a Healthier Vision</span>
        <div className="hidden sm:block flex-1 h-px bg-slate-100 mx-6" />
        <span className="font-semibold text-[#0A1128]">#NetrX</span>
        <span className="text-slate-300">|</span>
        <span>Early Detection Saves Sight</span>
        {/* Pagination dots */}
        <div className="flex items-center gap-2 ml-4">
          <span className="w-3 h-3 rounded-full bg-[#FA495C]" />
          <span className="w-3 h-3 rounded-full bg-slate-300" />
          <span className="w-3 h-3 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
