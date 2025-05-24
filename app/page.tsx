import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Play, Lock, Info } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-8 py-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-2xl font-serif text-gray-800">
            Mono<span className="underline">l</span>ith
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              How It Works
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Pricing
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Case Studies
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-700 text-sm font-medium">Login</button>
            <button className="button-gradient text-gray-800 text-sm font-medium px-4 py-2 rounded-sm">Sign Up</button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient">
        <div className="text-center px-6 max-w-5xl mx-auto">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-serif text-gray-800 mb-8 leading-[0.9] tracking-tight">
            Know more. Move faster.
          </h1>
          <p className="text-xl text-gray-700 mb-16 font-light">Your team's collective brain, fully searchable.</p>
          <Button className="button-gradient text-gray-800 px-6 py-3 text-sm font-medium rounded-sm border border-gray-300">
            Join the Waitlist
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Try Semantic Lookup */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <button className="flex items-center text-gray-600 text-sm">
            Try Semantic Lookup
            <div className="ml-2 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-300">
              <Play className="h-3 w-3 text-gray-600 ml-0.5" />
            </div>
          </button>
        </div>
      </section>

      {/* Company Logos */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center space-x-16 opacity-70">
            <div className="text-sm font-medium text-gray-600">Teams Transformed</div>
            <div className="text-lg font-bold text-gray-800">JUNI</div>
            <div className="text-sm font-bold text-white bg-black px-3 py-1 rounded-sm">CEO</div>
            <div className="text-sm font-medium text-gray-600">BLOOM & WILD</div>
            <div className="text-sm font-medium text-gray-600 border border-gray-400 rounded-sm px-3 py-1">Salt</div>
            <div className="text-lg font-bold text-gray-800">JUNI</div>
          </div>
        </div>
      </section>

      {/* Find in Natural Language */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <h2 className="text-5xl font-serif text-gray-800 mb-8 leading-tight">Find in Natural Language</h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                Fast, precise, content-aware results that truly understand what you're looking for. Search across
                speech, text, audio, and visuals to explore your video in every dimension.
              </p>

              <div className="bg-gray-50 rounded-sm p-8 mb-8">
                <div className="text-lg text-gray-700 mb-8">Who was working on Infosys Team in 2011?</div>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="w-8 h-8 bg-red-500 rounded-sm flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="button-gradient text-gray-800 px-6 py-3 text-sm font-medium rounded-sm border border-gray-300">
                See It in Action
                <Info className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 text-white relative overflow-hidden" style={{ backgroundColor: "#181818" }}>
        {/* Faint laptop outline background */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-10">
          <svg width="600" height="400" viewBox="0 0 600 400" className="text-gray-600">
            <rect x="50" y="50" width="500" height="300" rx="20" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="70" y="70" width="460" height="260" rx="10" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="200" y="360" width="200" height="20" rx="10" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="100" y1="380" x2="500" y2="380" stroke="currentColor" strokeWidth="1" />
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
              <h2 className="text-5xl font-serif mb-2 leading-tight text-white">There's no Monolith.</h2>
              <h2 className="text-5xl font-serif mb-16 leading-tight text-gray-500">Without 100% Security.</h2>

              {/* Security points */}
              <div className="space-y-12">
                <div>
                  <div className="mb-4">
                    <span className="text-gray-400 text-xs uppercase tracking-wider border border-gray-600 px-2 py-1 rounded-sm">
                      ENCRYPTION
                    </span>
                  </div>
                  <p className="text-white text-lg leading-relaxed">
                    Your data stays locked up, both in transit (TLS) and at rest (AES-256).
                  </p>
                </div>

                <div>
                  <div className="mb-4">
                    <span className="text-gray-400 text-xs uppercase tracking-wider border border-gray-600 px-2 py-1 rounded-sm">
                      ACCESS
                    </span>
                  </div>
                  <p className="text-white text-lg leading-relaxed">
                    Only the right people see the right stuff, thanks to role-based permissions.
                  </p>
                </div>

                <div>
                  <div className="mb-4">
                    <span className="text-gray-400 text-xs uppercase tracking-wider border border-gray-600 px-2 py-1 rounded-sm">
                      ACCESS
                    </span>
                  </div>
                  <p className="text-white text-lg leading-relaxed">We'll never share or sell your data.</p>
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
            <h2 className="text-6xl font-serif text-gray-800 mb-16 leading-tight">
              At Monolith, we're foundationally changing the way people see, use, & understand content.
            </h2>
            <Button className="button-gradient text-gray-800 px-8 py-3 text-sm font-medium rounded-sm border border-gray-300">
              Built for Everyone. Join Waitlist
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
                <h2 className="text-4xl font-serif text-gray-800 mb-8 leading-tight">Find in Natural Language</h2>
                <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                  Fast, precise, content-aware results that truly understand what you're looking for. Search across
                  speech, text, audio, and visuals to explore your video in every dimension.
                </p>
                <Button className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 text-sm font-medium rounded-sm border border-gray-300">
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
                        <p className="text-sm text-gray-700">Hello! How can I help you today?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-blue-500 text-white rounded-lg rounded-bl-sm px-6 py-4 max-w-xs">
                        <p className="text-sm">I'm looking for information about our Q3 sales performance</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 pt-4">
                      <Input
                        placeholder="Type your message..."
                        className="flex-1 border-gray-200 rounded-sm px-4 py-3"
                      />
                      <Button size="sm" className="bg-[#A3BC02] hover:bg-[#8fa002] rounded-sm w-10 h-10 p-0">
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
  )
}
