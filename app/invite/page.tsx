"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  User,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface InviteDetails {
  companyName: string;
  inviterName: string;
  inviterEmail: string;
  email: string;
  role: string;
  customMessage?: string;
  expiresAt: string;
  isExpired: boolean;
  isUsed: boolean;
}

type InviteStatus = "loading" | "valid" | "expired" | "used" | "invalid";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<InviteStatus>("loading");
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(
    null
  );
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    validateInvite();
  }, [token]);

  const validateInvite = async () => {
    try {
      const response = await fetch(`/api/invites/validate?token=${token}`);

      if (response.ok) {
        const details = await response.json();
        setInviteDetails(details);

        if (details.isUsed) {
          setStatus("used");
        } else if (details.isExpired) {
          setStatus("expired");
        } else {
          setStatus("valid");
        }
      } else {
        setStatus("invalid");
      }
    } catch (error) {
      setStatus("invalid");
    }
  };

  const handleAcceptInvite = () => {
    if (inviteDetails) {
      router.push(`/signup?invite_token=${token}`);
    }
  };

  const handleDeclineInvite = async () => {
    setIsAccepting(true);
    try {
      await fetch(`/api/invites/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      router.push("/");
    } catch (error) {
      // Handle error silently, just redirect
      router.push("/");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl shadow-[#A3BC02]/5">
            <CardContent className="p-8 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-lg pointer-events-none" />
              <div className="relative z-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#A3BC02] mx-auto mb-4" />
                <p className="text-gray-600">Validating your invite...</p>
              </div>
            </CardContent>
          </Card>
        );

      case "valid":
        return (
          <Card className="border-[#A3BC02]/30 backdrop-blur-sm bg-gradient-to-br from-white/90 to-[#A3BC02]/5 shadow-xl shadow-[#A3BC02]/10">
            <CardContent className="p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-lg pointer-events-none" />
              <div className="relative z-10">
                {/* Invite Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#A3BC02]/15 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#A3BC02]/20">
                    <Building2 className="w-8 h-8 text-[#A3BC02]" />
                  </div>
                  <h2 className="text-2xl font-serif text-custom-dark-green mb-2">
                    You're Invited!
                  </h2>
                  <p className="text-gray-600">Join your team on Monolith</p>
                </div>

                {/* Invite Details */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Company</p>
                          <p className="font-medium text-custom-dark-green">
                            {inviteDetails?.companyName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Invited by</p>
                          <p className="font-medium text-custom-dark-green">
                            {inviteDetails?.inviterName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-custom-dark-green">
                            {inviteDetails?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="font-medium text-custom-dark-green capitalize">
                            {inviteDetails?.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {inviteDetails?.customMessage && (
                    <div className="bg-[#A3BC02]/5 border border-[#A3BC02]/20 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">
                        Personal message:
                      </p>
                      <p className="text-custom-dark-green italic">
                        "{inviteDetails.customMessage}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>
                      Expires on {formatDate(inviteDetails?.expiresAt || "")}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAcceptInvite}
                    className="w-full bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                  >
                    Accept Invitation
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDeclineInvite}
                    disabled={isAccepting}
                    className="w-full bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    {isAccepting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Declining...
                      </>
                    ) : (
                      "Decline Invitation"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "expired":
        return (
          <Card className="border-yellow-200/50 backdrop-blur-sm bg-gradient-to-br from-yellow-50/80 to-white/80 shadow-xl shadow-yellow-500/5">
            <CardContent className="p-6 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-lg pointer-events-none" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-xl font-serif text-custom-dark-green mb-2">
                  Invitation Expired
                </h2>
                <p className="text-gray-600 mb-4">
                  This invitation expired on{" "}
                  {inviteDetails && formatDate(inviteDetails.expiresAt)}
                </p>
                <Alert className="border-yellow-200 bg-yellow-50 mb-4">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    Please contact {inviteDetails?.inviterName} (
                    {inviteDetails?.inviterEmail}) to request a new invitation.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="bg-white text-custom-dark-green border-gray-300 hover:bg-gray-50"
                >
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "used":
        return (
          <Card className="border-blue-200/50 backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-white/80 shadow-xl shadow-blue-500/5">
            <CardContent className="p-6 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-lg pointer-events-none" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-serif text-custom-dark-green mb-2">
                  Invitation Already Used
                </h2>
                <p className="text-gray-600 mb-4">
                  This invitation has already been accepted.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                  >
                    Sign In to Your Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="w-full bg-white text-custom-dark-green border-gray-300 hover:bg-gray-50"
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "invalid":
      default:
        return (
          <Card className="border-red-200/50 backdrop-blur-sm bg-gradient-to-br from-red-50/80 to-white/80 shadow-xl shadow-red-500/5">
            <CardContent className="p-6 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-lg pointer-events-none" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-serif text-custom-dark-green mb-2">
                  Invalid Invitation
                </h2>
                <p className="text-gray-600 mb-4">
                  This invitation link is invalid or has been corrupted.
                </p>
                <Alert className="border-red-200 bg-red-50 mb-4">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    Please check the link or contact the person who sent you the
                    invitation.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="bg-white text-custom-dark-green border-gray-300 hover:bg-gray-50"
                >
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-20 w-80 h-80 bg-[#A3BC02]/4 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-[#A3BC02]/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-radial from-[#A3BC02]/2 to-transparent rounded-full blur-2xl" />
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
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
