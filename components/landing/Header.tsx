"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const navItemVariant = {
  hidden: { opacity: 0, y: -20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, delay },
  }),
};

const navHover = {
  scale: 1.02,
  transition: { duration: 0.15 },
};

const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.15 },
};

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-8 py-6">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <motion.a
          href="/"
          className="text-4xl font-serif text-custom-dark-green font-semibold"
          whileHover={navHover}
        >
          Mono<span className="underline">l</span>ith
        </motion.a>

        <div className="hidden md:flex items-center space-x-6 tracking-wide">
          <motion.a
            href={isHomePage ? "#how-it-works" : "/#how-it-works"}
            className="text-custom-dark-green hover:text-gray-900 text-md font-semibold"
            custom={0.1}
            initial="hidden"
            animate="visible"
            variants={navItemVariant}
            whileHover={navHover}
          >
            How It Works
          </motion.a>
          <motion.span
            className="text-custom-dark-green text-xs font-semibold"
            custom={0.15}
            initial="hidden"
            animate="visible"
            variants={navItemVariant}
          >
            |
          </motion.span>
          <motion.a
            href={isHomePage ? "#pricing" : "/#pricing"}
            className="text-custom-dark-green hover:text-gray-900 text-md font-semibold"
            custom={0.2}
            initial="hidden"
            animate="visible"
            variants={navItemVariant}
            whileHover={navHover}
          >
            Pricing
          </motion.a>
          <motion.span
            className="text-custom-dark-green text-xs font-semibold"
            custom={0.25}
            initial="hidden"
            animate="visible"
            variants={navItemVariant}
          >
            |
          </motion.span>
          <motion.a
            href={isHomePage ? "#case-studies" : "/#case-studies"}
            className="text-custom-dark-green hover:text-gray-900 text-md font-semibold"
            custom={0.3}
            initial="hidden"
            animate="visible"
            variants={navItemVariant}
            whileHover={navHover}
          >
            Case Studies
          </motion.a>
        </div>

        <div className="flex items-center space-x-4 tracking-wide">
          <motion.button
            className="text-custom-dark-green text-md font-semibold"
            custom={0.4}
            initial="hidden"
            animate="visible"
            variants={navItemVariant}
            whileHover={navHover}
          >
            Login
          </motion.button>
          <motion.button
            className="button-gradient text-custom-dark-green text-sm font-semibold px-4 py-2 rounded-sm"
            custom={0.5}
            initial="hidden"
            animate="visible"
            variants={navItemVariant}
            whileHover={buttonHover}
          >
            Sign Up
          </motion.button>
        </div>
      </nav>
    </header>
  );
}