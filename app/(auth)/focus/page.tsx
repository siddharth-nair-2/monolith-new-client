"use client";

import { useState, useEffect, useCallback, memo } from "react";
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
import { toast } from "sonner";
import { Trash2, ExternalLink, Plus, FolderOpen, FileText, MessageSquare } from "lucide-react";
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

export default function FocusPage() {
  const [focusModes, setFocusModes] = useState<FocusMode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFocusMode, setNewFocusMode] = useState<CreateFocusModeData>({
    name: "",
    description: "",
    icon: "🎯",
  });
  const [isCreating, setIsCreating] = useState(false);

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
  }, []);

  const FocusModeCard = memo(({ focusMode }: { focusMode: FocusMode }) => {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden border-0 bg-white">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{focusMode.icon}</span>
              <div className="flex-1">
                <h3 className="font-medium text-black text-lg leading-tight font-sans">
                  {focusMode.name}
                </h3>
                {focusMode.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {focusMode.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{focusMode.document_count} documents</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>0 conversations</span>
              </div>
            </div>

            <hr className="border-black/10" />

            <div className="flex items-center justify-between">
              <span className="text-xs text-black/40 font-sans">
                Created: {formatDate(focusMode.created_at)}
              </span>

              <div className="flex items-center gap-3 opacity-100 transition-opacity justify-center">
                {/* Delete Confirmation Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 rounded-full hover:bg-white/50"
                    >
                      <Trash2 className="w-4 h-4 text-black/40" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white border border-gray-200 rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-custom-dark-green font-serif">
                        Delete Focus Mode
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600 font-sans">
                        Are you sure you want to{" "}
                        <span className="font-semibold text-red-600">delete</span>{" "}
                        this focus mode?
                        <br />
                        <span className="block mt-2">
                          <span className="font-semibold">{focusMode.name}</span>
                        </span>
                        <br />
                        <span className="block mt-2">
                          This action{" "}
                          <span className="font-semibold">cannot be undone</span>.
                          All document associations will be{" "}
                          <span className="font-semibold">permanently removed</span>.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-full font-sans">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteFocusMode(focusMode.id)}
                        className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full font-sans"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Link href={`/focus/${focusMode.id}`}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 rounded-full hover:bg-white/50"
                  >
                    <ExternalLink className="w-4 h-4 text-[#A3BC02]" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-8xl font-medium text-custom-dark-green font-serif">
            Focus Spaces
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500 font-sans">
              {focusModes.length} focus mode{focusModes.length !== 1 ? "s" : ""}
            </span>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans flex items-center gap-2"
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
                      <Input
                        placeholder="🎯"
                        value={newFocusMode.icon}
                        onChange={(e) =>
                          setNewFocusMode((prev) => ({ ...prev, icon: e.target.value }))
                        }
                        className="rounded-full w-20 text-center"
                        maxLength={2}
                      />
                      <span className="text-sm text-gray-500">
                        Choose an emoji to represent this focus mode
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

        {focusModes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No focus modes yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first focus mode to organize documents and conversations around specific topics or projects.
              </p>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Focus Mode
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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