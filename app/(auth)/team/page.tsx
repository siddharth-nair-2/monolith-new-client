"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Mail,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Crown,
  User,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  last_active_at?: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
}

interface TeamStats {
  total_members: number;
  owners: number;
  admins: number;
  members: number;
  pending_invites: number;
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

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  // Invite form
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setIsLoading(true);
      
      // Get current user info first to check permissions
      const userResponse = await fetch("/api/users/profile");
      let userData = null;
      let shouldFetchInvites = false;
      
      if (userResponse.ok) {
        userData = await userResponse.json();
        setCurrentUser(userData);
        shouldFetchInvites = userData.role === 'admin' || userData.role === 'owner';
      }

      const requests = [
        fetch("/api/team/members"),
        fetch("/api/team/stats")
      ];

      // Only fetch invites if user is admin or owner
      if (shouldFetchInvites) {
        requests.push(fetch("/api/invites/list"));
      }

      const responses = await Promise.all(requests);
      const [membersResponse, statsResponse, invitesResponse] = responses;
      
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.members || []);
        // Only set pending invites from members response if we're not fetching from dedicated endpoint
        if (!shouldFetchInvites) {
          setPendingInvites(membersData.pending_invites || []);
        }
      } else {
        toast.error("Failed to load team members");
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setTeamStats(statsData);
      }

      // Load pending invites from dedicated endpoint (only for admins)
      if (shouldFetchInvites && invitesResponse && invitesResponse.ok) {
        const invitesData = await invitesResponse.json();
        setPendingInvites(invitesData || []);
      }
    } catch (error) {
      console.error("Failed to load team data:", error);
      toast.error("Failed to load team data");
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvites = async () => {
    const emails = inviteEmails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email addresses: ${invalidEmails.join(", ")}`);
      return;
    }

    try {
      setIsInviting(true);
      const response = await fetch("/api/invites/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails,
          message: inviteMessage.trim() || undefined,
          role: "member", // Default to member role
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Successfully sent ${emails.length} invitation${emails.length > 1 ? 's' : ''}`);
        setInviteEmails("");
        setInviteMessage("");
        setShowInviteDialog(false);
        loadTeamData(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send invitations");
      }
    } catch (error) {
      console.error("Failed to send invites:", error);
      toast.error("Failed to send invitations");
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMembers(prev => prev.filter(member => member.id !== memberId));
        toast.success("Team member removed successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to remove team member");
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const revokeInvite = async (inviteId: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke the invitation for ${email}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
        toast.success("Invitation revoked successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to revoke invitation");
      }
    } catch (error) {
      console.error("Failed to revoke invite:", error);
      toast.error("Failed to revoke invitation");
    }
  };

  const resendInvite = async (inviteId: string, email: string) => {
    try {
      const response = await fetch(`/api/invites/${inviteId}/resend`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success(`Invitation resent to ${email}`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to resend invitation");
      }
    } catch (error) {
      console.error("Failed to resend invite:", error);
      toast.error("Failed to resend invitation");
    }
  };

  const getDisplayName = (member: TeamMember) => {
    if (member.first_name || member.last_name) {
      return `${member.first_name || ""} ${member.last_name || ""}`.trim();
    }
    return member.email;
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "member":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if current user is admin or owner
  const isAdmin = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'owner';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3BC02] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading team members...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#A3BC02]/10 rounded-lg">
              <Users className="w-6 h-6 text-[#A3BC02]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          </div>
          <p className="text-gray-600">
            {isAdmin() ? "Manage your team members and send invitations" : "View your team members"}
          </p>
        </div>
        
        {isAdmin() && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#A3BC02] hover:bg-[#8BA000]">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Members
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Team Members</DialogTitle>
              <DialogDescription>
                Send invitations to new team members via email
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses</Label>
                <textarea
                  id="emails"
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                  placeholder="Enter email addresses separated by commas or new lines"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  You can enter multiple emails separated by commas or line breaks
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Custom Message (Optional)</Label>
                <textarea
                  id="message"
                  className="w-full min-h-[80px] p-3 border rounded-md resize-none"
                  placeholder="Add a personal message to the invitation..."
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={sendInvites}
                  disabled={isInviting || !inviteEmails.trim()}
                  className="flex-1 bg-[#A3BC02] hover:bg-[#8BA000]"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitations
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                  disabled={isInviting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Team Stats */}
      <div className={`grid grid-cols-1 gap-6 mb-8 ${isAdmin() ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamStats?.total_members || members.length}
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
                <p className="text-sm font-medium text-gray-600">Admins & Owners</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(teamStats?.admins || 0) + (teamStats?.owners || 0)}
                </p>
              </div>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        {isAdmin() && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamStats?.pending_invites || pendingInvites.length}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-500 mb-4">
                {isAdmin() 
                  ? "Start building your team by inviting members"
                  : "No team members to display"
                }
              </p>
              {isAdmin() && (
                <Button
                  onClick={() => setShowInviteDialog(true)}
                  className="bg-[#A3BC02] hover:bg-[#8BA000]"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Your First Member
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#A3BC02]/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#A3BC02]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {getDisplayName(member)}
                          </h4>
                          {(member.role.toLowerCase() === "admin" || member.role.toLowerCase() === "owner") && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge className={cn("text-xs", getRoleColor(member.role))}>
                            {member.role}
                          </Badge>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {formatDate(member.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isAdmin() && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMember(member.id, getDisplayName(member))}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={member.id === currentUser?.id} // Prevent self-removal
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites - Admin Only */}
      {isAdmin() && pendingInvites.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Manage pending team invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvites.map((invite, index) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{invite.email}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge className="text-xs bg-yellow-100 text-yellow-800">
                          {invite.role}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Sent {formatDate(invite.created_at)}
                        </span>
                        {new Date(invite.expires_at) < new Date() && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resendInvite(invite.id, invite.email)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Resend invitation"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => revokeInvite(invite.id, invite.email)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Revoke invitation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}