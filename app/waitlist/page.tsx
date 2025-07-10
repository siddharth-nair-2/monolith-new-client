"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Users,
  Sparkles,
  Shield,
  Zap,
  Bot,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { countries, Country } from "@/lib/countries";
import { Turnstile } from "@marsidev/react-turnstile";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  companyName: z.string().min(1, "Company name is required."),
  position: z.string().min(1, "Position is required."),
  city: z.string().min(1, "City is required."),
  country: z.string().min(1, "Please select a country."),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaitlistPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      companyName: "",
      position: "",
      city: "",
      country: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setSuccessMessage(null);
    setTurnstileError(null);

    if (!turnstileToken) {
      setTurnstileError(
        "Please complete the security check before submitting."
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...data,
        turnstileToken: turnstileToken,
      };

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.error ||
          responseData.message ||
          "Submission failed. Please try again.";
        if (
          response.status === 403 &&
          errorMessage.toLowerCase().includes("security check failed")
        ) {
          setTurnstileError(errorMessage);
          setError(null);
        } else {
          let detailedError = errorMessage;
          if (
            responseData.details &&
            typeof responseData.details === "object" &&
            !Array.isArray(responseData.details)
          ) {
            try {
              const formattedDetails = Object.values(responseData.details)
                // @ts-ignore allow _errors for ZodError.format()
                .map((detail: any) => detail._errors.join(", "))
                .join("; ");
              if (formattedDetails)
                detailedError += ` Details: ${formattedDetails}`;
            } catch (e) {
              console.warn(
                "Could not parse Zod error details",
                responseData.details
              );
            }
          }
          setError(detailedError);
        }
        setIsSubmitted(false);
      } else if (responseData.success) {
        setIsSubmitted(true);
        setSuccessMessage(
          responseData.message ||
            "You've been added to our waitlist. We'll notify you when Monolith is ready for you."
        );
      } else {
        setError(
          responseData.message ||
            "Submission was processed but reported as not successful."
        );
        setIsSubmitted(false);
      }
    } catch (err) {
      console.error("CLIENT SIDE - onSubmit catch error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected API error occurred"
      );
      setIsSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#FEFFFE] font-['Instrument_Sans']">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FEFFFE] via-[#F8FBF6] to-[#F0F7E8] pt-20 pb-16">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200&query=subtle+geometric+pattern')] opacity-5"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-[#3E4128] ring-1 ring-[#A3BC02]/20 hover:ring-[#A3BC02]/30 transition-all duration-300">
                <span className="font-semibold text-[#A3BC02]">
                  Early Access
                </span>
                <span className="mx-2">•</span>
                Limited spots available
              </div>
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[#3E4128] sm:text-6xl">
              Join the{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#A3BC02] to-[#8BA000] bg-clip-text text-transparent">
                  Future
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 100 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 4C20 1 40 1 60 4C80 7 90 7 100 4"
                    stroke="#A3BC02"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </span>{" "}
              of Knowledge
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#6B7280]">
              Be among the first to experience Monolith's AI-powered knowledge
              assistant. Transform how your team finds, shares, and uses
              information.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {isSubmitted ? (
            /* Success View */
            <div className="mx-auto max-w-md">
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4 pb-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#A3BC02] to-[#8BA000]">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-serif text-2xl font-bold text-[#3E4128]">
                      Welcome to the Future!
                    </CardTitle>
                    <CardDescription className="mt-2 text-base text-[#6B7280]">
                      {successMessage}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <div className="space-y-4">
                    <div className="rounded-lg bg-[#F8FBF6] p-4">
                      <h3 className="font-semibold text-[#3E4128] mb-2">
                        What happens next?
                      </h3>
                      <ul className="text-sm text-[#6B7280] space-y-1">
                        <li>• You'll receive a confirmation email shortly</li>
                        <li>• We'll keep you updated on our progress</li>
                        <li>• You'll get early access when we launch</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href="/" className="w-full">
                    <Button className="w-full bg-[#3E4128] text-white hover:bg-[#3E4128]/90 transition-all duration-300">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          ) : (
            /* Form View */
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Benefits */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#3E4128] mb-4">
                    Why Join Our Waitlist?
                  </h2>
                  <p className="text-lg text-[#6B7280]">
                    Get exclusive early access to the most advanced AI knowledge
                    assistant for teams.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A3BC02]/10">
                      <Sparkles className="h-5 w-5 text-[#A3BC02]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E4128]">
                        Early Access Benefits
                      </h3>
                      <p className="text-[#6B7280]">
                        Be the first to experience our features and get priority
                        support.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A3BC02]/10">
                      <Shield className="h-5 w-5 text-[#A3BC02]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E4128]">
                        Exclusive Pricing
                      </h3>
                      <p className="text-[#6B7280]">
                        Lock in special launch pricing and get additional months
                        free.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A3BC02]/10">
                      <Users className="h-5 w-5 text-[#A3BC02]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E4128]">
                        Shape the Product
                      </h3>
                      <p className="text-[#6B7280]">
                        Your feedback will directly influence our development
                        roadmap.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A3BC02]/10">
                      <Zap className="h-5 w-5 text-[#A3BC02]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E4128]">
                        Premium Support
                      </h3>
                      <p className="text-[#6B7280]">
                        Get dedicated onboarding and priority customer support.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-[#A3BC02]/10 to-[#8BA000]/10 p-6 border border-[#A3BC02]/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A3BC02]">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-[#3E4128]">
                      Be first in line when we launch
                    </span>
                  </div>
                  <p className="text-sm text-[#6B7280]">
                    We're putting the finishing touches on something special.
                    Join our waitlist to get exclusive early access and be
                    notified the moment we're ready.
                  </p>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="lg:sticky lg:top-8">
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center space-y-2">
                    <CardTitle className="font-serif text-2xl font-bold text-[#3E4128]">
                      Join the Waitlist
                    </CardTitle>
                    <CardDescription className="text-[#6B7280]">
                      Secure your spot and be notified when we launch
                    </CardDescription>
                  </CardHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      {error && (
                        <div className="mx-6 mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                          {error}
                        </div>
                      )}
                      {turnstileError && (
                        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-700 mx-6 mb-4">
                          {turnstileError}
                        </div>
                      )}

                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#3E4128] font-medium">
                                Full Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  className="border-[#E5E7EB] focus:border-[#A3BC02] focus:ring-[#A3BC02]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#3E4128] font-medium">
                                Work Email
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="john@company.com"
                                  className="border-[#E5E7EB] focus:border-[#A3BC02] focus:ring-[#A3BC02]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#3E4128] font-medium">
                                Company Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Acme Inc."
                                  className="border-[#E5E7EB] focus:border-[#A3BC02] focus:ring-[#A3BC02]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#3E4128] font-medium">
                                Your Role
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Marketing Manager"
                                  className="border-[#E5E7EB] focus:border-[#A3BC02] focus:ring-[#A3BC02]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[#3E4128] font-medium">
                                  City
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="New York"
                                    className="border-[#E5E7EB] focus:border-[#A3BC02] focus:ring-[#A3BC02]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[#3E4128] font-medium">
                                  Country
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="border-[#E5E7EB] focus:border-[#A3BC02] focus:ring-[#A3BC02]">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {countries.map((country: Country) => (
                                      <SelectItem
                                        key={country.code}
                                        value={country.name}
                                      >
                                        {country.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>

                      <CardFooter className="flex flex-col space-y-4">
                        <div className="px-6 mb-6 mt-2">
                          <Turnstile
                            className="flex justify-center !w-[250px]"
                            siteKey={
                              process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
                            }
                            onSuccess={(token) => {
                              setTurnstileToken(token);
                              setTurnstileError(null);
                            }}
                            onError={() => {
                              console.error("Turnstile error loading widget");
                              setTurnstileError(
                                "Security check could not load. Please refresh the page."
                              );
                              setTurnstileToken(null);
                            }}
                            onExpire={() => {
                              setTurnstileError(
                                "Security check expired. Please complete it again."
                              );
                              setTurnstileToken(null);
                            }}
                            options={{
                              theme: "light",
                            }}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-[#A3BC02] to-[#8BA000] text-white hover:from-[#8BA000] hover:to-[#7A9000] transition-all duration-300 font-semibold py-6"
                          disabled={isLoading || !turnstileToken}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Joining Waitlist...
                            </>
                          ) : (
                            <>
                              <Users className="mr-2 h-4 w-4" />
                              Join the Waitlist
                            </>
                          )}
                        </Button>

                        <div className="text-center text-xs text-[#6B7280]">
                          By joining our waitlist, you agree to our{" "}
                          <Link
                            href="/terms-of-service"
                            className="text-[#A3BC02] hover:text-[#8BA000] hover:underline transition-colors"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy-policy"
                            className="text-[#A3BC02] hover:text-[#8BA000] hover:underline transition-colors"
                          >
                            Privacy Policy
                          </Link>
                          .
                        </div>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
