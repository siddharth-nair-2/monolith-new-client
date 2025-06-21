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
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const error = await response.json();
        setError("root", {
          message: error.message || "Something went wrong",
        });
      }
    } catch (error) {
      setError("root", {
        message: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#A3BC02]/4 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#A3BC02]/3 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl shadow-[#A3BC02]/5">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-serif text-custom-dark-green mb-2">
                  Check Your Email
                </h2>
                
                <p className="text-gray-600 mb-6">
                  We've sent password reset instructions to your email address.
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                  >
                    Return to Login
                  </Button>
                  
                  <p className="text-sm text-gray-500">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#A3BC02]/4 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#A3BC02]/3 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-radial from-[#A3BC02]/2 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
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
              Forgot Password?
            </h1>

            <p className="text-gray-600">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl shadow-[#A3BC02]/5">
              <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-lg pointer-events-none" />
                <div className="relative z-10">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative mt-1">
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="Enter your email"
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

                    {/* Error Message */}
                    {errors.root && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700">
                          {errors.root.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending Instructions...
                        </>
                      ) : (
                        "Send Reset Instructions"
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-6"
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="text-gray-600 hover:text-custom-dark-green"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}