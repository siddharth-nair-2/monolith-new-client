"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, XCircle, ArrowRight, AlertCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    // Clear any existing root errors when starting submission
    if (errors.root) {
      clearErrors("root");
    }
    setIsLoading(true);

    try {
      // Use the auth context login method
      await login(data.email, data.password);
      
      // The auth context handles navigation, but we can override with redirect
      if (redirectTo !== "/dashboard") {
        router.push(redirectTo);
      }
    } catch (error: any) {
      // Handle different error types from auth context
      let errorMessage = "Invalid email or password";
      let statusCode = 401;
      
      if (error.message?.includes("Too many")) {
        errorMessage = error.message;
        statusCode = 429;
      } else if (error.message?.includes("disabled")) {
        errorMessage = error.message;
        statusCode = 403;
      } else if (error.message?.includes("connect")) {
        errorMessage = "Unable to connect to server. Please try again.";
        statusCode = 500;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorStatusCode(statusCode);
      setError("root", {
        message: errorMessage,
      });
      setIsLoading(false);
    }
  };

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
              Welcome Back
            </h1>

            <p className="text-gray-600">
              Sign in to continue your intelligent content discovery
            </p>
          </div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl shadow-[#A3BC02]/5">
              <CardContent className="p-6">
                <div>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email */}
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="mt-1"
                        placeholder="Enter your email"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          {...register("password")}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          {...register("rememberMe")}
                          className="h-4 w-4 rounded border-gray-300 text-[#A3BC02] focus:ring-[#A3BC02]"
                        />
                        <Label htmlFor="rememberMe" className="text-sm">
                          Remember me
                        </Label>
                      </div>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-[#A3BC02] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence mode="wait">
                      {errors.root && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Alert className={
                            errorStatusCode === 429 
                              ? "border-orange-200 bg-orange-50" 
                              : errorStatusCode === 403
                              ? "border-purple-200 bg-purple-50"
                              : "border-red-200 bg-red-50"
                          }>
                            {errorStatusCode === 429 ? (
                              <ShieldAlert className="h-4 w-4 text-orange-600" />
                            ) : errorStatusCode === 403 ? (
                              <AlertCircle className="h-4 w-4 text-purple-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <AlertDescription className={
                              errorStatusCode === 429 
                                ? "text-orange-700" 
                                : errorStatusCode === 403
                                ? "text-purple-700"
                                : "text-red-700"
                            }>
                              {errors.root.message}
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative my-6"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                New to Monolith?
              </span>
            </div>
          </motion.div>

          {/* Sign Up Options */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Button
              variant="outline"
              className="w-full bg-white/60 backdrop-blur-sm text-custom-dark-green border-white/40 hover:bg-white/80 hover:shadow-lg hover:shadow-[#A3BC02]/10 transition-all duration-200"
              onClick={() => router.push("/check-domain")}
            >
              Check if your company has a workspace
            </Button>

            <Button
              variant="outline"
              className="w-full bg-white/60 backdrop-blur-sm text-custom-dark-green border-white/40 hover:bg-white/80 hover:shadow-lg hover:shadow-[#A3BC02]/10 transition-all duration-200"
              onClick={() => router.push("/signup")}
            >
              Create a new workspace
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <Link
                href="/terms-of-service"
                className="text-[#A3BC02] hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-[#A3BC02] hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
