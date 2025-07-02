"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User,
  Lock,
  Save,
  Eye,
  EyeOff,
  Loader2,
  LayoutGrid,
  LockOpen,
} from "lucide-react";
import GoogleDriveIntegration from "@/components/integrations/GoogleDriveIntegration";
import SyncPipelinesManager from "@/components/integrations/SyncPipelinesManager";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "profile"
  );

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Password change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Email change form
  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setNewEmail(data.email || "");
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        toast.success("Profile updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password changed successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const changeEmail = async () => {
    if (!newEmail || newEmail === profile?.email) {
      toast.error("Please enter a new email address");
      return;
    }

    try {
      setIsChangingEmail(true);
      const response = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_email: newEmail,
        }),
      });

      if (response.ok) {
        toast.success(
          "Email change requested. Please check both your current and new email for verification."
        );
        loadProfile(); // Refresh profile
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to change email");
      }
    } catch (error) {
      console.error("Failed to change email:", error);
      toast.error("Failed to change email");
    } finally {
      setIsChangingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3BC02] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-none">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
        {/* Header with Tab Navigation */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-8xl font-medium text-custom-dark-green font-serif">
            Settings
          </h1>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans ${
                activeTab === "profile"
                  ? "text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
                  : "bg-[#eaeaea] text-custom-dark-green border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans ${
                activeTab === "security"
                  ? "text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
                  : "bg-[#eaeaea] text-custom-dark-green border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Lock className="w-4 h-4" />
              Security
            </button>
            <button
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans ${
                activeTab === "integrations"
                  ? "text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
                  : "bg-[#eaeaea] text-custom-dark-green border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Integrations
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm font-sans">
            Manage all aspects of your account in one place: update your
            profile, review security settings, and connect integrations.
          </p>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="pt-6">
            <h2 className="text-4xl font-medium text-custom-dark-green font-serif my-4">
              Profile Information
            </h2>
            <p className="text-gray-600 text-sm font-sans mb-8">
              Edit your personal details like your name and profile photo. Your
              email address can be updated in the Security tab.
            </p>

            {/* Form Container with white background */}
            <div className="w-3/4 bg-white rounded-xl p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-black font-sans"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Siddharth"
                      className="h-12 rounded-full border-[#F6F6F6] bg-[#F6F6F6] font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-black font-sans"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Masqualin"
                      className="h-12 rounded-full border-[#F6F6F6] bg-[#F6F6F6] font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-black font-sans"
                    >
                      Email
                    </Label>
                    <div className="text-xs text-gray-500 font-sans mb-2">
                      Visit Security tab to change email.
                    </div>
                    <div className="relative">
                      <Input
                        id="email"
                        value={profile?.email || ""}
                        disabled
                        className="h-12 rounded-full border-gray-200 bg-[#eaeaea] font-sans pr-12"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={saveProfile}
              disabled={isSaving}
              className="mt-6 text-gray-900 border bg-white border-[#A3BC01] rounded-full transition duration-200 [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002] font-sans h-11 px-4 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="pt-6">
            <h2 className="text-4xl font-medium text-custom-dark-green font-serif my-4">
              Change Password
            </h2>
            <p className="text-gray-600 text-sm font-sans mb-8">
              Update your password to keep your account secure. Choose a strong
              password with at least 8 characters.
            </p>

            {/* Password Change Section */}
            <div className="mb-12">
              {/* Password Form Container with white background */}
              <div className="w-1/2 bg-white rounded-xl p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentPassword"
                      className="text-sm font-medium text-black font-sans"
                    >
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="h-12 rounded-full border-[#F6F6F6] bg-[#F6F6F6] font-sans pr-12 w-full"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="newPassword"
                      className="text-sm font-medium text-black font-sans"
                    >
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="h-12 rounded-full border-[#F6F6F6] bg-[#F6F6F6] font-sans w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-black font-sans"
                    >
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="h-12 rounded-full border-[#F6F6F6] bg-[#F6F6F6] font-sans w-full"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={changePassword}
                disabled={
                  isChangingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="mt-6 text-gray-900 border bg-white border-[#A3BC01] rounded-full transition duration-200 [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002] font-sans h-11 px-4 flex items-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <LockOpen className="w-4 h-4" />
                    Change Password
                  </>
                )}
              </Button>
            </div>

            {/* Email Change Section */}
            <div>
              <h2 className="text-4xl font-medium text-custom-dark-green font-serif my-4">
                Change Email Address
              </h2>
              <p className="text-gray-600 text-sm font-sans mb-8">
                Update your email address for account notifications and login.
                You'll need to verify both your current and new email.
              </p>

              {/* Email Form Container with white background */}
              <div className="w-1/2 bg-white rounded-xl p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentEmail"
                      className="text-sm font-medium text-black font-sans"
                    >
                      Current Email
                    </Label>
                    <Input
                      id="currentEmail"
                      value={profile?.email || ""}
                      disabled
                      className="h-12 rounded-full border-gray-200 bg-[#eaeaea] font-sans w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="newEmailAddress"
                      className="text-sm font-medium text-black font-sans"
                    >
                      New Email Address
                    </Label>
                    <Input
                      id="newEmailAddress"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter your new email address"
                      className="h-12 rounded-full border-[#F6F6F6] bg-[#F6F6F6] font-sans w-full"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={changeEmail}
                disabled={
                  isChangingEmail || !newEmail || newEmail === profile?.email
                }
                className="mt-6 text-gray-900 border bg-white border-[#A3BC01] rounded-full transition duration-200 [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002] font-sans h-11 px-4 flex items-center gap-2"
              >
                {isChangingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Change Email
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <div className="pt-8 space-y-16">
            <div>
              <h2 className="text-4xl font-medium text-custom-dark-green font-serif mb-4">
                Manage Integrations
              </h2>
              <GoogleDriveIntegration />
            </div>

            <div>
              <h2 className="text-4xl font-medium text-custom-dark-green font-serif mb-4">
                Sync Pipelines
              </h2>
              <SyncPipelinesManager />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
