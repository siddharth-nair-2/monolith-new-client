"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info, Search } from "lucide-react";
import { TypingEffect } from "@/components/typing-effect";
import Image from "next/image";

export default function FindInNaturalLanguage() {
  return (
    <section id="how-it-works" className="py-12 md:py-24 bg-white">
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
            <p className="text-lg text-custom-dark-green mb-10 leading-normal">
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
              <Button asChild className="button-gradient text-custom-dark-green px-4 py-3 text-sm font-medium rounded-sm">
                <a href="/waitlist">
                  See It in Action
                  <ArrowRight className="h-4 w-4" />
                </a>
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
  );
}