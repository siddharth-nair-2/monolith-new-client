"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Home, LayoutDashboard, ArrowLeft, FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#A3BC02]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#E1F179]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#A3BC02]/3 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Monolith Logo */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link
              href="/"
              className="text-4xl md:text-5xl font-serif text-[#3E4128] hover:text-[#A3BC02] transition-colors inline-block"
            >
              Mono
              <span className="underline decoration-[#A3BC02] decoration-2 underline-offset-2">l</span>
              ith
            </Link>
          </motion.div>

          {/* 404 Icon and Message */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-[#A3BC02]/10 rounded-full">
                <FileQuestion className="w-16 h-16 text-[#A3BC02]" />
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-[#3E4128] mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-serif text-[#3E4128] mb-4">Oops! Page not found</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved. Let's help you find what you need.
            </p>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              asChild
              className="bg-[#A3BC02] hover:bg-[#8BA000] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-[#A3BC02]/20 hover:shadow-[#A3BC02]/30"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Go to Dashboard
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-[#A3BC02]/30 text-[#3E4128] hover:bg-[#A3BC02]/5 px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="text-gray-600 hover:text-[#3E4128] px-6 py-3 rounded-lg font-medium transition-all duration-200"
              onClick={() => window.history.back()}
            >
              <span className="flex items-center gap-2 cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </span>
            </Button>
          </motion.div>

          {/* Breadcrumb */}
          <motion.div
            className="mt-12 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link href="/" className="hover:text-[#A3BC02] transition-colors">
              Home
            </Link>
            <span className="mx-2">→</span>
            <span>404 Error</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}