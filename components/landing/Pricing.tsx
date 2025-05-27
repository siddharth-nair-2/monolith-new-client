"use client";

import { motion } from "framer-motion";

export default function Pricing() {
  return (
    <section id="pricing" className="py-6 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-serif text-custom-dark-green mb-6 leading-tight">
            Scale your thinking
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From personal search to collective intelligence. Find a plan that
            fits.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Individual Plan */}
          <motion.div
            className="first-pricing-card rounded-lg p-8 h-full flex flex-col"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex-1">
              <h3 className="text-4xl font-serif text-custom-dark-green mb-2">
                Individual
              </h3>
              <p className="text-custom-dark-green/50 mb-8 text-sm leading-snug">
                Built for individual pros who want deeper, faster
                understanding across their files.
              </p>

              <div className="space-y-5 my-24">
                <div className="text-custom-dark-green">
                  Full platform access
                </div>
                <div className="text-custom-dark-green">
                  Unlimited document intelligence
                </div>
                <div className="text-custom-dark-green">
                  Priority email support
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="text-4xl font-serif text-custom-dark-green mb-2">
                $17.50
                <span className="text-sm font-sans text-gray-600 ml-2">
                  / user / month
                </span>
              </div>
            </div>
          </motion.div>

          {/* Team Plan - Highlighted */}
          <motion.div
            className="center-pricing-card rounded-lg p-8 h-full flex flex-col relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex-1">
              <h3 className="text-4xl font-serif text-white mb-2">Team</h3>
              <p className="text-white/70 mb-8 text-sm leading-snug">
                For teams of up to 4 that need shared spaces, smart
                collaboration, and collective insight.
              </p>

              <div className="space-y-5 my-24">
                <div className="text-white/90">Everything in Individual</div>
                <div className="text-white/90">
                  Team collaboration features
                </div>
                <div className="text-white/90">Priority support</div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="text-4xl font-serif text-white">
                $50.00
                <span className="text-sm font-sans text-white/80 ml-2">
                  / month
                </span>
              </div>
              <div className="text-xs text-white/80 -mb-2">
                Includes up to 4 users.
              </div>
            </div>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            className="last-pricing-card rounded-lg p-8 h-full flex flex-col"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex-1">
              <h3 className="text-4xl font-serif text-white mb-2">
                Enterprise
              </h3>
              <p className="text-white/50 mb-8 text-sm leading-snug">
                Built for individual pros who want deeper, faster
                understanding across their files.
              </p>

              <div className="space-y-5 my-24">
                <div className="text-gray-300">Everything in Team</div>
                <div className="text-gray-300">
                  Advanced Security Features
                </div>
                <div className="text-gray-300">Custom integrations</div>
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-4xl font-serif text-white">
                $15.00
                <span className="text-sm font-sans text-gray-400 ml-2">
                  / user / month
                </span>
              </div>
              <div className="text-xs text-white/80 -mb-2">
                After first 4 users ($50 base)
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}