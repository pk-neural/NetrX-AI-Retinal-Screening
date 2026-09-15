import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X, Hash } from 'lucide-react';

/** All searchable items — pages + homepage sections */
const SEARCH_ITEMS = [
  // Pages
  { label: 'Start Screening', path: '/screening', type: 'page', desc: 'Upload and analyze a fundus image' },
  { label: 'Image Quality Check', path: '/quality', type: 'page', desc: 'Assess retinal image quality' },
  { label: 'View Results', path: '/results', type: 'page', desc: 'Screening results and Grad-CAM' },
  { label: 'Referral & Report', path: '/referral', type: 'page', desc: 'Generate referral recommendation' },
  { label: 'About NetrX', path: '/about', type: 'page', desc: 'About the platform and team' },
  { label: 'Our Solution', path: '/solution', type: 'page', desc: 'Full solution overview' },
  { label: 'Resources', path: '/resources', type: 'page', desc: 'Educational resources and guides' },
  { label: 'Contact Us', path: '/contact', type: 'page', desc: 'Get in touch with NetrX' },
  // Sections
  { label: 'Diabetic Retinopathy', section: 'problem', type: 'section', desc: 'Why early detection matters' },
  { label: 'Meet NetrX', section: 'meet-netrx', type: 'section', desc: 'Platform introduction and pipeline' },
  { label: 'How It Works', section: 'how-it-works', type: 'section', desc: '4-step screening workflow' },
  { label: 'Image Quality Assessment', section: 'image-quality', type: 'section', desc: 'Quality metrics demo' },
  { label: 'AI Screening Demo', section: 'ai-screening', type: 'section', desc: 'Run a sample AI analysis' },
  { label: 'Explainable AI', section: 'explainability', type: 'section', desc: 'Heatmap visualization toggle' },
  { label: 'Screening Result', section: 'screening-result', type: 'section', desc: 'Result card preview' },
  { label: 'Smart Referral', section: 'referral', type: 'section', desc: 'Referral priority workflow' },
  { label: 'NetrX Advantages', section: 'advantages', type: 'section', desc: 'Why choose NetrX' },
];

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim().length > 0
    ? SEARCH_ITEMS.filter((s) =>
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.desc.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_ITEMS;

  const handleSelect = (item) => {
    onClose();
    setQuery('');
    if (item.type === 'section') {
      // Navigate to home first if needed, then scroll
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(item.section);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      navigate(item.path);
    }
  };

  const pages = results.filter((r) => r.type === 'page');
  const sections = results.filter((r) => r.type === 'section');

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-[#0A1128]/65 backdrop-blur-lg"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Site search"
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search pages, features, sections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm text-[#0A1128] bg-transparent outline-none placeholder:text-slate-400"
            aria-label="Search NetrX"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="py-2 max-h-[60vh] overflow-y-auto">
          {results.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {pages.length > 0 && (
            <>
              <div className="px-5 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pages</div>
              {pages.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between px-5 py-3 text-sm text-[#0A1128] hover:bg-rose-50 hover:text-[#FA495C] transition-colors cursor-pointer text-left group"
                >
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5 group-hover:text-rose-300">{item.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#FA495C] flex-shrink-0" />
                </button>
              ))}
            </>
          )}

          {sections.length > 0 && (
            <>
              <div className="px-5 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">Homepage Sections</div>
              {sections.map((item) => (
                <button
                  key={item.section}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between px-5 py-3 text-sm text-[#0A1128] hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 flex-shrink-0" />
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
          <span>
            Press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
