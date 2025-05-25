import type React from "react"
import type { Metadata } from "next"
import { Instrument_Sans, Instrument_Serif } from "next/font/google"
import "./globals.css"

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  weight: ["400", "600", "700"],
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
})

export const metadata: Metadata = {
  title: "Monolith - Know more. Move faster.",
  description: "Your team's collective brain, fully searchable.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
