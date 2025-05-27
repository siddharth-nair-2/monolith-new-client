"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileCheck, Users, Zap } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "Your data is protected with AES-256 encryption both in transit and at rest, ensuring maximum security.",
  },
  {
    icon: Shield,
    title: "Regular Security Audits",
    description:
      "We proactively assess our infrastructure for vulnerabilities to ensure robust data protection.",
  },
  {
    icon: Eye,
    title: "Granular Access Control",
    description:
      "Control exactly who can access what with role-based permissions and SSO integration.",
  },
  {
    icon: FileCheck,
    title: "GDPR Compliant",
    description:
      "Full compliance with European data protection regulations and privacy requirements.",
  },
  {
    icon: Users,
    title: "Zero Trust Architecture",
    description:
      "Every request is verified and authenticated, ensuring no unauthorized access.",
  },
  {
    icon: Zap,
    title: "Real-time Monitoring",
    description:
      "24/7 security monitoring with instant threat detection and response capabilities.",
  },
];

export default function Security() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 py-12 border-b border-gray-500/10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-[#A3BC02]/10 text-[#3E4128] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Enterprise Security
          </div>
          <h2 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">
            <span className="text-[#3E4128]">There's no Mono</span>
            <span className="text-[#3E4128] underline decoration-[#A3BC02] decoration-2 underline-offset-8">
              l
            </span>
            <span className="text-[#3E4128]">ith</span>
            <br />
            <span className="text-gray-500">without 100% Security.</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your data deserves the highest level of protection. We've built
            security into every layer of our platform, so you can focus on what
            matters most.
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-gray-50 rounded-2xl p-8 h-full hover:bg-gray-100 transition-colors duration-300">
                <div className="w-12 h-12 bg-[#A3BC02]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#A3BC02]/20 transition-colors duration-300">
                  <feature.icon className="h-6 w-6 text-[#3E4128]" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-[#3E4128] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-[#3E4128] to-[#2A2E1A] rounded-3xl p-12 text-white py-12"
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#A3BC02] mb-2">
                99.9%
              </div>
              <div className="text-white/80">Uptime Target</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#A3BC02] mb-2">
                256-bit
              </div>
              <div className="text-white/80">Data Encryption</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#A3BC02] mb-2">
                Role-Based
              </div>
              <div className="text-white/80">Permissions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#A3BC02] mb-2">
                Real-Time
              </div>
              <div className="text-white/80">Audit Logs</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
