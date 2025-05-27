"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <footer className="py-16 pb-8 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-4 md:mb-12">
          {/* Left - Tagline */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-4xl md:text-6xl font-serif text-custom-dark-green leading-tight text-center md:text-left">
              Mono<span className="underline decoration-4 underline-offset-8">l</span>ith finds it.
            </h3>
          </motion.div>

          {/* Right - Navigation Links */}
          <motion.div
            className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Product Column */}
            <div>
              <h4 className="text-custom-dark-green font-semibold mb-2 text-lg">
                Product
              </h4>
              <ul className="flex justify-start items-center gap-4">
                <li>
                  <a
                    href={isHomePage ? "#how-it-works" : "/#how-it-works"}
                    className="text-gray-600 hover:text-custom-dark-green transition-colors"
                  >
                    Features
                  </a>
                </li>
                <span className="text-gray-600 text-xs">|</span>
                <li>
                  <a
                    href={isHomePage ? "#how-it-works" : "/#how-it-works"}
                    className="text-gray-600 hover:text-custom-dark-green transition-colors"
                  >
                    Integrations
                  </a>
                </li>
                <span className="text-gray-600 text-xs">|</span>
                <li>
                  <a
                    href={isHomePage ? "#pricing" : "/#pricing"}
                    className="text-gray-600 hover:text-custom-dark-green transition-colors"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-custom-dark-green font-semibold mb-2 text-lg">
                Company
              </h4>
              <ul className="flex justify-start items-center gap-4">
                <li>
                  <a
                    href={isHomePage ? "#how-it-works" : "/#how-it-works"}
                    className="text-gray-600 hover:text-custom-dark-green transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <span className="text-gray-600 text-xs">|</span>
                <li>
                  <a
                    href={isHomePage ? "#how-it-works" : "/#how-it-works"}
                    className="text-gray-600 hover:text-custom-dark-green transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Bottom Footer */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-300"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Copyright */}
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2025 Monolith Inc. All rights reserved.
          </div>

          {/* Right side - Colored circles and links */}
          <div className="flex items-center space-x-10">
            {/* Colored circles */}
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-black rounded-full"></div>
              <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>

            {/* Legal links */}
            <div className="flex items-center space-x-10 text-sm">
              <a
                href="/privacy-policy"
                className="text-gray-500/60 hover:text-custom-dark-green transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                className="text-gray-500/60 hover:text-custom-dark-green transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}