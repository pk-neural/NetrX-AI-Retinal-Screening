import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Menu, X } from 'lucide-react';
import SearchModal from './SearchModal';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // Scroll-aware navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setMobileOpen(false);
      setSearchOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Solution', path: '/solution' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_16px_rgba(10,17,40,0.08)] py-3'
            : 'bg-transparent py-4 md:py-5'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 flex items-center justify-between gap-6">

          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center flex-shrink-0 transition-transform duration-200 hover:scale-[1.01]"
            onClick={() => setMobileOpen(false)}
          >
            <img
              src="/images/netrx-logo-transparent.png"
              alt="NetrX — See Better. Detect Earlier. Refer Smarter."
              className="w-[180px] sm:w-[220px] md:w-[260px] lg:w-[290px] xl:w-[315px] h-auto object-contain py-0.5"
            />
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `relative py-1.5 text-sm font-semibold transition-colors duration-200 ${
                    isActive ? 'text-[#FA495C]' : 'text-[#0A1128] hover:text-[#FA495C]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#FA495C] rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              id="nav-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search NetrX"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[#0A1128] hover:text-[#FA495C] hover:border-rose-300 shadow-sm flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <Search className="w-4.5 h-4.5 stroke-[2.2]" style={{ width: 18, height: 18 }} />
            </button>
            <button
              type="button"
              id="nav-get-started-btn"
              onClick={() => navigate('/screening')}
              className="bg-[#FA495C] hover:bg-[#E11D48] text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="w-9 h-9 rounded-full border border-slate-200 bg-white text-[#0A1128] flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="p-2 text-[#0A1128] hover:text-[#FA495C] transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div
          className={`sm:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white/98 backdrop-blur-xl border-t border-slate-100 shadow-xl py-5 px-6 flex flex-col gap-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 text-base font-semibold border-b border-slate-50 transition-colors ${
                    isActive ? 'text-[#FA495C]' : 'text-[#0A1128]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => { setMobileOpen(false); navigate('/screening'); }}
              className="mt-3 bg-[#FA495C] text-white px-5 py-3 rounded-full font-semibold flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition-all hover:bg-[#E11D48]"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#0A1128]/20 sm:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
