"use client";

import { motion } from "framer-motion";
import FocusModeDemo from "@/components/focus-mode-demo/FocusModeDemo";

export default function FocusMode() {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="rounded-lg shadow-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid lg:grid-cols-5 md:gap-6 items-center">
            {/* Focus Mode Demo - Left side (3 columns) */}
            <motion.div
              className="mb-12 lg:col-span-3 order-2 lg:order-1"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FocusModeDemo />
            </motion.div>

            {/* Text Section - Right side (2 columns) */}
            <motion.div
              className="lg:col-span-2 pr-12 order-1 lg:order-2"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-serif text-custom-dark-green mb-8 leading-tight">
                Hello, Focus Mode
              </h2>
              <p className="text-lg text-custom-dark-green mb-6 leading-normal">
                Lets you create spaces by project, team, topic, or timeframe.
                It filters the noise, narrowing your search to only what's
                relevant.
              </p>
              <p className="text-lg text-custom-dark-green leading-normal opacity-75">
                No more digging through entire drives. Just instant,
                context-rich answers from the files that matter.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}