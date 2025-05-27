"use client";

import { motion } from "framer-motion";
import LanguageDemo from "@/components/language-demo/LanguageDemo";

export default function Language() {
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
              <span className="text-custom-dark-green text-xs font-medium p-2 py-1 bg-[#E1F179] rounded-xs">
                Coming Soon
              </span>
              <h2 className="text-4xl font-serif text-custom-dark-green my-4 leading-tight">
                Search that speaks your language.
              </h2>
              <p className="text-lg text-custom-dark-green mb-10 leading-normal">
                Monolith understands documents in French, English, German, and
                more — so every team member gets answers, no matter how or
                where content was written.
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
              <LanguageDemo />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}