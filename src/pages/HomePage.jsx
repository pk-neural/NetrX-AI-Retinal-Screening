import React, { useState } from 'react';

// Existing components
import HeroSection from '../components/HeroSection';
import TrustFooter from '../components/TrustFooter';
import WatchDemoModal from '../components/WatchDemoModal';

// New homepage sections
import ProblemSection from '../components/ProblemSection';
import MeetNetrxSection from '../components/MeetNetrxSection';
import HowItWorksSection from '../components/HowItWorksSection';
import ImageQualitySection from '../components/ImageQualitySection';
import AIScreeningSection from '../components/AIScreeningSection';
import ExplainableAISection from '../components/ExplainableAISection';
import ScreeningResultSection from '../components/ScreeningResultSection';
import SmartReferralSection from '../components/SmartReferralSection';
import AdvantagesSection from '../components/AdvantagesSection';
import ImpactSection from '../components/ImpactSection';
import FinalCTASection from '../components/FinalCTASection';

/**
 * NetrX Homepage
 *
 * Scrollable story structure:
 *  01. Hero                 — The vision
 *  02. Trust strip          — Quick credibility
 *  03. Problem              — Why early detection matters
 *  04. Meet NetrX           — Introduction + pipeline
 *  05. How It Works         — 4-step workflow
 *  06. Image Quality        — Quality assessment demo
 *  07. AI Screening         — Interactive AI demo
 *  08. Explainable AI       — Heatmap toggle demo
 *  09. Screening Result     — Result card preview
 *  10. Smart Referral       — Referral flow
 *  11. Advantages           — Why NetrX?
 *  12. Impact               — Early detection story
 *  13. Final CTA            — Start screening
 */
export default function HomePage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="w-full flex flex-col overflow-x-hidden">

      {/* ── 01. Hero ──────────────────────────────────────────────── */}
      <HeroSection onOpenDemo={() => setDemoOpen(true)} />

      {/* ── 02. Trust strip ──────────────────────────────────────── */}
      <TrustFooter />

      {/* ── 03. Problem ──────────────────────────────────────────── */}
      <ProblemSection />

      {/* ── 04. Meet NetrX ───────────────────────────────────────── */}
      <MeetNetrxSection />

      {/* ── 05. How It Works ─────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ── 06. Image Quality ────────────────────────────────────── */}
      <ImageQualitySection />

      {/* ── 07. AI Screening ─────────────────────────────────────── */}
      <AIScreeningSection />

      {/* ── 08. Explainable AI ───────────────────────────────────── */}
      <ExplainableAISection />

      {/* ── 09. Screening Result ─────────────────────────────────── */}
      <ScreeningResultSection />

      {/* ── 10. Smart Referral ───────────────────────────────────── */}
      <SmartReferralSection />

      {/* ── 11. Advantages ───────────────────────────────────────── */}
      <AdvantagesSection />

      {/* ── 12. Impact ───────────────────────────────────────────── */}
      <ImpactSection />

      {/* ── 13. Final CTA ────────────────────────────────────────── */}
      <FinalCTASection />

      {/* ── Demo Modal ───────────────────────────────────────────── */}
      <WatchDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
