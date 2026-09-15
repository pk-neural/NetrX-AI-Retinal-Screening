import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function GlobalFooter() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0A1128] text-white pt-14 pb-8 px-4 sm:px-8 lg:px-14 mt-16 relative overflow-hidden border-t border-slate-800">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FA495C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">

        {/* Brand */}
        <div className="lg:col-span-2 space-y-5">
          <NavLink to="/" className="inline-block transition-transform duration-200 hover:scale-[1.01]">
            <img
              src="/images/netrx-logo-transparent.png"
              alt="NetrX Logo — See Better. Detect Earlier. Refer Smarter."
              className="w-[220px] sm:w-[250px] md:w-[270px] lg:w-[290px] h-auto object-contain"
            />
          </NavLink>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            NetrX is an AI-powered diabetic retinopathy screening platform that analyzes fundus images, enables early DR detection, and optimizes clinical referral workflows.
          </p>
          <div className="flex items-center gap-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/40 px-3.5 py-2 rounded-lg max-w-md">
            <ShieldCheck className="w-4 h-4 text-[#FA495C] flex-shrink-0" />
            <span>Assistive clinical decision support for healthcare professionals.</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Navigation</h4>
          <ul className="space-y-2.5 text-sm text-slate-300">
            {[
              { label: 'Home', path: '/' },
              { label: 'About Us', path: '/about' },
              { label: 'Our Solution', path: '/solution' },
              { label: 'Resources', path: '/resources' },
              { label: 'Contact Us', path: '/contact' },
            ].map((l) => (
              <li key={l.path}>
                <NavLink to={l.path} className="hover:text-[#FA495C] transition-colors">
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Modules */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">AI Modules</h4>
          <ul className="space-y-2.5 text-sm text-slate-300">
            {[
              { label: 'Fundus Screening', path: '/screening' },
              { label: 'Quality Assessment', path: '/quality' },
              { label: 'DR Results & Grad-CAM', path: '/results' },
              { label: 'Referral & Report', path: '/referral' },
              { label: 'Solution Overview', path: '/solution' },
            ].map((l) => (
              <li key={l.path}>
                <NavLink to={l.path} className="hover:text-[#FA495C] transition-colors">
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h4>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#FA495C] flex-shrink-0" />
              <span>clinical@netrx.ai</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#FA495C] flex-shrink-0" />
              <span>+91-800-NETRX-AI</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#FA495C] mt-0.5 flex-shrink-0" />
              <span>Medical AI Innovation Hub, India</span>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => navigate('/screening')}
            className="bg-[#FA495C] hover:bg-[#E11D48] text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
          >
            Launch Screening <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legal */}
      <div className="max-w-[1440px] mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p className="flex items-center gap-1">
          © {year} NetrX AI Platform. Made with <Heart className="w-3.5 h-3.5 text-[#FA495C] fill-[#FA495C]" /> for SIH 2026.
        </p>
        <div className="flex items-center gap-6">
          <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-300 cursor-pointer">Terms of Clinical Use</span>
          <span className="hover:text-slate-300 cursor-pointer">HIPAA Compliance</span>
        </div>
      </div>
    </footer>
  );
}
