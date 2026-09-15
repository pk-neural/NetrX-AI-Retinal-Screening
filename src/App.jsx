import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GlobalFooter from './components/GlobalFooter';
import BackgroundDecoration from './components/BackgroundDecoration';
import { ScreeningProvider } from './context/ScreeningContext';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import SolutionPage from './pages/SolutionPage';
import ScreeningPage from './pages/ScreeningPage';
import QualityPage from './pages/QualityPage';
import ResultsPage from './pages/ResultsPage';
import ResourcesPage from './pages/ResourcesPage';
import ContactPage from './pages/ContactPage';

export default function App() {
  return (
    <ScreeningProvider>
      <div className="relative min-h-screen bg-[#F8FAFC] text-[#0A1128] font-sans overflow-x-hidden flex flex-col">
        {/* Background decorative layer */}
        <BackgroundDecoration />

        {/* Global Navbar */}
        <Navbar />

        {/* Main Content — offset for fixed navbar */}
        <main className="flex-1 flex flex-col relative z-10 pt-[72px]">
          <Routes>
            <Route path="/"          element={<HomePage />} />
            <Route path="/about"     element={<AboutPage />} />
            <Route path="/solution"  element={<SolutionPage />} />
            <Route path="/screening" element={<ScreeningPage />} />
            <Route path="/quality"   element={<QualityPage />} />
            <Route path="/results"   element={<ResultsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/contact"   element={<ContactPage />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <GlobalFooter />
      </div>
    </ScreeningProvider>
  );
}
