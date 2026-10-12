'use client';

import Navbar from './Navbar';
import Hero from './Hero';
import Problem from './Problem';
import Features from './Features';
import Roles from './Roles';
import HowItWorks from './HowItWorks';
import Pricing from './Pricing';
import CallToAction from './CallToAction';
import Footer from './Footer';

export default function Landing() {
  return (
    <div id="landing-page">
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <Roles />
      <HowItWorks />
      <Pricing />
      <CallToAction />
      <Footer />
    </div>
  );
}
