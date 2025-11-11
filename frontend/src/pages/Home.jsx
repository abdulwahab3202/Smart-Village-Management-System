import React from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorksSection from '../components/HowItWorksSection';
import CtaSection from '../components/CtaSection';
import FeaturesSection from '../components/FeaturesSection';
import StatsSection from '../components/StatsSection';

const Home = ({ onReportClick }) => {
  return (
    <main>
      <HeroSection onReportClick={onReportClick} />
      <HowItWorksSection />
      <FeaturesSection />
      <StatsSection />
      <CtaSection />
    </main>
  );
};

export default Home;