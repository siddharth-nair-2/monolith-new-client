"use client";

import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import CompanyLogos from "@/components/landing/CompanyLogos";
import FindInNaturalLanguage from "@/components/landing/FindInNaturalLanguage";
import Security from "@/components/landing/Security";
import MissionStatement from "@/components/landing/MissionStatement";
import FinalCTA from "@/components/landing/FinalCTA";
import FocusMode from "@/components/landing/FocusMode";
import Language from "@/components/landing/Language";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <Header />
      <Hero />
      <CompanyLogos />
      <FindInNaturalLanguage />
      <Security />
      <MissionStatement />
      <FinalCTA />
      <FocusMode />
      <Language />
      <Pricing />
      <Footer />
    </div>
  );
}
