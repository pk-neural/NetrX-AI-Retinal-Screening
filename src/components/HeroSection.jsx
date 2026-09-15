import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Camera, Shield, Users, ChevronDown } from 'lucide-react';

/* ================================================================
   CONSTANTS
================================================================ */

/** Four-phase scan cycle: duration (ms) for each state */
const SCAN_CYCLE = [
  { id: 'scanning',  label: 'SCANNING',   dotColor: '#FA495C', duration: 3200 },
  { id: 'analyzing', label: 'ANALYZING',  dotColor: '#6366F1', duration: 2000 },
  { id: 'detecting', label: 'DETECTING',  dotColor: '#FA495C', duration: 2600 },
  { id: 'complete',  label: 'COMPLETE',   dotColor: '#10B981', duration: 1600 },
];

/** Positions of detection points relative to HUD centre (px).
 *  Placed over visible iris/retinal texture, away from the dark pupil. */
const DETECTION_POINTS = [
  { top: -132, left:  30,  delay: '0s',    size: 5 },
  { top:   22, left: -148, delay: '0.8s',  size: 4 },
  { top:  112, left:  38,  delay: '0.4s',  size: 4 },
  { top: -96,  left: -118, delay: '1.2s',  size: 4 },
];

/** Background decorative plus signs */
const BG_PLUS = [
  { top: '11%',  left: '3.5%',  size: 14, opacity: 0.18 },
  { top: '74%',  left: '5.5%',  size: 10, opacity: 0.12 },
  { top: '20%',  left: '90%',   size: 12, opacity: 0.10 },
  { top: '82%',  left: '84%',   size:  9, opacity: 0.08 },
  { top: '48%',  left: '1.5%',  size:  8, opacity: 0.10 },
];

/** Background decorative dots */
const BG_DOTS = [
  { top: '14%',  left: '7%',  r: 3.5 },
  { top: '42%',  left: '11%', r: 2   },
  { top: '69%',  left: '4%',  r: 2.5 },
  { top: '25%',  left: '91%', r: 2   },
  { top: '87%',  left: '88%', r: 3   },
  { top: '58%',  left: '2%',  r: 1.5 },
  { top: '93%',  left: '8%',  r: 2   },
];

/* ================================================================
   PUPIL ANCHOR CONSTANTS (SINGLE SOURCE OF TRUTH)
   The black pupil in the native retinal image sits at:
   X: 68.8% from left edge
   Y: 50.2% from top edge
   
   Using CSS object-position: 68.8% 50.2% guarantees that the pupil center
   is ALWAYS rendered at left: 68.8%, top: 50.2% of the container at ALL screen sizes.
================================================================ */
const PUPIL_CENTER_X = '54.2%';
const PUPIL_CENTER_Y = '44.2%';

/* ================================================================
   SUB-COMPONENTS
================================================================ */

function HeartbeatIcon() {
  return (
    <svg
      width="24" height="14" viewBox="0 0 24 14"
      fill="none" className="flex-shrink-0"
      aria-hidden="true"
    >
      <polyline
        points="0,7 4,7 5.5,1.5 8.5,12.5 11.5,0.5 14.5,9.5 16.5,4.5 18.5,7 24,7"
        fill="none" stroke="#FA495C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function FeaturePill({ icon: Icon, line1, line2 }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
        <Icon style={{ width: 17, height: 17, color: '#FA495C', strokeWidth: 2 }} />
      </div>
      <div>
        <div className="text-xs font-extrabold text-[#0A1128] leading-tight">{line1}</div>
        <div className="text-xs font-medium text-slate-500 leading-tight">{line2}</div>
      </div>
    </div>
  );
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ================================================================
   MAIN COMPONENT
================================================================ */

export default function HeroSection({ onOpenDemo }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  // ── Mouse parallax ────────────────────────────────────────────
  const [mouse, setMouse] = useState({ x: 0, y: 0 }); // normalised -1..1
  const isMobileRef = useRef(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    isMobileRef.current = window.innerWidth < 768;

    const handleResize = () => { isMobileRef.current = window.innerWidth < 768; };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (reducedMotion.current || isMobileRef.current) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
      y: ((e.clientY - rect.top)  / rect.height - 0.5) * 2,
    });
  }, []);

  const handleMouseLeave = useCallback(() => setMouse({ x: 0, y: 0 }), []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    section.addEventListener('mousemove', handleMouseMove, { passive: true });
    section.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // ── Three parallax depth layers ───────────────────────────────
  // Background (furthest): barely moves
  const bgTransform     = reducedMotion.current ? undefined : `translate(${mouse.x * 3}px, ${mouse.y * 2}px)`;
  // Eye image (mid-ground): moderate
  const eyeTransform    = reducedMotion.current ? undefined : `translate(${mouse.x * 9}px, ${mouse.y * 6}px)`;
  // HUD (foreground): moves most — applied as EXTRA offset INSIDE eye container
  // Net HUD movement = eyeTransform + hudExtraTransform = (9+4, 6+3) = (13, 9) px
  const hudExtraTransform = reducedMotion.current ? undefined : `translate(${mouse.x * 4}px, ${mouse.y * 3}px)`;

  // ── Scan phase state machine ──────────────────────────────────
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reducedMotion.current) return;
    let timeout;
    const tick = (current) => {
      timeout = setTimeout(() => {
        const next = (current + 1) % SCAN_CYCLE.length;
        setPhase(next);
        tick(next);
      }, SCAN_CYCLE[current].duration);
    };
    tick(0);
    return () => clearTimeout(timeout);
  }, []);

  const scan = SCAN_CYCLE[phase];
  const isScanning  = phase === 0;
  const isAnalyzing = phase === 1;
  const isDetecting = phase === 2;
  const isComplete  = phase === 3;

  /* ── Transition helpers ─────────────────────────────────────── */
  const transitionFast = 'transition: 0.4s ease';

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="NetrX Hero — AI retinal screening"
      className="relative w-full min-h-[calc(100vh-72px)] overflow-hidden flex items-center"
    >

      {/* ── Layer 1: Background decorations (deepest / moves least) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none"
        style={{ transform: bgTransform, transition: 'transform 0.35s ease-out' }}
      >
        {/* Plus signs */}
        {BG_PLUS.map((p, i) => (
          <svg key={i} width={p.size} height={p.size} viewBox="0 0 14 14"
            className="absolute" style={{ top: p.top, left: p.left, opacity: p.opacity }}>
            <path d="M7 0v14M0 7h14" stroke="#FA495C" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ))}
        {/* Dots */}
        {BG_DOTS.map((d, i) => (
          <div key={i} className="absolute rounded-full bg-[#FA495C]/20"
            style={{ width: d.r * 2, height: d.r * 2, top: d.top, left: d.left }} />
        ))}
        {/* Faint corner arc — top right */}
        <svg className="absolute top-0 right-0 w-80 h-80 opacity-[0.035]" viewBox="0 0 320 320">
          <circle cx="320" cy="0" r="220" fill="none" stroke="#0A1128" strokeWidth="1" />
          <circle cx="320" cy="0" r="280" fill="none" stroke="#0A1128" strokeWidth="0.5" />
        </svg>
        {/* Faint corner arc — bottom left */}
        <svg className="absolute bottom-0 left-0 w-56 h-56 opacity-[0.025]" viewBox="0 0 224 224">
          <circle cx="0" cy="224" r="160" fill="none" stroke="#0A1128" strokeWidth="0.8" />
        </svg>
        {/* Dot grid — bottom right area */}
        <svg className="absolute bottom-10 right-[39%] opacity-[0.06]" width="100" height="60" viewBox="0 0 100 60">
          {Array.from({ length: 4 }, (_, row) =>
            Array.from({ length: 7 }, (_, col) => (
              <circle key={`${row}-${col}`} cx={col * 14 + 7} cy={row * 14 + 7} r="1.5" fill="#0A1128" />
            ))
          )}
        </svg>
      </div>

      {/* ── Layer 2: Eye visual (mid-ground) ─────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-full lg:w-[62%] flex items-center justify-end pointer-events-none select-none"
        style={{ transform: eyeTransform, transition: 'transform 0.14s ease-out' }}
      >

        {/* ── Eye image with aggressive radial masking — ZERO visible rectangle ── */}
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: [
              /* Strong radial: opaque at eye pupil, fully transparent at edges */
              `radial-gradient(ellipse 58% 76% at ${PUPIL_CENTER_X} ${PUPIL_CENTER_Y}, black 26%, rgba(0,0,0,0.88) 44%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.18) 74%, transparent 86%)`,
              /* Fade left edge so eye bleeds into text area naturally */
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 12%, black 30%)',
              /* Fade top edge */
              'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 8%, black 18%)',
              /* Fade bottom edge */
              'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.4) 8%, black 18%)',
            ].join(', '),
            WebkitMaskComposite: 'destination-in, destination-in, destination-in',
            maskImage: [
              `radial-gradient(ellipse 58% 76% at ${PUPIL_CENTER_X} ${PUPIL_CENTER_Y}, black 26%, rgba(0,0,0,0.88) 44%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.18) 74%, transparent 86%)`,
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 12%, black 30%)',
              'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 8%, black 18%)',
              'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.4) 8%, black 18%)',
            ].join(', '),
            maskComposite: 'intersect',
          }}
        >
          <img
            src="/images/photo-1627502208346-b835b72c0f05.avif"
            alt="Retinal fundus image undergoing AI analysis by NetrX"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: `${PUPIL_CENTER_X} ${PUPIL_CENTER_Y}` }}
          />
        </div>

        {/* Atmospheric glow — coral + lavender behind eye */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              `radial-gradient(ellipse 45% 55% at ${PUPIL_CENTER_X} ${PUPIL_CENTER_Y}, rgba(250,73,92,0.055) 0%, transparent 68%)`,
              `radial-gradient(ellipse 35% 45% at ${PUPIL_CENTER_X} ${PUPIL_CENTER_Y}, rgba(180,190,255,0.04) 0%, transparent 65%)`,
            ].join(', '),
          }}
        />

        {/* ── HUD — anchored at EXACT black pupil center ─────────── */}
        <div
          className="absolute"
          style={{ left: PUPIL_CENTER_X, top: PUPIL_CENTER_Y, transform: 'translate(-50%, -50%)' }}
        >
          {/* Extra depth offset — HUD moves most with mouse (foreground layer) */}
          <div style={{ transform: hudExtraTransform, transition: 'transform 0.22s ease-out' }}>

            {/* ── Rings ─────────────────────────────────────────────── */}

            {/* Outermost — very faint pulse */}
            <div
              className="absolute rounded-full animate-pulse-ring"
              style={{
                width: 296, height: 296, top: -148, left: -148,
                border: '1.5px solid rgba(255,255,255,0.14)',
              }}
            />

            {/* Reverse-rotating faint ring */}
            <div
              className="absolute rounded-full animate-spin-slow-reverse"
              style={{
                width: 254, height: 254, top: -127, left: -127,
                border: '0.5px solid rgba(250,73,92,0.12)',
              }}
            />

            {/* Dashed coral ring — speed increases when analyzing */}
            <div
              className="absolute rounded-full"
              style={{
                width: 218, height: 218, top: -109, left: -109,
                border: isDetecting
                  ? '1.5px dashed rgba(250,73,92,0.85)'
                  : '1.5px dashed rgba(250,73,92,0.55)',
                animation: `spin-slow ${isAnalyzing ? '7s' : '18s'} linear infinite`,
                boxShadow: isDetecting ? '0 0 18px rgba(250,73,92,0.18) inset' : 'none',
                transition: 'border-color 0.5s ease, box-shadow 0.5s ease',
              }}
            />

            {/* Inner white ring */}
            <div
              className="absolute rounded-full"
              style={{
                width: 148, height: 148, top: -74, left: -74,
                border: '1.5px solid rgba(255,255,255,0.55)',
                boxShadow: isDetecting || isComplete
                  ? '0 0 24px rgba(250,73,92,0.22), inset 0 0 12px rgba(250,73,92,0.08)'
                  : 'none',
                transition: 'box-shadow 0.6s ease',
              }}
            />

            {/* Tiny inner ring — tightest, hugs the pupil edge */}
            <div
              className="absolute rounded-full"
              style={{
                width: 64, height: 64, top: -32, left: -32,
                border: '1px solid rgba(255,255,255,0.70)',
                opacity: isAnalyzing ? 0.9 : 0.55,
                transition: 'opacity 0.4s ease',
              }}
            />

            {/* ── Scanning line — only visible during SCANNING phase ─── */}
            {isScanning && (
              <div
                className="absolute overflow-hidden rounded-full"
                style={{ width: 148, height: 148, top: -74, left: -74 }}
              >
                <div
                  className="absolute"
                  style={{
                    left: 0, right: 0,
                    height: '1.5px',
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(250,73,92,0.7) 25%, rgba(250,73,92,1) 50%, rgba(250,73,92,0.7) 75%, transparent 100%)',
                    boxShadow: '0 0 8px rgba(250,73,92,0.6)',
                    animation: 'scan-sweep 2.4s linear infinite',
                  }}
                />
              </div>
            )}

            {/* ── Corner detection brackets — perfectly symmetrical 120x120px frame ── */}
            {[
              { top: -60, left: -60, rotate: 0   },
              { top: -60, left:  32, rotate: 90  },
              { top:  32, left: -60, rotate: -90 },
              { top:  32, left:  32, rotate: 180 },
            ].map((b, i) => (
              <svg
                key={i}
                width="28" height="28"
                viewBox="0 0 28 28"
                className="absolute"
                style={{
                  top: b.top, left: b.left,
                  transform: `rotate(${b.rotate}deg)`,
                  opacity: isDetecting || isComplete ? 1 : 0.65,
                  filter: isDetecting
                    ? 'drop-shadow(0 0 5px rgba(250,73,92,0.7))'
                    : 'none',
                  transition: 'opacity 0.45s ease, filter 0.45s ease',
                }}
              >
                <path
                  d="M0 9 L0 0 L9 0"
                  fill="none" stroke="#FA495C" strokeWidth="2.5" strokeLinecap="round"
                />
              </svg>
            ))}

            {/* ── Centre crosshair — sits EXACTLY at pupil center (0,0) ── */}
            <svg
              width="20" height="20" viewBox="0 0 20 20"
              className="absolute"
              style={{ top: -10, left: -10 }}
            >
              {/* Vertical */}
              <line x1="10" y1="0"  x2="10" y2="6"  stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="10" y1="14" x2="10" y2="20" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              {/* Horizontal */}
              <line x1="0"  y1="10" x2="6"  y2="10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="14" y1="10" x2="20" y2="10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              {/* Centre dot — coral */}
              <circle cx="10" cy="10" r="2.4" fill="#FA495C" />
            </svg>

            {/* ── DR label — LEFT of pupil, connected by thin line pointing to pupil ──── */}
            <div
              className="absolute"
              style={{ top: -20, left: -176, width: 138 }}
            >
              {/* Card */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.94)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(250,73,92,0.22)',
                  borderRadius: 8,
                  padding: '7px 12px',
                  position: 'relative',
                  boxShadow: '0 4px 20px rgba(10,17,40,0.08)',
                }}
              >
                {/* Medical bracket corners */}
                {[
                  { t: -1, l: -1, bt: true, bl: true },
                  { t: -1, r: -1, bt: true, br: true },
                  { b: -1, l: -1, bb: true, bl: true },
                  { b: -1, r: -1, bb: true, br: true },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="absolute w-2.5 h-2.5"
                    style={{
                      top: c.t, left: c.l, right: c.r, bottom: c.b,
                      borderTop:    c.bt ? '1.5px solid #FA495C' : undefined,
                      borderLeft:   c.bl ? '1.5px solid #FA495C' : undefined,
                      borderRight:  c.br ? '1.5px solid #FA495C' : undefined,
                      borderBottom: c.bb ? '1.5px solid #FA495C' : undefined,
                    }}
                  />
                ))}
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: '#0A1128',
                    letterSpacing: '0.13em',
                    textTransform: 'uppercase',
                    lineHeight: 1.4,
                  }}
                >
                  DIABETIC<br />RETINOPATHY
                </div>
                {/* AI visualization label */}
                <div
                  style={{
                    fontSize: 7,
                    fontWeight: 700,
                    color: '#FA495C',
                    letterSpacing: '0.1em',
                    marginTop: 3,
                  }}
                >
                  AI VISUALIZATION
                </div>
                {/* Thin connector line pointing right toward pupil center */}
                <div
                  style={{
                    position: 'absolute',
                    right: -38, top: '50%',
                    width: 38, height: 1,
                    background: 'linear-gradient(to right, rgba(250,73,92,0.6), rgba(250,73,92,0.9))',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {/* Glowing end dot pointing at analysis center */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0, top: -2,
                      width: 5, height: 5,
                      borderRadius: '50%',
                      background: '#FA495C',
                      boxShadow: '0 0 6px #FA495C',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── Scan-phase status badge ───────────────────────────── */}
            <div
              className="absolute"
              style={{
                bottom: -112, left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  background: 'rgba(10,17,40,0.78)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.11)',
                  borderRadius: 20,
                  padding: '4px 14px 4px 10px',
                }}
              >
                {/* Blinking dot */}
                <div
                  style={{
                    width: 7, height: 7,
                    borderRadius: '50%',
                    background: scan.dotColor,
                    animation: 'blink-dot 1.2s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.92)',
                    letterSpacing: '0.18em',
                  }}
                >
                  {scan.label}
                </span>
              </div>
            </div>

            {/* ── Detection points — iris-region ROIs ──────────────── */}
            {DETECTION_POINTS.map((p, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: p.size, height: p.size,
                  top: p.top * 0.85, left: p.left * 0.85,
                  background: '#FA495C',
                  opacity: isDetecting ? 1 : 0.45,
                  animation: isDetecting
                    ? `scan-ping ${1.4 + i * 0.25}s ease-out infinite ${p.delay}`
                    : `blink-dot ${2 + i * 0.4}s ease-in-out infinite ${p.delay}`,
                  transition: 'opacity 0.35s ease',
                  boxShadow: isDetecting ? '0 0 0 2px rgba(250,73,92,0.2)' : 'none',
                }}
              />
            ))}

            {/* ── Technical arc detail (subtle dashed outer circle) ─── */}
            <svg
              className="absolute pointer-events-none"
              style={{ width: 360, height: 360, top: -180, left: -180, opacity: 0.09 }}
              viewBox="0 0 360 360"
            >
              <circle
                cx="180" cy="180" r="178"
                fill="none" stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.5" strokeDasharray="5 10"
              />
            </svg>

            {/* ── Medical plus symbols — outer region ──────────────── */}
            {[
              { top: -178, left:  62, size: 13, opacity: 0.18 },
              { top:   88, left: -182, size: 10, opacity: 0.13 },
              { top:  155, left:  74, size:  9, opacity: 0.09 },
            ].map((s, i) => (
              <svg
                key={i}
                width={s.size} height={s.size}
                viewBox="0 0 13 13"
                className="absolute"
                style={{ top: s.top, left: s.left, opacity: s.opacity }}
              >
                <path d="M6.5 0v13M0 6.5h13" stroke="#FA495C" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            ))}

            {/* ── Small network nodes / tech dots (periphery) ──────── */}
            {[
              { top: -168, left: -50,  size: 4, opacity: 0.12 },
              { top: -140, left: 130,  size: 3, opacity: 0.10 },
              { top:  130, left: -145, size: 4, opacity: 0.11 },
              { top:  160, left:  50,  size: 3, opacity: 0.09 },
            ].map((n, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-[#FA495C]/40"
                style={{
                  width: n.size, height: n.size,
                  top: n.top, left: n.left,
                  opacity: n.opacity,
                  background: 'rgba(250,73,92,0.15)',
                }}
              />
            ))}

          </div>
        </div>
      </div>

      {/* ── Layer 3: Left marketing content (z-10 so it's above the eye) ── */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 flex flex-col justify-center py-20 lg:py-0">
        <div className="max-w-xl xl:max-w-2xl space-y-8">

          {/* Eyebrow — heartbeat + label */}
          <div className="flex items-center gap-2.5 animate-float-in">
            <HeartbeatIcon />
            <span className="text-[11px] font-extrabold text-[#FA495C] uppercase tracking-[0.22em]">
              AI FOR A HEALTHIER TOMORROW
            </span>
          </div>

          {/* Main headline — three lines, each fades in with stagger */}
          <h1 className="text-[2.85rem] sm:text-[3.4rem] xl:text-[4.25rem] leading-[1.04] font-extrabold tracking-tight">
            <span
              className="block text-[#0A1128] animate-float-in"
              style={{ animationDelay: '0.08s' }}
            >
              See Better.
            </span>
            <span
              className="block text-[#0A1128] animate-float-in"
              style={{ animationDelay: '0.2s' }}
            >
              Detect Earlier.
            </span>
            <span
              className="block text-[#64748B] animate-float-in"
              style={{ animationDelay: '0.34s' }}
            >
              Refer Smarter.
            </span>
          </h1>

          {/* Description */}
          <p
            className="text-[1.0625rem] sm:text-lg text-slate-600 leading-[1.75] max-w-md animate-float-in"
            style={{ animationDelay: '0.52s' }}
          >
            NetrX uses advanced AI to analyze retinal images, enable early detection of
            Diabetic Retinopathy, and support smarter referrals for better vision outcomes.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-float-in"
            style={{ animationDelay: '0.66s' }}
          >
            {/* Primary */}
            <button
              type="button"
              id="hero-try-netrx-btn"
              onClick={() => navigate('/screening')}
              className="group bg-[#FA495C] hover:bg-[#E11D48] text-white px-7 py-[14px] rounded-full font-semibold text-[1rem] shadow-lg shadow-rose-500/25 flex items-center gap-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/30 active:scale-[0.97] cursor-pointer"
            >
              Try NetrX Now
              <ArrowRight
                className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </button>

            {/* Secondary */}
            <button
              type="button"
              id="hero-watch-demo-btn"
              onClick={onOpenDemo}
              className="group border-2 border-[#0A1128]/80 text-[#0A1128] hover:bg-[#0A1128] hover:text-white px-6 py-[13px] rounded-full font-semibold text-[1rem] flex items-center gap-3 transition-all duration-200 cursor-pointer"
            >
              <span className="w-7 h-7 rounded-full bg-[#0A1128] group-hover:bg-white flex items-center justify-center transition-colors duration-200 flex-shrink-0">
                <Play
                  className="w-3.5 h-3.5 text-white group-hover:text-[#0A1128] fill-white group-hover:fill-[#0A1128] transition-colors duration-200"
                  style={{ marginLeft: 1 }}
                />
              </span>
              Watch Demo
            </button>
          </div>

          {/* Feature strip */}
          <div
            className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-1 animate-float-in"
            style={{ animationDelay: '0.80s' }}
          >
            <FeaturePill icon={Camera} line1="Fast" line2="Screening" />
            <div className="hidden sm:block w-px h-9 bg-slate-200" aria-hidden="true" />
            <FeaturePill icon={Shield} line1="AI-Powered" line2="Accuracy" />
            <div className="hidden sm:block w-px h-9 bg-slate-200" aria-hidden="true" />
            <FeaturePill icon={Users} line1="Better" line2="Patient Outcomes" />
          </div>

        </div>
      </div>

      {/* ── Scroll indicator — bottom centre ────────────────────────── */}
      <button
        type="button"
        aria-label="Scroll down to explore"
        onClick={() => scrollToSection('problem')}
        className="absolute bottom-8 left-1/2 flex flex-col items-center gap-1.5 group cursor-pointer"
        style={{ transform: 'translateX(-50%)' }}
      >
        <span className="text-[9.5px] font-bold tracking-[0.22em] text-slate-400 uppercase group-hover:text-[#FA495C] transition-colors duration-200">
          SCROLL TO EXPLORE
        </span>
        <ChevronDown
          className="w-5 h-5 text-slate-400 group-hover:text-[#FA495C] transition-colors duration-200 animate-bounce-y"
          strokeWidth={2}
        />
      </button>

    </section>
  );
}
