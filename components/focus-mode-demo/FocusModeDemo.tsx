"use client";

import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import Image from "next/image";

export default function FocusModeDemo() {
  return (
    <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden rounded-lg">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/focus-demo.png"
          alt="Focus Mode Demo Background"
          fill
          className="object-cover"
        />
      </div>

      {/* Top Pill Element */}
      <motion.div
        className="absolute top-24"
        style={{ left: "50%", x: "-50%" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="bg-white/20 rounded-full px-4 py-2 sm:px-6 sm:py-3 md:px-10 md:py-4 flex items-center space-x-2 sm:space-x-3">
          <PlusCircle
            className="w-5 h-5 sm:w-6 sm:h-6 text-custom-dark-green bg-white rounded-full drop-shadow-[0_3px_4px_#e0f557]"
            strokeWidth={1}
          />
          <span className="text-white font-medium text-sm sm:text-base md:text-lg whitespace-nowrap">
            2025 January Catchup
          </span>
        </div>
      </motion.div>
    </div>
  );
}
