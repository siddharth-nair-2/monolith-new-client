import { TypingEffect } from "@/components/typing-effect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Lock, Info, Search } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-8 py-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-4xl font-serif text-custom-dark-green font-semibold">
            Mono<span className="underline">l</span>ith
          </div>

          <div className="hidden md:flex items-center space-x-6 tracking-wide">
            <a
              href="#"
              className="text-custom-dark-green hover:text-gray-900 text-md font-semibold"
            >
              How It Works
            </a>
            <span className="text-custom-dark-green text-xs font-semibold">
              |
            </span>
            <a
              href="#"
              className="text-custom-dark-green hover:text-gray-900 text-md font-semibold"
            >
              Pricing
            </a>
            <span className="text-custom-dark-green text-xs font-semibold">
              |
            </span>
            <a
              href="#"
              className="text-custom-dark-green hover:text-gray-900 text-md font-semibold"
            >
              Case Studies
            </a>
          </div>

          <div className="flex items-center space-x-4 tracking-wide">
            <button className="text-custom-dark-green text-md font-semibold">
              Login
            </button>
            <button className="button-gradient text-custom-dark-green text-sm font-semibold px-4 py-2 rounded-sm">
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-dvh flex items-center justify-center hero-gradient">
        <div className="text-center px-6 max-w-5xl mx-auto">
          {/* Heading for medium and larger screens */}
          <h1 className="hidden md:block text-6xl md:text-6xl lg:text-8xl font-serif text-custom-dark-green mb-8 leading-[0.9] tracking-tight">
            Know more. Move faster.
          </h1>
          {/* Heading for small screens */}
          <h1 className="block md:hidden text-6xl font-serif text-custom-dark-green mb-8 leading-[0.9] tracking-tight">
            Know more. <br /> Move faster.
          </h1>
          <p className="text-xl text-custom-dark-green mb-16 font-light">
            Your team's collective brain, fully searchable.
          </p>
          <Button className="button-gradient text-black px-6 py-3 text-sm font-medium rounded-sm">
            Join the Waitlist
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Try Semantic Lookup */}
        <div className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2">
          <button className="flex items-center text-custom-dark-green text-sm sm:text-md">
            Try Semantic Lookup ™
            <Info
              fill="#ffffff"
              strokeWidth={1}
              className="h-5 w-5 sm:h-6 sm:w-6 text-custom-dark-green ml-1.5 sm:ml-2.5"
            />
          </button>
        </div>
      </section>

      {/* Company Logos */}
      <section className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-6 lg:space-x-8">
            <div className="text-3xl font-medium text-custom-dark-green font-serif mb-8 md:mb-0 md:mr-6 lg:mr-8">
              Teams, Transformed.
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="border border-gray-300 rounded-sm p-2">
                <Image
                  src="/images/company4.png"
                  alt="Juni"
                  width={150}
                  height={150}
                />
              </div>
              <div className="border border-gray-300 rounded-sm p-2">
                <Image
                  src="/images/company3.png"
                  alt="Cleo"
                  width={150}
                  height={150}
                />
              </div>
              <div className="border border-gray-300 rounded-sm p-2">
                <Image
                  src="/images/company2.png"
                  alt="Bloom"
                  width={150}
                  height={150}
                />
              </div>
              <div className="border border-gray-300 rounded-sm p-2">
                <Image
                  src="/images/company1.png"
                  alt="Volt"
                  width={150}
                  height={150}
                />
              </div>
              <div className="border border-gray-300 rounded-sm p-2">
                <Image
                  src="/images/company4.png"
                  alt="Juni"
                  width={150}
                  height={150}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find in Natural Language */}
      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Grid for Text Content and Button */}
          <div className="grid lg:grid-cols-3 gap-2 md:gap-12 items-start mb-12 ">
            <div className="lg:col-span-2">
              {/* Contains H2 and P */}
              <h2 className="text-5xl md:text-6xl font-serif text-custom-dark-green mb-8 leading-tight">
                Find in Natural Language
              </h2>
              <p className="text-lg text-custom-dark-green mb-10 leading-relaxed">
                Fast, precise, content-aware results that truly understand your
                documents. Securely search and chat across all your text, from
                reports to contracts, for deeper insights.
              </p>
            </div>
            {/* End of lg:col-span-2 div */}
            {/* Button div - occupies the 3rd column */}
            <div className="flex justify-center md:justify-end items-center h-full">
              {/* items-start to align button top if text wraps */}
              <Button className="button-gradient text-custom-dark-green px-4 py-3 text-sm font-medium rounded-sm">
                See It in Action
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Info
                fill="#ffffff"
                strokeWidth={1}
                className="h-5 w-5 sm:h-6 sm:w-6 text-custom-dark-green ml-1.5 sm:ml-2.5 drop-shadow-[0_2px_3px_#e1f179]"
              />
            </div>
          </div>

          {/* Flex Wrapper for 60/40 Search Bar and Icons - Responsive */}
          <div className="mb-12 md:flex md:items-center md:space-x-4">
            {/* Search Bar - Responsive Width & Margin */}
            <div className="w-full md:w-3/5 relative rounded-lg bg-white transition-all drop-shadow-[0_0_16px_rgba(163,188,0,0.28)] mb-6 md:mb-0">
              <div className="flex items-center">
                <Search
                  color="#3e4128"
                  strokeWidth={1}
                  className="absolute left-8 h-4 w-4 md:h-7 md:w-7 text-muted-foreground drop-shadow-[0_2px_3px_#e1f179]"
                />
                <div className="text-custom-dark-green border-0 bg-transparent pl-16 md:pl-20 pr-4 py-4 text-[10px] md:text-2xl shadow-none focus-visible:ring-0 text-left">
                  <TypingEffect
                    phrases={[
                      "Where is the latest marketing budget?",
                      "What are our current onboarding procedures?",
                      "Who is the project manager for the ACME account?",
                      "When is the next team meeting scheduled?",
                      "What's the login for our VPN account?",
                    ]}
                    typingSpeed={50}
                    deletingSpeed={30}
                    delayAfterPhrase={2000}
                  />
                </div>
              </div>
            </div>
            {/* End of Search Bar Div */}

            {/* Icons Container - Responsive Width, Justification & Padding */}
            <div className="w-full md:w-2/5 flex items-center justify-center md:justify-start md:pl-12 space-x-8">
              {/* Slack Icon */}
              <div className="bg-[radial-gradient(circle,_rgba(225,241,121,0.25)_0%,_rgba(225,241,121,0)_100%)] w-15 h-15 p-2 rounded-full flex items-center justify-center border-t-2 border-l-2 border-[#A3BC00]/40">
                <Image
                  src="/icons/slack.svg"
                  alt="Slack"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              {/* SharePoint Icon */}
              <div className="bg-[radial-gradient(circle,_rgba(225,241,121,0.25)_40%,_rgba(225,241,121,0)_100%)] w-15 h-15 p-2 rounded-full flex items-center justify-center border-t-2 border-l-2 border-[#A3BC00]/40">
                <Image
                  src="/icons/sharepoint.svg"
                  alt="SharePoint"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              {/* PDF Icon */}
              <div className="w-15 h-15 p-3 rounded-full flex items-center justify-center border-t-2 border-l-2 border-[#8C181A]/40">
                <Image
                  src="/icons/pdf.svg"
                  alt="PDF"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
            {/* End of Icons Container */}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section
        className="py-24 text-white relative overflow-hidden"
        style={{ backgroundColor: "#181818" }}
      >
        {/* Faint laptop outline background */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-10">
          <svg
            width="600"
            height="400"
            viewBox="0 0 600 400"
            className="text-custom-dark-green"
          >
            <rect
              x="50"
              y="50"
              width="500"
              height="300"
              rx="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="70"
              y="70"
              width="460"
              height="260"
              rx="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <rect
              x="200"
              y="360"
              width="200"
              height="20"
              rx="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <line
              x1="100"
              y1="380"
              x2="500"
              y2="380"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20">
            <div>
              {/* Green shield icon */}
              <div className="mb-8">
                <div className="w-12 h-12 border-2 border-[#A3BC02] rounded-sm flex items-center justify-center">
                  <Lock className="h-6 w-6 text-[#A3BC02]" />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-5xl font-serif mb-2 leading-tight text-white">
                There's no Monolith.
              </h2>
              <h2 className="text-5xl font-serif mb-16 leading-tight text-gray-500">
                Without 100% Security.
              </h2>

              {/* Security points */}
              <div className="space-y-12">
                <div>
                  <div className="mb-4">
                    <span className="text-gray-400 text-xs uppercase tracking-wider border border-gray-600 px-2 py-1 rounded-sm">
                      ENCRYPTION
                    </span>
                  </div>
                  <p className="text-white text-lg leading-relaxed">
                    Your data stays locked up, both in transit (TLS) and at rest
                    (AES-256).
                  </p>
                </div>

                <div>
                  <div className="mb-4">
                    <span className="text-gray-400 text-xs uppercase tracking-wider border border-gray-600 px-2 py-1 rounded-sm">
                      ACCESS
                    </span>
                  </div>
                  <p className="text-white text-lg leading-relaxed">
                    Only the right people see the right stuff, thanks to
                    role-based permissions.
                  </p>
                </div>

                <div>
                  <div className="mb-4">
                    <span className="text-gray-400 text-xs uppercase tracking-wider border border-gray-600 px-2 py-1 rounded-sm">
                      ACCESS
                    </span>
                  </div>
                  <p className="text-white text-lg leading-relaxed">
                    We'll never share or sell your data.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column - empty to let background illustration show */}
            <div></div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mission-gradient rounded-lg p-16 text-center border border-gray-200 shadow-sm">
            <h2 className="text-6xl font-serif text-custom-dark-green mb-16 leading-tight">
              At Monolith, we're changing the way people see, use, & understand
              content.
            </h2>
            <Button className="button-gradient text-custom-dark-green px-8 py-3 text-sm font-medium rounded-sm border border-gray-300">
              Built for Everyone.
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl font-serif text-custom-dark-green mb-8 leading-tight">
                  Find in Natural Language
                </h2>
                <p className="text-lg text-custom-dark-green mb-10 leading-relaxed">
                  Fast, precise, content-aware results that truly understand
                  what you're looking for. Search across speech, text, audio,
                  and visuals to explore your video in every dimension.
                </p>
                <Button className="bg-white hover:bg-gray-50 text-custom-dark-green px-6 py-3 text-sm font-medium rounded-sm border border-gray-300">
                  See it in Action
                </Button>
              </div>

              <div className="relative">
                {/* Gradient background for chat interface */}
                <div className="absolute inset-0 rounded-lg final-gradient"></div>

                {/* Chat interface */}
                <div className="relative bg-white rounded-lg p-8 shadow-xl mx-8 my-8">
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <div className="bg-gray-100 rounded-lg rounded-br-sm px-6 py-4 max-w-xs">
                        <p className="text-sm text-custom-dark-green">
                          Hello! How can I help you today?
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-blue-500 text-white rounded-lg rounded-bl-sm px-6 py-4 max-w-xs">
                        <p className="text-sm">
                          I'm looking for information about our Q3 sales
                          performance
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 pt-4">
                      <Input
                        placeholder="Type your message..."
                        className="flex-1 border-gray-200 rounded-sm px-4 py-3"
                      />
                      <Button
                        size="sm"
                        className="bg-[#A3BC02] hover:bg-[#8fa002] rounded-sm w-10 h-10 p-0"
                      >
                        <ArrowRight className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
