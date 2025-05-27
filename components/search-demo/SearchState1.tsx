import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchState1() {
  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500" />

      {/* Search Bar Container */}
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* Search Bar */}
          <div className="bg-white rounded-full shadow-lg flex items-center px-6 py-4">
            <Search className="h-5 w-5 text-custom-dark-green mr-3" />
            <input
              type="text"
              value="Find me onboarding procedures from 2021"
              readOnly
              className="flex-1 text-custom-dark-green outline-none text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
