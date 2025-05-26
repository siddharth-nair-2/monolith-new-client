"use client";

import { TypingEffect } from "@/components/typing-effect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Lock, Info, Search } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HomePage() {
  const navItemVariant = {
    hidden: { opacity: 0, y: -20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, delay },
    }),
  };

  const navHover = {
    scale: 1.05,
    color: "#A3BC00",
    transition: { duration: 0.15 },
  };

  const buttonHover = {
    scale: 1.05,
    transition: { duration: 0.15 },
  };

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-8 py-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-4xl font-serif text-custom-dark-green font-semibold">
            Mono<span className="underline">l</span>ith
          </div>

          <div className="hidden md:flex items-center space-x-6 tracking-wide">
            <motion.a
              href="#"
              className="text-custom-dark-green hover:text-gray-900 text-md font-semibold"
              custom={0.1}
              initial="hidden"
              animate="visible"
              variants={navItemVariant}
              whileHover={navHover}
            >
              How It Works
            </motion.a>
            <motion.span
              className="text-custom-dark-green text-xs font-semibold"
              custom={0.15}
              initial="hidden"
              animate="visible"
              variants={navItemVariant}
            >
              |
            </motion.span>
            <motion.a
              href="#"
              className="text-custom-dark-green hover:text-gray-900 text-md font-semibold"
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={navItemVariant}
              whileHover={navHover}
            >
              Pricing
            </motion.a>
            <motion.span
              className="text-custom-dark-green text-xs font-semibold"
              custom={0.25}
              initial="hidden"
              animate="visible"
              variants={navItemVariant}
            >
              |
            </motion.span>
            <motion.a
              href="#"
              className="text-custom-dark-green hover:text-gray-900 text-md font-semibold"
              custom={0.3}
              initial="hidden"
              animate="visible"
              variants={navItemVariant}
              whileHover={navHover}
            >
              Case Studies
            </motion.a>
          </div>

          <div className="flex items-center space-x-4 tracking-wide">
            <motion.button
              className="text-custom-dark-green text-md font-semibold"
              custom={0.4}
              initial="hidden"
              animate="visible"
              variants={navItemVariant}
              whileHover={navHover}
            >
              Login
            </motion.button>
            <motion.button
              className="button-gradient text-custom-dark-green text-sm font-semibold px-4 py-2 rounded-sm"
              custom={0.5}
              initial="hidden"
              animate="visible"
              variants={navItemVariant}
              whileHover={buttonHover}
            >
              Sign Up
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-dvh flex items-center justify-center hero-gradient">
        <motion.div
          className="text-center px-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Heading for medium and larger screens */}
          <motion.h1
            className="hidden md:block text-6xl md:text-6xl lg:text-8xl font-serif text-custom-dark-green mb-8 leading-[0.9] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            Know more. Move faster.
          </motion.h1>
          {/* Heading for small screens */}
          <motion.h1
            className="block md:hidden text-6xl font-serif text-custom-dark-green mb-8 leading-[0.9] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            Know more. <br /> Move faster.
          </motion.h1>
          <motion.p
            className="text-xl text-custom-dark-green mb-16 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            Your team's collective brain, fully searchable.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.3, delay: 0.8 }, // Only for animate
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.15 }, // Only for hover
            }}
          >
            <Button className="button-gradient text-black px-6 py-3 text-sm font-medium rounded-sm">
              Join the Waitlist
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Try Semantic Lookup */}
        <div className="absolute bottom-8 sm:bottom-12 left-1/2">
          <motion.button
            className="flex items-center text-custom-dark-green text-sm sm:text-md"
            initial={{ opacity: 0, x: "-50%" }}
            animate={{
              opacity: 1,
              x: "-50%",
              transition: { duration: 0.5, delay: 0.5 },
            }}
            whileHover={{
              scale: 1.05,
              x: "-50%", // Keep x consistent during hover
              transition: { duration: 0.05, delay: 0.01 },
            }}
          >
            Try Semantic Lookup ™
            <Info
              fill="#ffffff"
              strokeWidth={1}
              className="h-5 w-5 sm:h-6 sm:w-6 text-custom-dark-green ml-1.5 sm:ml-2.5"
            />
          </motion.button>
        </div>
      </section>

      {/* Company Logos */}
      <section className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-6 lg:space-x-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-3xl font-medium text-custom-dark-green font-serif mb-8 md:mb-0 md:mr-6 lg:mr-8">
              Teams, Transformed.
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { src: "/images/company4.png", alt: "Juni" },
                { src: "/images/company3.png", alt: "Cleo" },
                { src: "/images/company2.png", alt: "Bloom" },
                { src: "/images/company1.png", alt: "Volt" },
                { src: "/images/company4.png", alt: "Juni" },
              ].map((company, index) => (
                <motion.div
                  key={index}
                  className="border border-gray-300 rounded-sm p-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.3, delay: index * 0.1 },
                  }}
                  viewport={{ once: true, amount: 0.5 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 0px 10px rgba(163, 188, 0, 0.3)",
                    transition: { duration: 0.15 },
                  }}
                >
                  <Image
                    src={company.src}
                    alt={company.alt}
                    width={150}
                    height={150}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Find in Natural Language */}
      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Grid for Text Content and Button */}
          <motion.div
            className="grid lg:grid-cols-3 gap-2 md:gap-12 items-start mb-12 "
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="lg:col-span-2">
              {/* Contains H2 and P */}
              <h2 className="text-5xl md:text-6xl font-serif text-custom-dark-green mb-8 leading-tight">
                Find in Natural Language
              </h2>
              <p className="text-lg text-custom-dark-green mb-10 leading-relaxed">
                Fast, precise, content-aware results that truly understand your
                documents. Securely search and chat across all your text, from
                reports to contracts, for deeper insights.
              </p>
            </div>
            {/* End of lg:col-span-2 div */}
            {/* Button div - occupies the 3rd column */}
            <div className="flex justify-center md:justify-end items-center h-full">
              {/* items-start to align button top if text wraps */}
              <motion.div
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.15 },
                }}
              >
                <Button className="button-gradient text-custom-dark-green px-4 py-3 text-sm font-medium rounded-sm">
                  See It in Action
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
              <Info
                fill="#ffffff"
                strokeWidth={1}
                className="h-5 w-5 sm:h-6 sm:w-6 text-custom-dark-green ml-1.5 sm:ml-2.5 drop-shadow-[0_2px_3px_#e1f179]"
              />
            </div>
          </motion.div>

          {/* Flex Wrapper for 60/40 Search Bar and Icons - Responsive */}
          <div className="mb-12 md:flex md:items-center md:space-x-4">
            {/* Search Bar - Responsive Width & Margin */}
            <motion.div
              className="w-full md:w-3/5 relative rounded-lg bg-white transition-all drop-shadow-[0_0_16px_rgba(163,188,0,0.28)] mb-6 md:mb-0"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center">
                <Search
                  color="#3e4128"
                  strokeWidth={1}
                  className="absolute left-8 h-4 w-4 md:h-7 md:w-7 text-muted-foreground drop-shadow-[0_2px_3px_#e1f179]"
                />
                <div className="text-custom-dark-green border-0 bg-transparent pl-16 md:pl-20 pr-4 py-4 text-[10px] md:text-2xl shadow-none focus-visible:ring-0 text-left">
                  <TypingEffect
                    phrases={[
                      "Where is the latest marketing budget?",
                      "What are our current onboarding procedures?",
                      "Who is the project manager for the ACME account?",
                      "When is the next team meeting scheduled?",
                      "What's the login for our VPN account?",
                    ]}
                    typingSpeed={50}
                    deletingSpeed={30}
                    delayAfterPhrase={2000}
                  />
                </div>
              </div>
            </motion.div>
            {/* End of Search Bar Div */}

            {/* Icons Container - Responsive Width, Justification & Padding */}
            <div className="w-full md:w-2/5 flex items-center justify-center md:justify-start md:pl-12 space-x-8">
              {/* Slack Icon */}
              <motion.div
                className="bg-[radial-gradient(circle,_rgba(225,241,121,0.25)_0%,_rgba(225,241,121,0)_100%)] w-10 h-10 p-1 md:w-16 md:h-16 md:p-2 rounded-full flex items-center justify-center border-t-2 border-l-2 border-[#A3BC00]/40"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.4, delay: 0.4 },
                }}
                viewport={{ once: true, amount: 0.5 }}
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.15 },
                }}
              >
                <Image
                  src="/icons/slack.svg"
                  alt="Slack"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </motion.div>
              {/* SharePoint Icon */}
              <motion.div
                className="bg-[radial-gradient(circle,_rgba(225,241,121,0.25)_40%,_rgba(225,241,121,0)_100%)] w-10 h-10 p-1 md:w-16 md:h-16 md:p-2 rounded-full flex items-center justify-center border-t-2 border-l-2 border-[#A3BC00]/40"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.4, delay: 0.5 },
                }}
                viewport={{ once: true, amount: 0.5 }}
                whileHover={{
                  scale: 1.1,
                  rotate: -5,
                  transition: { duration: 0.15 },
                }}
              >
                <Image
                  src="/icons/sharepoint.svg"
                  alt="SharePoint"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </motion.div>
              {/* PDF Icon */}
              <motion.div
                className="w-10 h-10 p-1.5 md:w-16 md:h-16 md:p-3 rounded-full flex items-center justify-center border-t-2 border-l-2 border-[#8C181A]/40"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.4, delay: 0.6 },
                }}
                viewport={{ once: true, amount: 0.5 }}
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.15 },
                }}
              >
                <Image
                  src="/icons/pdf.svg"
                  alt="PDF"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </motion.div>
            </div>
            {/* End of Icons Container */}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 text-white relative overflow-hidden bg-security">
        <div className="max-w-7xl mx-auto px-6 relative z-10 bg-transparent">
          <div className="grid lg:grid-cols-2 gap-20 bg-transparent">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8 }}
            >
              {/* Green shield icon */}
              <div className="mb-6">
                <div className="w-12 h-12 rounded-sm flex items-center justify-start">
                  {/* <Lock className="h-6 w-6 text-[#A3BC02]" /> */}
                  <Image
                    src="/icons/security.svg"
                    alt="security"
                    width={27}
                    height={27}
                  />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-6xl font-serif mb-0 leading-tight text-white">
                There's no Mono
                <u className="underline decoration-1 underline-offset-8">l</u>
                ith.
              </h2>
              <h2 className="text-6xl font-serif mb-16 leading-tight text-[#8B8B8B]">
                Without 100% Security.
              </h2>

              {/* Security points */}
              <div className="space-y-8">
                <div>
                  <div className="mb-2">
                    <span className="text-white opacity-50 text-[10px] uppercase tracking-wider bg-white/10 px-2 py-1 rounded-sm">
                      ENCRYPTION
                    </span>
                  </div>
                  <p className="text-white text-lg leading-relaxed opacity-80">
                    Your data stays locked up, both in transit (TLS) and at rest
                    (AES-256).
                  </p>
                </div>

                <div>
                  <div className="mb-2">
                    <span className="text-white opacity-50 text-[10px] uppercase tracking-wider bg-white/10 px-2 py-1 rounded-sm">
                      ACCESS
                    </span>
                  </div>
                  <p className="text-white text-lg leading-relaxed opacity-80">
                    Only the right people see the right stuff, thanks to
                    role-based permissions.
                  </p>
                </div>

                <div>
                  <div className="mb-2">
                    <span className="text-white opacity-50 text-[10px] uppercase tracking-wider bg-white/10 px-2 py-1 rounded-sm">
                      ACCESS
                    </span>
                  </div>
                  <p className="text-white text-lg leading-relaxed opacity-80">
                    We'll never share or sell your data.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right column - empty to let background illustration show */}
            <div></div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="mission-gradient rounded-sm py-16 px-64 text-center shadow-sm"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.7 },
            }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-6xl font-serif text-custom-dark-green mb-8 mt-8 leading-tight">
              We're building the foundation for intelligent content discovery.
            </h2>
            <motion.div
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.15 },
              }}
            >
              <Button className="button-gradient text-custom-dark-green px-4 py-3 text-sm font-medium rounded-sm">
                Built for Everyone. Join waitlist.
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="bg-white rounded-lg p-12 shadow-sm border border-gray-200"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-serif text-custom-dark-green mb-8 leading-tight">
                  Find in Natural Language
                </h2>
                <p className="text-lg text-custom-dark-green mb-10 leading-relaxed">
                  Fast, precise, content-aware results that truly understand
                  what you're looking for. Search across speech, text, audio,
                  and visuals to explore your video in every dimension.
                </p>
                <motion.div
                  whileHover={{
                    scale: 1.03,
                    transition: { duration: 0.15 },
                  }}
                >
                  <Button className="bg-white hover:bg-gray-50 text-custom-dark-green px-6 py-3 text-sm font-medium rounded-sm border border-gray-300">
                    See it in Action
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Gradient background for chat interface */}
                <div className="absolute inset-0 rounded-lg final-gradient"></div>
                {/* Chat interface */}
                <motion.div
                  className="relative bg-white rounded-lg p-8 shadow-xl mx-8 my-8"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0px 15px 30px rgba(0,0,0,0.15)",
                    transition: { duration: 0.2 },
                  }}
                >
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <motion.div
                        className="bg-gray-100 rounded-lg rounded-br-sm px-6 py-4 max-w-xs"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                      >
                        <p className="text-sm text-custom-dark-green">
                          Hello! How can I help you today?
                        </p>
                      </motion.div>
                    </div>
                    <div className="flex justify-start">
                      <motion.div
                        className="bg-blue-500 text-white rounded-lg rounded-bl-sm px-6 py-4 max-w-xs"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                      >
                        <p className="text-sm">
                          I'm looking for information about our Q3 sales
                          performance
                        </p>
                      </motion.div>
                    </div>
                    <div className="flex items-center space-x-3 pt-4">
                      <Input
                        placeholder="Type your message..."
                        className="flex-1 border-gray-200 rounded-sm px-4 py-3"
                      />
                      <motion.div
                        whileHover={{
                          scale: 1.1,
                          transition: { duration: 0.1 },
                        }}
                        whileTap={{
                          scale: 0.9,
                          transition: { duration: 0.05 },
                        }}
                      >
                        <Button
                          size="sm"
                          className="bg-[#A3BC02] hover:bg-[#8fa002] rounded-sm w-10 h-10 p-0"
                        >
                          <ArrowRight className="h-4 w-4 text-white" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
