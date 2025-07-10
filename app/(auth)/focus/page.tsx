"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Trash2, 
  ExternalLink, 
  Plus, 
  FolderOpen, 
  FileText, 
  MessageSquare, 
  Filter, 
  Check, 
  CircleAlert, 
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface FocusMode {
  id: string;
  name: string;
  description?: string;
  icon: string;
  created_at: string;
  updated_at: string;
  document_count: number;
  is_active: boolean;
}

interface CreateFocusModeData {
  name: string;
  description?: string;
  icon: string;
}

interface IconOption {
  icon: string;
  description: string;
}

export default function FocusPage() {
  const router = useRouter();
  const [focusModes, setFocusModes] = useState<FocusMode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFocusMode, setNewFocusMode] = useState<CreateFocusModeData>({
    name: "",
    description: "",
    icon: "🎯",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [availableIcons, setAvailableIcons] = useState<IconOption[]>([]);
  const [isLoadingIcons, setIsLoadingIcons] = useState(false);

  const loadFocusModes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/focus-modes");
      
      if (response.ok) {
        const data = await response.json();
        setFocusModes(data.focus_modes || []);
      } else {
        toast.error("Failed to load focus modes");
      }
    } catch (error) {
      console.error("Failed to load focus modes:", error);
      toast.error("Failed to load focus modes");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableIcons = async () => {
    try {
      setIsLoadingIcons(true);
      const response = await fetch("/api/focus-modes/icons");
      
      if (response.ok) {
        const data = await response.json();
        setAvailableIcons(data.icons || []);
      } else {
        console.error("Failed to load icons");
        // Fallback to default icons if API fails
        setAvailableIcons([
          { icon: "🎯", description: "Target" },
          { icon: "📁", description: "Folder" },
          { icon: "📊", description: "Bar Chart" },
          { icon: "💼", description: "Briefcase" },
          { icon: "🚀", description: "Rocket" }
        ]);
      }
    } catch (error) {
      console.error("Failed to load icons:", error);
      // Fallback to default icons if API fails
      setAvailableIcons([
        { icon: "🎯", description: "Target" },
        { icon: "📁", description: "Folder" },
        { icon: "📊", description: "Bar Chart" },
        { icon: "💼", description: "Briefcase" },
        { icon: "🚀", description: "Rocket" }
      ]);
    } finally {
      setIsLoadingIcons(false);
    }
  };

  const createFocusMode = async () => {
    if (!newFocusMode.name.trim()) {
      toast.error("Focus mode name is required");
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch("/api/focus-modes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFocusMode),
      });

      if (response.ok) {
        const createdFocusMode = await response.json();
        setFocusModes((prev) => [createdFocusMode, ...prev]);
        setCreateDialogOpen(false);
        setNewFocusMode({ name: "", description: "", icon: "🎯" });
        toast.success("Focus mode created successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create focus mode");
      }
    } catch (error) {
      console.error("Failed to create focus mode:", error);
      toast.error("Failed to create focus mode");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteFocusMode = async (focusModeId: string) => {
    try {
      const response = await fetch(`/api/focus-modes/${focusModeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFocusModes((prev) => prev.filter((fm) => fm.id !== focusModeId));
        toast.success("Focus mode deleted");
      } else {
        toast.error("Failed to delete focus mode");
      }
    } catch (error) {
      console.error("Failed to delete focus mode:", error);
      toast.error("Failed to delete focus mode");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    loadFocusModes();
    loadAvailableIcons();
  }, []);

  const FocusModeCard = memo(({ focusMode }: { focusMode: FocusMode }) => {
    return (
      <div
        className="group cursor-pointer relative bg-white border-none rounded-xl p-4 py-[14px] hover:shadow-md transition-all duration-200 hover:border-gray-300 flex flex-col justify-between"
        onClick={() => router.push(`/focus/${focusMode.id}`)}
      >
        {/* Focus Mode Header */}
        <div className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{focusMode.icon}</span>
            <h3 className="text-sm font-medium text-gray-900 font-sans line-clamp-1 leading-tight">
              {focusMode.name}
            </h3>
          </div>
          {focusMode.description && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
              {focusMode.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-center mt-auto items-center">
          {/* Document Count */}
          <div className="flex items-center">
            <FileText className="w-4 h-4 text-gray-400" />
          </div>

          {/* Date/Time */}
          <div className="flex-1 text-center">
            <p className="text-xs text-black/50 font-sans">
              {focusMode.document_count} docs
            </p>
          </div>

          {/* Three Dots Menu */}
          <div className="opacity-100 flex items-center">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/focus/${focusMode.id}`);
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Focus Mode
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFocusMode(focusMode.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute -bottom-1 -right-1">
          {focusMode.is_active ? (
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-white border-none [box-shadow:inset_0_0_16px_0_rgba(163,188,1,0.4)]">
              <Check className="w-3 h-3 text-custom-dark-green" />
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-gray-50 border-none ">
              <CircleAlert className="w-3 h-3 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3BC02] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading focus modes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-none">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-8xl font-medium text-custom-dark-green font-serif">
            Focus Spaces
          </h1>
          <div className="flex items-center gap-2">
            <Button
              className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans bg-[#eaeaea] text-custom-dark-green border border-gray-200 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Dialog 
              open={createDialogOpen} 
              onOpenChange={(open) => {
                setCreateDialogOpen(open);
                if (open && availableIcons.length === 0) {
                  loadAvailableIcons();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
                >
                  <Plus className="w-4 h-4" />
                  Create Focus Mode
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-gray-200 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-custom-dark-green font-serif">
                    Create New Focus Mode
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 font-sans">
                    Create a focused workspace to organize your documents and conversations around a specific topic or project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <Input
                      placeholder="e.g., Research Project, Meeting Notes"
                      value={newFocusMode.name}
                      onChange={(e) =>
                        setNewFocusMode((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Textarea
                      placeholder="Optional description for this focus mode..."
                      value={newFocusMode.description}
                      onChange={(e) =>
                        setNewFocusMode((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="rounded-2xl"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon
                    </label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={newFocusMode.icon}
                        onValueChange={(value) =>
                          setNewFocusMode((prev) => ({ ...prev, icon: value }))
                        }
                        disabled={isLoadingIcons}
                      >
                        <SelectTrigger className="rounded-full w-48">
                          <SelectValue placeholder="🎯">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{newFocusMode.icon}</span>
                              <span className="text-sm">
                                {availableIcons.find(i => i.icon === newFocusMode.icon)?.description || "Target"}
                              </span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {isLoadingIcons ? (
                            <SelectItem value="loading" disabled>
                              Loading icons...
                            </SelectItem>
                          ) : (
                            availableIcons.map((iconOption) => (
                              <SelectItem key={iconOption.icon} value={iconOption.icon}>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{iconOption.icon}</span>
                                  <span>{iconOption.description}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-gray-500">
                        Choose an icon to represent this focus mode
                      </span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="rounded-full font-sans"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createFocusMode}
                    disabled={isCreating || !newFocusMode.name.trim()}
                    className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans"
                  >
                    {isCreating ? "Creating..." : "Create Focus Mode"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm font-sans">
            Create focused workspaces to organize your documents and conversations around specific topics or projects.
          </p>
        </div>

        {focusModes.length === 0 ? (
          <div className="text-center py-16">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No focus modes yet
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Create your first focus mode to organize documents and conversations around specific topics or projects.
              </p>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full text-custom-dark-green border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Focus Mode
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {focusModes.map((focusMode) => (
              <div key={focusMode.id}>
                <FocusModeCard focusMode={focusMode} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}