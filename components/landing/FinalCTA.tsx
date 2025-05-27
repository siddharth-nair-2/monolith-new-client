"use client";

import { motion } from "framer-motion";
import AnimatedSearchDemo from "@/components/search-demo/AnimatedSearchDemo";

export default function FinalCTA() {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="rounded-t-lg border-b border-black/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid lg:grid-cols-5 md:gap-6 items-center">
            <motion.div
              className="lg:col-span-2 md:pl-12"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-serif text-custom-dark-green mb-8 leading-tight">
                Your documents become answers, not obstacles.
              </h2>
              <p className="text-lg text-custom-dark-green mb-10 leading-normal">
                Search by what you mean, not just what you type. Monolith
                extracts the right answers—even from deep, complex files.
              </p>
            </motion.div>
            {/* Animated Search Demo */}
            <motion.div
              className="mb-12 lg:col-span-3"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AnimatedSearchDemo />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}