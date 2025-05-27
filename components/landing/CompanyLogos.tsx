"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function CompanyLogos() {
  return (
    <section className="pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-6 lg:space-x-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-3xl font-medium text-custom-dark-green font-serif mb-8 md:mb-0 md:mr-6 lg:mr-8">
            Teams, Transformed.
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { src: "/images/company4.png", alt: "Juni" },
              { src: "/images/company3.png", alt: "Cleo" },
              { src: "/images/company2.png", alt: "Bloom" },
              { src: "/images/company1.png", alt: "Volt" },
              { src: "/images/company4.png", alt: "Juni" },
            ].map((company, index) => (
              <motion.div
                key={index}
                className="border border-gray-300 rounded-sm p-2"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.3, delay: index * 0.1 },
                }}
                viewport={{ once: true, amount: 0.5 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 0px 10px rgba(163, 188, 0, 0.3)",
                  transition: { duration: 0.15 },
                }}
              >
                <Image
                  src={company.src}
                  alt={company.alt}
                  width={150}
                  height={150}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}