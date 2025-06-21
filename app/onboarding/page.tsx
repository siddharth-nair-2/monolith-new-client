"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Circle,
  Clock,
  Lock,
  User,
  Building2,
  Users,
  FileText,
  Settings,
  ArrowRight,
  SkipBackIcon as Skip,
} from "lucide-react";

interface OnboardingStep {
  step: string;
  title: string;
  description: string;
  required: boolean;
  order: number;
  estimated_time_minutes: number;
  status: string;
  completed_at?: string;
  step_data?: any;
}

interface OnboardingStatus {
  steps: OnboardingStep[];
  progress: any;
  recommendations: any[];
  show_banner: boolean;
  tenant_created_days_ago: number;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  tenant: any;
}

const stepIconMap: Record<string, any> = {
  invite_team: Users,
  first_integration: FileText,
};

const stepHrefMap: Record<string, string> = {
  invite_team: "/onboarding/invite-team",
  first_integration: "/onboarding/first-integration",
};

export default function OnboardingDashboard() {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    try {
      setIsLoading(true);
      const [statusResponse, profileResponse] = await Promise.all([
        fetch("/api/onboarding/status"),
        fetch("/api/users/profile")
      ]);

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setOnboardingStatus(statusData);
      } else {
        console.error("Failed to fetch onboarding status");
      }

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching onboarding data:", error);
      setError("Failed to load onboarding data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#A3BC02] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your onboarding progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchOnboardingData}>Try Again</Button>
        </div>
      </div>
    );
  }

  const steps = onboardingStatus?.steps || [];
  const completedSteps = steps.filter((step) => step.status === "completed").length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-[#A3BC02]" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "skipped":
        return <Skip className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-[#A3BC02]/10 text-[#A3BC02] border-[#A3BC02]/20">
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-50 text-blue-600 border-blue-200">
            In Progress
          </Badge>
        );
      case "skipped":
        return <Badge variant="secondary">Skipped</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getNextStep = () => {
    return steps.find(
      (step) =>
        step.status === "in_progress" ||
        step.status === "pending"
    );
  };

  const nextStep = getNextStep();
  const nextStepWithIcon = nextStep ? {
    ...nextStep,
    icon: stepIconMap[nextStep.step] || User,
    href: stepHrefMap[nextStep.step] || "/onboarding"
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#A3BC02]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#E1F179]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#A3BC02]/3 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="border-b border-gray-100 bg-white/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/"
                  className="text-2xl font-serif text-[#3E4128] hover:text-[#A3BC02] transition-colors"
                >
                  Mono
                  <span className="underline decoration-[#A3BC02] decoration-2 underline-offset-2">
                    l
                  </span>
                  ith
                </Link>
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Skip to Dashboard</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Welcome Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif text-[#3E4128] mb-4">
              Welcome to Monolith, {userProfile?.first_name || 'there'}!
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Let's get you set up with everything you need to start discovering
              and organizing your team's knowledge.
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#3E4128]">
                  Setup Progress
                </span>
                <span className="text-sm text-gray-500">
                  {completedSteps} of {totalSteps} completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </motion.div>

          {/* Next Step Card */}
          {nextStepWithIcon && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-[#A3BC02]/20 bg-gradient-to-r from-[#A3BC02]/5 to-[#E1F179]/5 backdrop-blur-sm shadow-lg shadow-[#A3BC02]/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#A3BC02]/10 rounded-lg">
                        <nextStepWithIcon.icon className="w-5 h-5 text-[#A3BC02]" />
                      </div>
                      <div>
                        <CardTitle className="text-[#3E4128]">
                          Continue Setup
                        </CardTitle>
                        <CardDescription>{nextStepWithIcon.title}</CardDescription>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                    >
                      <Link
                        href={nextStepWithIcon.href}
                        className="flex items-center gap-2"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          )}

          {/* Steps Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => {
              const StepIcon = stepIconMap[step.step] || User;
              const stepHref = stepHrefMap[step.step] || "/onboarding";
              const isAccessible = true; // All steps are accessible based on backend logic

              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (index + 3) }}
                >
                  <Card
                    className={`
                    h-full transition-all duration-200 backdrop-blur-sm
                    ${
                      step.status === "completed"
                        ? "border-[#A3BC02]/30 bg-[#A3BC02]/5 shadow-lg shadow-[#A3BC02]/10"
                        : step.status === "in_progress"
                        ? "border-blue-200 bg-blue-50/50 shadow-lg shadow-blue-500/10"
                        : "border-gray-200 bg-white/80 hover:shadow-lg hover:shadow-gray-500/10"
                    }
                    ${!isAccessible ? "opacity-60" : "hover:scale-[1.02]"}
                  `}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            p-2 rounded-lg
                            ${
                              step.status === "completed"
                                ? "bg-[#A3BC02]/10"
                                : step.status === "in_progress"
                                ? "bg-blue-100"
                                : "bg-gray-100"
                            }
                          `}
                          >
                            <StepIcon
                              className={`
                              w-5 h-5
                              ${
                                step.status === "completed"
                                  ? "text-[#A3BC02]"
                                  : step.status === "in_progress"
                                  ? "text-blue-600"
                                  : "text-gray-500"
                              }
                            `}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(step.status)}
                              <CardTitle className="text-sm text-[#3E4128]">
                                {step.title}
                              </CardTitle>
                            </div>
                            {step.required && (
                              <Badge variant="outline" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(step.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="mb-4">
                        {step.description}
                      </CardDescription>

                      {!isAccessible ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Lock className="w-4 h-4" />
                          Admin access required
                        </div>
                      ) : step.status === "completed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full"
                        >
                          <Link href={stepHref}>Review</Link>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          asChild
                          className={`
                            w-full
                            ${
                              step.status === "in_progress"
                                ? "bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                                : "bg-white hover:bg-gray-50 text-[#3E4128] border border-gray-200"
                            }
                          `}
                        >
                          <Link href={stepHref}>
                            {step.status === "in_progress"
                              ? "Continue"
                              : "Start"}
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Complete Setup */}
          {completedSteps === totalSteps && totalSteps > 0 && (
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="border-[#A3BC02]/20 bg-gradient-to-r from-[#A3BC02]/10 to-[#E1F179]/10 backdrop-blur-sm shadow-lg shadow-[#A3BC02]/10">
                <CardContent className="py-8">
                  <CheckCircle className="w-16 h-16 text-[#A3BC02] mx-auto mb-4" />
                  <h3 className="text-2xl font-serif text-[#3E4128] mb-2">
                    Setup Complete!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You're all set up and ready to start using Monolith.
                  </p>
                  <Button
                    asChild
                    className="bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                  >
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}