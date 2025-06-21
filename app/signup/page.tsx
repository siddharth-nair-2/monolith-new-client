"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Building2, XCircle, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Other",
];

const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    company_name: z.string().optional(),
    company_size: z.string().optional(),
    industry: z.string().optional(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms of service"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

interface InviteDetails {
  companyName: string;
  inviterName: string;
  email: string;
  role: string;
  customMessage?: string;
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inviteToken = searchParams.get("invite_token");
  const prefilledEmail = searchParams.get("email");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(
    null
  );
  const [domainError, setDomainError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);

  const isInviteFlow = !!inviteToken;
  const isNewCompanyFlow = !isInviteFlow;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
    control,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: prefilledEmail || "",
      acceptTerms: false,
    },
  });

  const watchedPassword = watch("password");
  const watchedEmail = watch("email");

  // Validate invite token on mount
  useEffect(() => {
    if (inviteToken) {
      validateInviteToken();
    }
  }, [inviteToken]);

  // Calculate password strength
  useEffect(() => {
    if (watchedPassword) {
      let strength = 0;
      if (watchedPassword.length >= 8) strength += 25;
      if (/[A-Z]/.test(watchedPassword)) strength += 25;
      if (/[0-9]/.test(watchedPassword)) strength += 25;
      if (/[^A-Za-z0-9]/.test(watchedPassword)) strength += 25;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [watchedPassword]);

  // Check domain for existing company (only for new company flow) with debounce
  useEffect(() => {
    if (isNewCompanyFlow && watchedEmail && watchedEmail.includes("@")) {
      const domain = watchedEmail.split("@")[1];
      if (domain && !isGenericDomain(domain)) {
        // Debounce the domain check to avoid too many API calls
        const timeoutId = setTimeout(() => {
          checkDomainExists(domain);
        }, 500); // Wait 500ms after user stops typing
        
        return () => clearTimeout(timeoutId);
      } else {
        setDomainError(null);
      }
    }
  }, [watchedEmail, isNewCompanyFlow]);

  const validateInviteToken = async () => {
    try {
      const response = await fetch(
        `/api/invites/validate?token=${inviteToken}`
      );
      if (response.ok) {
        const details = await response.json();
        setInviteDetails(details);
        setValue("email", details.email);
      } else {
        router.push("/invite?token=" + inviteToken);
      }
    } catch (error) {
      router.push("/invite?token=" + inviteToken);
    }
  };

  const checkDomainExists = async (domain: string) => {
    try {
      const response = await fetch("/api/auth/check-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: watchedEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.companyExists) {
          setDomainError(
            `A company workspace already exists for ${domain}. Please request an invite from your admin.`
          );
        } else {
          setDomainError(null);
        }
      }
    } catch (error) {
      // Silently handle error
    }
  };

  const isGenericDomain = (domain: string) => {
    const genericDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
    ];
    return genericDomains.includes(domain.toLowerCase());
  };

  const onSubmit = async (data: SignupForm) => {
    if (domainError) return;

    // Clear any existing root errors when starting submission
    if (errors.root) {
      clearErrors("root");
    }
    setIsLoading(true);
    
    try {
      // Always use the same signup endpoint, backend handles invite logic
      const endpoint = "/api/auth/signup";
      const payload = isInviteFlow ? { ...data, invite_token: inviteToken } : data;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        router.push("/onboarding");
      } else {
        // Show the exact error from backend
        setErrorStatusCode(responseData.statusCode || response.status);
        setError("root", {
          message: responseData.message || "Failed to create account",
        });
        setIsLoading(false);
      }
    } catch (error) {
      setError("root", {
        message: "Unable to connect to server. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Very Weak";
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#A3BC02]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#A3BC02]/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-[#A3BC02]/2 to-transparent rounded-full blur-2xl" />
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
              {isInviteFlow ? "Join Your Team" : "Create Your Account"}
            </h1>

            <p className="text-gray-600">
              {isInviteFlow
                ? `You've been invited to join ${
                    inviteDetails?.companyName || "a team"
                  }`
                : "Start your journey with intelligent content discovery"}
            </p>
          </div>

          {/* Invite Details Card */}
          {isInviteFlow && inviteDetails && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mb-6 border-[#A3BC02]/20 bg-gradient-to-br from-[#A3BC02]/5 to-white/80 backdrop-blur-sm shadow-lg shadow-[#A3BC02]/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#A3BC02]/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#A3BC02]" />
                    </div>
                    <div>
                      <p className="font-medium text-custom-dark-green">
                        {inviteDetails.companyName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Invited by {inviteDetails.inviterName} as{" "}
                        {inviteDetails.role}
                      </p>
                    </div>
                  </div>
                  {inviteDetails.customMessage && (
                    <p className="mt-3 text-sm text-gray-700 italic">
                      "{inviteDetails.customMessage}"
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl shadow-[#A3BC02]/5">
              <CardContent className="p-6 relative">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-lg pointer-events-none" />
                <div className="relative z-10">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email */}
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        disabled={isInviteFlow}
                        {...register("email")}
                        className="mt-1"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                      {domainError && (
                        <Alert className="mt-2 border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-700">
                            {domainError}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...register("first_name")}
                          className="mt-1"
                        />
                        {errors.first_name && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...register("last_name")}
                          className="mt-1"
                        />
                        {errors.last_name && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Company Fields (New Company Flow Only) */}
                    {isNewCompanyFlow && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="companyName">Company Name *</Label>
                          <Input
                            id="companyName"
                            {...register("company_name", {
                              required: "Company name is required",
                            })}
                            className="mt-1"
                          />
                          {errors.company_name && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.company_name.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="companySize">Company Size</Label>
                            <Select
                              onValueChange={(value) =>
                                setValue("company_size", value)
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                {companySizes.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size} employees
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="industry">Industry</Label>
                            <Select
                              onValueChange={(value) =>
                                setValue("industry", value)
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem key={industry} value={industry}>
                                    {industry}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Password */}
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          {...register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {watchedPassword && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                        </div>
                      )}
                      {errors.password && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          {...register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start space-x-2">
                      <Controller
                        name="acceptTerms"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="acceptTerms"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        )}
                      />
                      <Label
                        htmlFor="acceptTerms"
                        className="text-sm leading-5 cursor-pointer"
                      >
                        I agree to the{" "}
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
                      </Label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-sm text-red-600">
                        {errors.acceptTerms.message}
                      </p>
                    )}

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
                              : errorStatusCode === 409
                              ? "border-purple-200 bg-purple-50"
                              : "border-red-200 bg-red-50"
                          }>
                            {errorStatusCode === 429 ? (
                              <ShieldAlert className="h-4 w-4 text-orange-600" />
                            ) : errorStatusCode === 409 ? (
                              <AlertCircle className="h-4 w-4 text-purple-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <AlertDescription className={
                              errorStatusCode === 429 
                                ? "text-orange-700" 
                                : errorStatusCode === 409
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
                      disabled={isLoading || !!domainError}
                      className="w-full bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : isInviteFlow ? (
                        "Join Team"
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#A3BC02] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
