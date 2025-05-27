"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function MissionStatement() {
  return (
    <section className="py-4 md:py-12 md:pt-18">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="mission-gradient rounded-sm py-12 md:py-16 px-6 sm:px-12 md:px-24 lg:px-32 xl:px-64 text-center shadow-sm"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.7 },
          }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-custom-dark-green mb-8 mt-8 leading-tight">
            We're building the foundation for intelligent content discovery.
          </h2>
          <motion.div
            whileHover={{
              scale: 1.03,
              transition: { duration: 0.15 },
            }}
          >
            <Button asChild className="button-gradient text-custom-dark-green px-4 py-3 text-sm font-medium rounded-sm">
              <a href="/waitlist">
                Built for Everyone. Join waitlist.
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}