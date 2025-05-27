"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function LanguageDemo() {
  return (
    <div className="bg-red-500 relative w-full h-[400px] md:h-[600px] overflow-hidden rounded-lg">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/language-demo.png"
          alt="Language Demo Background"
          fill
          className="object-cover"
        />
      </div>

      {/* Top Pill Element */}
      <motion.div
        className="relative z-10 flex justify-center items-center w-full h-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="custom-double-shadow bg-white rounded-full px-4 py-3 sm:px-6 sm:py-3 md:px-10 md:py-4 flex items-center space-x-2 sm:space-x-3">
          <span className="text-custom-dark-green font-medium text-sm sm:text-base md:text-xl whitespace-nowrap">
            Dutch Language Support Coming Soon.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
