"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Sparkles,
  Trophy,
  Rocket,
  Zap,
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
  progress: {
    completion_percentage: number;
    completed: boolean;
    next_step: string | null;
  };
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
  const [onboardingStatus, setOnboardingStatus] =
    useState<OnboardingStatus | null>(null);
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
        fetch("/api/users/profile"),
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
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-6">
            <div className="w-12 h-12 border-3 border-[#A3BC02]/20 border-t-[#A3BC02] rounded-full animate-spin mx-auto" />
            <Sparkles className="w-5 h-5 text-[#A3BC02] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600">Setting up your workspace...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] flex items-center justify-center">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={fetchOnboardingData}
            className="bg-[#A3BC02] hover:bg-[#8BA000] text-white"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  const steps = onboardingStatus?.steps || [];
  const completedSteps = steps.filter(
    (step) => step.status === "completed"
  ).length;
  const totalSteps = steps.length;
  const progressPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isComplete = completedSteps === totalSteps && totalSteps > 0;

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

  // Get next step from backend response
  const nextStepId = onboardingStatus?.progress?.next_step;
  const nextStep = nextStepId ? steps.find(step => step.step === nextStepId) : null;
  const nextStepWithIcon = nextStep
    ? {
        ...nextStep,
        icon: stepIconMap[nextStep.step] || User,
        href: stepHrefMap[nextStep.step] || "/onboarding",
      }
    : null;

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
              <div className="flex items-center gap-4">
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
                {userProfile?.tenant?.name && (
                  <>
                    <div className="h-6 w-px bg-gray-200" />
                    <Badge
                      variant="secondary"
                      className="font-medium flex items-center gap-2"
                    >
                      <Building2 className="w-3 h-3" />
                      {userProfile.tenant.name}
                    </Badge>
                  </>
                )}
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Skip to Dashboard</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Welcome Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-center mb-8">
              <Avatar className="w-20 h-20 border-4 border-[#A3BC02]/20">
                {userProfile?.avatar_url ? (
                  <AvatarImage
                    src={userProfile.avatar_url}
                    alt={userProfile.first_name}
                  />
                ) : (
                  <AvatarFallback className="bg-[#A3BC02]/10 text-[#A3BC02] text-xl font-semibold">
                    {userProfile?.first_name?.[0]}
                    {userProfile?.last_name?.[0]}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            <h1 className="text-5xl md:text-6xl font-serif text-[#3E4128] mb-6">
              Welcome to Monolith, {userProfile?.first_name || "there"}!
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Let's get you set up with everything you need to start discovering
              and organizing{" "}
              {userProfile?.tenant?.name
                ? `${userProfile.tenant.name}'s`
                : "your team's"}{" "}
              knowledge.
              {isComplete
                ? " You're all set up!"
                : ` Just ${totalSteps - completedSteps} step${
                    totalSteps - completedSteps === 1 ? "" : "s"
                  } to go.`}
            </p>

            {/* Simple Progress */}
            {!isComplete && (
              <div className="max-w-md mx-auto mb-8">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-sm text-gray-500 mt-2">
                  {completedSteps} of {totalSteps} completed
                </p>
              </div>
            )}
          </motion.div>

          {/* Main Content */}
          {isComplete ? (
            // Completion State
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Card className="border-[#A3BC02]/20 bg-gradient-to-r from-[#A3BC02]/10 to-[#E1F179]/10 backdrop-blur-sm shadow-xl shadow-[#A3BC02]/20 max-w-2xl mx-auto">
                <CardContent className="py-16">
                  <Trophy className="w-24 h-24 text-[#A3BC02] mx-auto mb-8" />
                  <h2 className="text-4xl font-serif text-[#3E4128] mb-4">
                    You're All Set!
                  </h2>
                  <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto">
                    Your workspace is ready. Time to start discovering and
                    organizing knowledge with your team.
                  </p>
                  <Button
                    asChild
                    className="bg-[#A3BC02] hover:bg-[#8BA000] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 text-lg px-8 py-6"
                    >
                      <Rocket className="w-5 h-5" />
                      Launch Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Steps State
            <motion.div
              key="steps"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              {/* Next Step Highlight */}
              {nextStepWithIcon && (
                <motion.div
                  className="mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="text-center mb-6">
                    <Badge className="bg-[#A3BC02]/10 text-[#A3BC02] border-[#A3BC02]/20 px-4 py-2">
                      <Zap className="w-4 h-4 mr-2" />
                      Next Step
                    </Badge>
                  </div>
                  <Card className="border-[#A3BC02]/30 bg-gradient-to-r from-[#A3BC02]/5 to-[#E1F179]/5 backdrop-blur-sm shadow-xl shadow-[#A3BC02]/20 max-w-2xl mx-auto">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="p-4 bg-[#A3BC02]/10 rounded-2xl">
                          <nextStepWithIcon.icon className="w-8 h-8 text-[#A3BC02]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-serif text-[#3E4128] mb-2">
                            {nextStepWithIcon.title}
                          </h3>
                          <p className="text-gray-600 text-lg leading-relaxed">
                            {nextStepWithIcon.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {nextStepWithIcon.estimated_time_minutes} minutes
                          </div>
                          {nextStepWithIcon.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <Button
                          asChild
                          className="bg-[#A3BC02] hover:bg-[#8BA000] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          size="lg"
                        >
                          <Link
                            href={nextStepWithIcon.href}
                            className="flex items-center gap-2 px-8"
                          >
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* All Steps Overview */}
              <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                {steps.map((step, index) => {
                  const StepIcon = stepIconMap[step.step] || User;
                  const stepHref = stepHrefMap[step.step] || "/onboarding";
                  const isCompleted = step.status === "completed";
                  const isNext = step.step === nextStepId;

                  return (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * (index + 3) }}
                    >
                      <Card
                        className={`
                          h-full transition-all duration-300 backdrop-blur-sm
                          ${
                            isCompleted
                              ? "border-[#A3BC02]/30 bg-[#A3BC02]/5 shadow-lg shadow-[#A3BC02]/10"
                              : isNext
                              ? "border-[#A3BC02]/20 bg-white/90 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                              : "border-gray-200 bg-white/80 shadow-md hover:shadow-lg hover:scale-[1.01]"
                          }
                        `}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`
                                p-3 rounded-xl
                                ${
                                  isCompleted
                                    ? "bg-[#A3BC02]/10"
                                    : "bg-gray-100"
                                }
                              `}
                            >
                              <StepIcon
                                className={`w-6 h-6 ${
                                  isCompleted
                                    ? "text-[#A3BC02]"
                                    : "text-gray-500"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {isCompleted && (
                                  <CheckCircle className="w-5 h-5 text-[#A3BC02]" />
                                )}
                                <CardTitle className="text-lg text-[#3E4128]">
                                  {step.title}
                                </CardTitle>
                              </div>
                              <div className="flex items-center gap-2">
                                {step.required && (
                                  <Badge variant="outline" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                                {step.step === "invite_team" &&
                                  userProfile?.role !== "admin" && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Admin Only
                                    </Badge>
                                  )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-6 text-base leading-relaxed">
                            {step.description}
                          </CardDescription>

                          {isCompleted ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-[#A3BC02]">
                                <CheckCircle className="w-4 h-4" />
                                Completed
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="w-full"
                              >
                                <Link href={stepHref}>Review Settings</Link>
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                {step.estimated_time_minutes} minutes
                              </div>
                              <Button
                                size="sm"
                                asChild
                                className={`
                                  w-full
                                  ${
                                    isNext
                                      ? "bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                                      : "bg-white hover:bg-gray-50 text-[#3E4128] border border-gray-200"
                                  }
                                `}
                              >
                                <Link href={stepHref}>
                                  {isNext ? "Start Now" : "Set Up Later"}
                                </Link>
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Role-specific messaging */}
              {userProfile?.role !== "admin" &&
                steps.some((s) => s.step === "invite_team") && (
                  <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Card className="border-blue-200 bg-blue-50/50 backdrop-blur-sm max-w-2xl mx-auto">
                      <CardContent className="py-6">
                        <p className="text-blue-700">
                          <strong>Team invitations</strong> are managed by your
                          workspace admin. Focus on connecting your first source
                          to get started!
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
