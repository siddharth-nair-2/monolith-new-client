"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";

export default function Hero() {
  return (
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
          <Button asChild className="button-gradient text-black px-6 py-3 text-sm font-medium rounded-sm">
            <a href="/waitlist">
              Join the Waitlist
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
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
  );
}