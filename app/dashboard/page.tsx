"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Search, 
  MessageSquare, 
  Upload, 
  Users, 
  Settings,
  LogOut
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const quickActions = [
    {
      title: "Upload Documents",
      description: "Add new documents to your knowledge base",
      icon: Upload,
      href: "/upload",
      color: "bg-blue-500",
    },
    {
      title: "Search Documents",
      description: "Find information across all your documents",
      icon: Search,
      href: "/search",
      color: "bg-green-500",
    },
    {
      title: "Chat with AI",
      description: "Ask questions about your documents",
      icon: MessageSquare,
      href: "/chat",
      color: "bg-purple-500",
    },
    {
      title: "View Documents",
      description: "Browse and manage your document library",
      icon: FileText,
      href: "/documents",
      color: "bg-orange-500",
    },
  ];

  const stats = [
    { label: "Total Documents", value: "0", icon: FileText },
    { label: "Team Members", value: "1", icon: Users },
    { label: "Searches Today", value: "0", icon: Search },
    { label: "Chat Sessions", value: "0", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-serif text-custom-dark-green">
                Mono<span className="underline decoration-[#A3BC02]">l</span>ith
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/documents" className="text-gray-600 hover:text-custom-dark-green transition-colors">
                Documents
              </Link>
              <Link href="/search" className="text-gray-600 hover:text-custom-dark-green transition-colors">
                Search
              </Link>
              <Link href="/chat" className="text-gray-600 hover:text-custom-dark-green transition-colors">
                Chat
              </Link>
              <Link href="/team" className="text-gray-600 hover:text-custom-dark-green transition-colors">
                Team
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/settings")}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif text-custom-dark-green mb-2">
              Welcome to Monolith
            </h1>
            <p className="text-gray-600">
              Your intelligent document management and discovery platform
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg shadow-[#A3BC02]/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-semibold text-custom-dark-green">
                          {stat.value}
                        </p>
                      </div>
                      <stat.icon className="w-8 h-8 text-[#A3BC02]" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-custom-dark-green mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={action.href}>
                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg shadow-[#A3BC02]/5 hover:shadow-xl hover:shadow-[#A3BC02]/10 transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-custom-dark-green mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg shadow-[#A3BC02]/5">
            <CardHeader>
              <CardTitle className="text-custom-dark-green">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-sm mt-1">
                  Start by uploading your first document
                </p>
                <Button
                  onClick={() => router.push("/upload")}
                  className="mt-4 bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                >
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}