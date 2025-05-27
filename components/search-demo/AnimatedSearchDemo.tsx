"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Search, Bookmark, Info } from "lucide-react";
import Image from "next/image";

type AnimationStage = "initial" | "searching" | "results";

export default function AnimatedSearchDemo() {
  const [stage, setStage] = useState<AnimationStage>("initial");
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const controls = useAnimation();
  const [showPulse, setShowPulse] = useState(false);

  const fullText = "Find me onboarding procedures from 2021";

  // Typing animation
  useEffect(() => {
    if (stage === "initial") {
      let index = 0;
      const timer = setInterval(() => {
        if (index <= fullText.length) {
          setTypedText(fullText.slice(0, index));
          index++;
        } else {
          clearInterval(timer);
          setShowCursor(true);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // Auto-progress through stages
  useEffect(() => {
    if (stage === "initial" && showCursor) {
      const timer = setTimeout(() => {
        setShowPulse(true);
        // Add a short delay for the pulse, then transition
        setTimeout(() => {
          setStage("searching");
        }, 600); // 600ms for pulse duration
      }, 900);
      return () => clearTimeout(timer);
    }

    if (stage === "searching") {
      const timer = setTimeout(() => {
        setStage("results");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stage, showCursor]);

  // Reset animation
  const resetAnimation = () => {
    setStage("initial");
    setTypedText("");
    setShowCursor(false);
    setShowPulse(false);
  };

  return (
    <div
      className="relative w-full h-[600px] overflow-hidden rounded-lg cursor-pointer"
      onClick={resetAnimation}
    >
      <AnimatePresence mode="wait">
        {stage === "initial" && (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Image Background */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src="/images/search-demo-1.png"
                alt="Search Demo Background"
                fill
                className="object-cover"
              />
            </div>

            {/* Search Bar Container */}
            <div className="absolute inset-0 flex items-center justify-center px-8">
              <motion.div
                className="w-full max-w-lg"
                layout
                layoutId="search-container"
              >
                {/* Search Bar */}
                <motion.div
                  className="bg-white rounded-full shadow-lg flex items-center px-8 py-4"
                  layoutId="search-bar"
                  animate={
                    showPulse
                      ? {
                          scale: [1, 1.02, 1],
                          boxShadow: [
                            "0 10px 25px rgba(0,0,0,0.1)",
                            "0 10px 25px #a3bc01a7",
                            "0 10px 25px rgba(0,0,0,0.1)",
                          ],
                        }
                      : {}
                  }
                  transition={
                    showPulse ? { duration: 0.6, ease: "easeInOut" } : {}
                  }
                >
                  <Search className="h-6 w-6 text-[#A3BC01] mr-4" />
                  <div className="flex-1 text-custom-dark-green text-lg">
                    {typedText}
                    {showCursor && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                        className="ml-1"
                      >
                        |
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {stage === "searching" && (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Image Background */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src="/images/search-demo-2.png"
                alt="Search Demo Background"
                fill
                className="object-cover"
              />
            </div>

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col px-8 py-6 pt-20">
              {/* Top Search Bar */}
              <motion.div
                className="flex justify-center mt-16 mb-12"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="bg-white rounded-full shadow-lg flex items-center px-6 py-3 max-w-lg w-full"
                  layoutId="search-bar"
                >
                  <Search className="h-4 w-4 text-[#A3BC01] mr-3" />
                  <span className="text-gray-800 text-sm flex-1">
                    {fullText}
                  </span>
                  <div className="ml-8 flex items-center -space-x-3">
                    <motion.div
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-white z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Image
                        src="/icons/slack.svg"
                        alt="Slack"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </motion.div>
                    <motion.div
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-white z-20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Image
                        src="/icons/sharepoint.svg"
                        alt="SharePoint"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </motion.div>
                    <motion.div
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-white z-30"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Image
                        src="/icons/pdf.svg"
                        alt="PDF"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Sophisticated Skeleton Preview */}
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden max-w-lg w-full mx-auto"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {/* Skeleton Header */}
                <motion.div
                  className="px-6 pt-8 pb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <h2 className="text-white text-5xl font-serif mb-10">
                    Finding Files
                  </h2>

                  {/* Tabs */}
                  <div className="flex justify-between items-center border-b-2 border-white/20 mb-2">
                    <div className="flex space-x-6">
                      <div className="text-white text-sm font-medium border-b-2 border-white pb-1">
                        Semantic Lookup
                      </div>
                      <div className="text-white/60 text-sm">
                        Keyword Results
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white/60 text-[10px]">
                        Indexing
                      </span>
                      <div className="flex items-center -space-x-1">
                        <div className="w-4 h-4 bg-white/30 rounded-full animate-pulse" />
                        <div className="w-4 h-4 bg-white/30 rounded-full animate-pulse" />
                        <div className="w-4 h-4 bg-white/30 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Document count skeleton */}
                  <div className="h-2 bg-white/20 rounded animate-pulse w-24 mt-2" />
                </motion.div>

                {/* Skeleton Results List */}
                <div className="p-6 pt-2">
                  {[1, 2].map((item, index) => (
                    <motion.div
                      key={item}
                      className="flex flex-col mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.3 }}
                    >
                      {/* Date/match info skeleton */}
                      <div className="flex justify-between mb-1">
                        <div className="flex space-x-4">
                          <div className="h-2 bg-white/20 rounded animate-pulse w-16" />
                          <div className="h-2 bg-white/20 rounded animate-pulse w-16" />
                        </div>
                        <div className="h-2 bg-white/20 rounded animate-pulse w-12" />
                      </div>

                      {/* Main result card skeleton */}
                      <div className="bg-white/5 rounded-sm p-4">
                        {/* Header with icon and title */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2 flex-1">
                            <div className="w-8 h-8 bg-white/20 rounded animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-white/25 rounded animate-pulse w-4/5" />
                              <div className="h-2 bg-white/15 rounded animate-pulse w-full" />
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-white/20 rounded animate-pulse" />
                            <div className="w-3 h-3 bg-white/20 rounded animate-pulse" />
                          </div>
                        </div>

                        {/* Content area */}
                        <div className="border-b border-white/10 pb-2 mb-2">
                          <div className="h-2 bg-white/15 rounded animate-pulse w-full mb-1" />
                          <div className="h-2 bg-white/15 rounded animate-pulse w-3/4 mb-2" />
                          {/* Steps skeleton */}
                          <div className="space-y-1">
                            <div className="h-2 bg-white/10 rounded animate-pulse w-5/6" />
                            <div className="h-2 bg-white/10 rounded animate-pulse w-4/5" />
                            <div className="h-2 bg-white/10 rounded animate-pulse w-3/4" />
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center">
                          <div className="h-1 bg-white/10 rounded animate-pulse w-1/3" />
                          <div className="flex items-center space-x-1">
                            <div className="h-1 bg-white/10 rounded animate-pulse w-12" />
                            <div className="w-3 h-3 bg-white/20 rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {stage === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Image Background */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src="/images/search-demo-3.png"
                alt="Search Demo Background"
                fill
                className="object-cover"
              />
            </div>

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col px-8 pt-6">
              {/* Top Search Bar */}
              <motion.div
                className="flex justify-center mt-8 mb-8"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="bg-white rounded-full shadow-lg flex items-center px-6 py-3 max-w-lg w-full"
                  layoutId="search-bar"
                >
                  <Search className="h-4 w-4 text-[#A3BC01] mr-3" />
                  <span className="text-gray-800 text-sm flex-1">
                    {fullText}
                  </span>
                </motion.div>
              </motion.div>

              {/* Results Container */}
              <motion.div
                className="flex-1 bg-white rounded-t-3xl shadow-lg overflow-hidden max-w-lg w-full mx-auto"
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                {/* Header */}
                <motion.div
                  className="p-6 pb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Green accent line */}
                  <div className="w-4 h-1 bg-[#8ECC3A] mb-4"></div>

                  <h2 className="text-2xl font-serif text-gray-800 mb-4 leading-tight">
                    Onboarding Procedures from 2021
                  </h2>

                  {/* Tabs with Source indicators */}
                  <div className="flex justify-between items-center border-b border-gray-200 mb-2">
                    <div className="flex space-x-6">
                      <div className="text-gray-800 text-xs font-medium border-b-2 border-[#A3BC01] pb-2">
                        Semantic Lookup
                      </div>
                      <div className="text-gray-400 text-xs pb-2">
                        Keyword Results
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-[10px]">
                        Indexing
                      </span>
                      <div className="flex items-center -space-x-1">
                        <div className="w-4 h-4 bg-[#EFEFEF] rounded-full flex items-center justify-center">
                          <Image
                            src="/icons/slack.svg"
                            alt="Slack"
                            width={10}
                            height={10}
                            className="object-contain"
                          />
                        </div>
                        <div className="w-4 h-4 bg-[#003A3D] rounded-full flex items-center justify-center">
                          <Image
                            src="/icons/sharepoint.svg"
                            alt="SharePoint"
                            width={10}
                            height={10}
                            className="object-contain"
                          />
                        </div>
                        <div className="w-4 h-4 bg-[#A3BC01] rounded-full flex items-center justify-center">
                          <Image
                            src="/icons/pdf.svg"
                            alt="pdf"
                            width={10}
                            height={10}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document count */}
                  <div className="text-[9px] text-gray-500">
                    150 Documents Found
                  </div>
                </motion.div>

                {/* Results List */}
                <div className="p-6 pt-2 max-h-80 overflow-y-hidden">
                  {/* Result Items */}
                  {[
                    {
                      title: "New employee onboarding procedures",
                      breadcrumb:
                        "Company External / HR Global / Documents / FY2021 / Procedures",
                      content:
                        "The current onboarding procedure involves 5 steps:",
                      steps: [
                        "Pre-boarding documentation,",
                        "First-day orientation,",
                        "Department-specific training,",
                        "System access setup,",
                        "30-day check-in.",
                      ],
                      shared: "Shared on Slack",
                      sharedIcon: "/icons/slack.svg",
                      footer:
                        "From Document: The current onboarding procedure involves 5 steps: 1) Pre-boarding documentation, 2) First-day orientation, 3) Department-specific training, 4) System access setup, and 5) 30-day check-in.",
                      created: "May 15, 2021",
                      updated: "May 17, 2021",
                      match: "95% Match",
                    },
                    {
                      title: "New employee onboarding procedures",
                      breadcrumb:
                        "Company External / HR Global / Documents / FY2021 / Procedures",
                      content:
                        "Remote onboarding guidelines for 2021 including virtual setup procedures.",
                      steps: [],
                      shared: "Shared on Slack",
                      sharedIcon: "/icons/slack.svg",
                      footer:
                        "From Document: The current onboarding procedure involves 5 steps: 1) Pre-boarding documentation, 2) First-day orientation, 3) Department-specific training, 4) System access setup, and 5) 30-day check-in.",
                      created: "June 03, 2021",
                      updated: "August 29, 2021",
                      match: "63% Match",
                    },
                  ].map((item, index) => (
                    <div className="flex flex-col mb-6" key={index}>
                      <motion.div
                        className="text-[8px] pb-1 text-gray-500/80 flex justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.2 }}
                      >
                        <div>
                          <span>Created: {item.created}</span>
                          <span className="text-[9px]">
                            &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
                          </span>
                          <span>Updated: {item.updated}</span>
                        </div>
                        <div>
                          <span>{item.match}</span>
                        </div>
                      </motion.div>
                      <motion.div
                        key={index}
                        className="rounded-sm p-4 pt-3 pb-0 bg-[#F8F8F8]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.2 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center justify-start space-x-2 flex-1 pb-2">
                            <div className="w-8 h-8 flex items-end mt-1">
                              <Image
                                src="/icons/pdf.svg"
                                alt="PDF"
                                width={58}
                                height={66}
                                className="object-contain"
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-center my-auto">
                              <h3 className="font-semibold text-gray-800 text-xs">
                                {item.title}
                              </h3>
                              <p className="text-[9px] text-gray-500">
                                {item.breadcrumb}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <Info className="h-3 w-3 text-gray-400" />
                            <Bookmark className="h-3 w-3 text-gray-400" />
                          </div>
                        </div>
                        <div className="border-b border-gray-200">
                          <p className="text-[9px] text-gray-700 mb-0 italic">
                            {item.content}
                          </p>
                          {item.steps.length > 0 && (
                            <ol className="text-[9px] text-gray-700 space-y-0 mb-2">
                              {item.steps.map((step, stepIndex) => (
                                <li key={stepIndex}>
                                  {stepIndex + 1}. {step}
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                        <div className="flex items-center justify-between py-2">
                          {/* Left: Content (occupies as much space as needed) */}
                          <p className="text-[4px] md:text-[6px] text-black/50 mb-0 w-3/4 md:w-1/2 leading-tight">
                            {item.footer}
                          </p>
                          {/* Right: "Shared on Slack" */}
                          <div className="flex items-center space-x-1">
                            <span className="text-[4px] md:text-[6px] text-gray-400">
                              Shared on Slack
                            </span>
                            {/* Replace with your icon */}
                            <span className="rounded-full bg-gray-100 p-1">
                              <Image
                                src={item.sharedIcon || "/placeholder.svg"}
                                alt={item.shared}
                                width={14}
                                height={14}
                                className="object-contain grayscale"
                              />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click to restart indicator */}
      <div className="absolute bottom-4 right-4 text-white font-bold text-xs bg-black/50 rounded-md px-2 py-1">
        Click to restart
      </div>
    </div>
  );
}
