import React from 'react';

/**
 * Reusable page header used on all inner pages.
 * Provides consistent eyebrow + title + description styling.
 */
export default function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="w-full bg-gradient-to-b from-slate-50/80 to-transparent border-b border-slate-100/80 py-12 md:py-16 px-4 sm:px-8 lg:px-14">
      <div className="max-w-[1440px] mx-auto space-y-4">
        {eyebrow && (
          <div className="flex items-center gap-2">
            {/* Decorative pulse dot */}
            <span className="w-2 h-2 rounded-full bg-[#FA495C] animate-pulse" />
            <span className="text-xs font-extrabold text-[#FA495C] uppercase tracking-widest">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0A1128] leading-tight max-w-3xl text-balance">
          {title}
        </h1>
        {description && (
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
