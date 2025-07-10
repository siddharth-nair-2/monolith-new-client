"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Building2,
  Save,
  Users,
  Calendar,
  Globe,
  MapPin,
  Phone,
  Loader2,
  Crown,
  AlertCircle,
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  industry?: string;
  size?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  admin_count?: number;
}

interface CurrentUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tenant: {
    id: string;
    name: string;
  };
}

export default function OrganizationPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");

  useEffect(() => {
    checkPermissionsAndLoadData();
  }, []);

  const checkPermissionsAndLoadData = async () => {
    try {
      setIsLoading(true);
      
      // First check user permissions
      const userResponse = await fetch("/api/users/profile");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setCurrentUser(userData);
        
        // Check if user is admin or owner
        const isAdmin = userData.role === 'admin' || userData.role === 'owner';
        setHasPermission(isAdmin);
        
        if (!isAdmin) {
          // Redirect non-admin users to dashboard
          toast.error("You don't have permission to access organization settings");
          router.push("/dashboard");
          return;
        }
        
        // If admin, load organization data
        await loadOrganization();
      } else {
        toast.error("Failed to verify permissions");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to check permissions:", error);
      toast.error("Failed to verify permissions");
      router.push("/dashboard");
    }
  };

  const loadOrganization = async () => {
    try {
      const response = await fetch("/api/organizations/current");
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
        
        // Populate form fields
        setName(data.name || "");
        setDescription(data.description || "");
        setWebsite(data.website || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setIndustry(data.industry || "");
        setSize(data.size || "");
      } else {
        toast.error("Failed to load organization details");
      }
    } catch (error) {
      console.error("Failed to load organization:", error);
      toast.error("Failed to load organization details");
    } finally {
      setIsLoading(false);
    }
  };

  const saveOrganization = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/organizations/current", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          website: website.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
          industry: industry.trim() || null,
          size: size.trim() || null,
        }),
      });

      if (response.ok) {
        const updatedOrg = await response.json();
        setOrganization(updatedOrg);
        toast.success("Organization updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update organization");
      }
    } catch (error) {
      console.error("Failed to save organization:", error);
      toast.error("Failed to update organization");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3BC02] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading organization details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized message if user doesn't have permission
  if (currentUser && !hasPermission) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500 mb-4">
              You don't have permission to access organization settings.
              <br />
              Contact your administrator for access.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="bg-[#A3BC02] hover:bg-[#8BA000]">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#A3BC02]/10 rounded-lg">
            <Building2 className="w-6 h-6 text-[#A3BC02]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
        </div>
        <p className="text-gray-600">
          Manage your organization's information and settings
        </p>
      </div>

      {/* Organization Stats */}
      {organization && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {organization.member_count || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-[#A3BC02]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrators</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {organization.admin_count || 0}
                  </p>
                </div>
                <Crown className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatDate(organization.created_at)}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your organization's basic details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name *</Label>
              <Input
                id="orgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organization name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your organization does..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourcompany.com"
                    className="pl-10"
                    type="url"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                    type="tel"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your organization's address..."
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="size">Company Size</Label>
                <Input
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g., 1-10, 11-50, 51-200, 200+"
                />
              </div>
            </div>

            <Button 
              onClick={saveOrganization} 
              disabled={isSaving || !name.trim()}
              className="bg-[#A3BC02] hover:bg-[#8BA000]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Organization Status */}
        {organization && (
          <Card>
            <CardHeader>
              <CardTitle>Organization Status</CardTitle>
              <CardDescription>
                View your organization's current status and important information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Organization ID</Label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded mt-1">
                    {organization.id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(organization.updated_at)}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Your organization is active and all features are available
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}