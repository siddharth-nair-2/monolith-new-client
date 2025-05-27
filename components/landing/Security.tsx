"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Security() {
  return (
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
                <p className="text-white text-lg leading-normal opacity-80">
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
                <p className="text-white text-lg leading-normal opacity-80">
                  You control who sees what with granular permissions and SSO
                  integration.
                </p>
              </div>

              <div>
                <div className="mb-2">
                  <span className="text-white opacity-50 text-[10px] uppercase tracking-wider bg-white/10 px-2 py-1 rounded-sm">
                    COMPLIANCE
                  </span>
                </div>
                <p className="text-white text-lg leading-normal opacity-80">
                  Monolith is SOC 2 Type II certified, meeting the highest
                  industry standards.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}