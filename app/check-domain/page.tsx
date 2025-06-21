"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Building2,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Mail,
  Users,
} from "lucide-react";
import Link from "next/link";

const domainCheckSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type DomainCheckForm = z.infer<typeof domainCheckSchema>;

interface DomainCheckResult {
  has_existing_tenant: boolean;
  tenant_name?: string;
  domain: string;
  is_generic_domain: boolean;
  requires_invite?: boolean;
}

export default function CheckDomainPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DomainCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DomainCheckForm>({
    resolver: zodResolver(domainCheckSchema),
  });

  const watchedEmail = watch("email");

  const onSubmit = async (data: DomainCheckForm) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/auth/check-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setResult(result);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Something went wrong");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = () => {
    router.push(`/signup?email=${encodeURIComponent(watchedEmail)}`);
  };

  const handleRequestInvite = () => {
    // This could open a modal or redirect to a contact form
    window.open(
      `mailto:admin@${result?.domain}?subject=Request to join ${result?.tenant_name} workspace&body=Hi, I would like to request access to the ${result?.tenant_name} workspace on Monolith.`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-20 w-72 h-72 bg-[#A3BC02]/4 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-40 w-72 h-72 bg-[#A3BC02]/3 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/3 w-56 h-56 bg-gradient-radial from-[#A3BC02]/2 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <div className="text-2xl font-serif text-custom-dark-green">
                Mono<span className="underline decoration-[#A3BC02]">l</span>ith
              </div>
            </Link>

            <h1 className="text-3xl font-serif text-custom-dark-green mb-2">
              Find Your Workspace
            </h1>

            <p className="text-gray-600">
              Check if your company already has a Monolith workspace
            </p>
          </div>

          {/* Domain Check Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl shadow-[#A3BC02]/5">
              <CardContent className="p-6 relative">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-lg pointer-events-none" />
                <div className="relative z-10">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Work Email Address</Label>
                      <div className="relative mt-1">
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="you@company.com"
                          className="pl-10"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Check Domain
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6"
            >
              {result.has_existing_tenant ? (
                /* Company Exists */
                <Card className="border-[#A3BC02]/30 bg-gradient-to-br from-[#A3BC02]/8 to-white/80 backdrop-blur-sm shadow-xl shadow-[#A3BC02]/10">
                  <CardContent className="p-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-lg pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#A3BC02]/15 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#A3BC02]/20">
                          <Building2 className="w-6 h-6 text-[#A3BC02]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-custom-dark-green mb-1">
                            Workspace Found!
                          </h3>
                          <p className="text-gray-600 mb-4">
                            A workspace exists for{" "}
                            <strong>{result.tenant_name}</strong> at{" "}
                            {result.domain}
                          </p>
                          <div className="space-y-3">
                            <Button
                              onClick={handleRequestInvite}
                              className="w-full bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Request an Invite
                            </Button>
                            <p className="text-sm text-gray-500 text-center">
                              This will open your email client to contact your
                              admin
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* No Company Found */
                <Card className="border-green-200/50 bg-gradient-to-br from-green-50/80 to-white/80 backdrop-blur-sm shadow-xl shadow-green-500/5">
                  <CardContent className="p-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-lg pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/10">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-custom-dark-green mb-1">
                            {result.is_generic_domain
                              ? "Personal Email Detected"
                              : "No Workspace Found"}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {result.is_generic_domain
                              ? "Personal email domains can create new workspaces directly"
                              : `No workspace found for ${result.domain}. You can create a new one!`}
                          </p>
                          <Button
                            onClick={handleCreateWorkspace}
                            className="w-full bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Create New Workspace
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Alternative Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">Already have an account?</p>
              <Button
                variant="outline"
                className="bg-white/60 backdrop-blur-sm text-custom-dark-green border-white/40 hover:bg-white/80 hover:shadow-lg hover:shadow-[#A3BC02]/10 transition-all duration-200"
                onClick={() => router.push("/login")}
              >
                Sign In Instead
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
