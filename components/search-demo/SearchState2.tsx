import { Search, Loader2 } from "lucide-react";

export default function SearchState2() {
  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600" />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col px-8 py-6">
        {/* Top Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full shadow-lg flex items-center px-4 py-2 max-w-sm">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-800 text-xs">
              Find me onboarding procedures from 2021
            </span>
            <div className="ml-2 flex items-center space-x-1">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Loader2 className="h-3 w-3 text-white animate-spin" />
              </div>
            </div>
          </div>
        </div>

        {/* Finding Files Section */}
        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-light mb-4">Finding Files</h2>

          {/* Tabs */}
          <div className="flex justify-center space-x-8">
            <div className="text-white text-sm font-medium border-b-2 border-white pb-1">
              Semantic Lookup
            </div>
            <div className="text-white/60 text-sm">Keyword Results</div>
          </div>
        </div>

        {/* Loading Skeleton */}
        <div className="flex-1 bg-white/10 rounded-lg p-6">
          <div className="space-y-4">
            {/* Skeleton Items */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/20 rounded animate-pulse w-3/4" />
                  <div className="h-2 bg-white/20 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
