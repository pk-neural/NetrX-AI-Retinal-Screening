import React from 'react';

export default function BackgroundDecoration() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Top-left soft pink blob */}
      <div
        className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(250,73,92,0.10) 0%, transparent 70%)' }}
      />
      {/* Top-right cross decoration */}
      <svg className="absolute top-16 right-24 w-8 h-8 text-[#FA495C] opacity-25" viewBox="0 0 32 32" fill="currentColor">
        <rect x="13" y="0" width="6" height="32" rx="2"/>
        <rect x="0" y="13" width="32" height="6" rx="2"/>
      </svg>
      {/* Bottom-right blob */}
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(250,73,92,0.08) 0%, transparent 70%)' }}
      />
      {/* Center-left small cross */}
      <svg className="absolute top-1/3 left-12 w-5 h-5 text-[#FA495C] opacity-20" viewBox="0 0 32 32" fill="currentColor">
        <rect x="13" y="0" width="6" height="32" rx="2"/>
        <rect x="0" y="13" width="32" height="6" rx="2"/>
      </svg>
      {/* Thin diagonal lines — top right */}
      <svg className="absolute top-0 right-0 w-96 h-96 opacity-[0.04]" viewBox="0 0 400 400" fill="none">
        <line x1="0" y1="400" x2="400" y2="0" stroke="#0A1128" strokeWidth="1"/>
        <line x1="40" y1="400" x2="400" y2="40" stroke="#0A1128" strokeWidth="1"/>
        <line x1="80" y1="400" x2="400" y2="80" stroke="#0A1128" strokeWidth="1"/>
      </svg>
      {/* Bottom center dot grid */}
      <svg className="absolute bottom-20 left-1/2 -translate-x-1/2 opacity-[0.06]" width="160" height="80" viewBox="0 0 160 80">
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 10 }, (_, col) => (
            <circle key={`${row}-${col}`} cx={col * 16 + 8} cy={row * 16 + 8} r="1.5" fill="#0A1128"/>
          ))
        )}
      </svg>
    </div>
  );
}
