import { Search, FileText, Calendar, User } from "lucide-react";

export default function SearchState3() {
  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-rose-400 to-red-400" />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col px-8 py-6">
        {/* Top Search Bar */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-full shadow-lg flex items-center px-4 py-2 max-w-sm">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-800 text-xs">
              Find me onboarding procedures from 2021
            </span>
            <div className="ml-2 flex items-center space-x-1">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <h2 className="text-2xl font-light text-gray-800 mb-4">
              Onboarding Procedures from 2021
            </h2>

            {/* Tabs */}
            <div className="flex space-x-8">
              <div className="text-gray-800 text-sm font-medium border-b-2 border-blue-500 pb-1">
                Semantic Lookup
              </div>
              <div className="text-gray-400 text-sm">Keyword Results</div>
            </div>
          </div>

          {/* Results List */}
          <div className="p-6 space-y-4">
            {/* Result Item 1 */}
            <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 mb-1">
                  New employee onboarding checklist
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Complete guide for onboarding new team members including
                  documentation, setup procedures, and first-week activities.
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>March 15, 2021</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>HR Team</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Result Item 2 */}
            <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 mb-1">
                  Remote onboarding best practices
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Guidelines and best practices for onboarding remote employees
                  during 2021, including virtual meetings and digital workflows.
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>June 8, 2021</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>Operations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
