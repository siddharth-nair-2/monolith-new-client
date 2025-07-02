"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
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
import { toast } from "sonner";
import { Clock, Trash2, Archive, ExternalLink, Target, Square } from "lucide-react";
import Link from "next/link";

interface Conversation {
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  message_count?: number;
  category?: string;
  focus_mode_id?: string;
  metadata?: any;
  user_id?: string;
  tenant_id?: string;
  focus_modes?: {
    id: string;
    name: string;
    icon: string;
  };
}

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";


  const loadConversations = async (resetData = true) => {
    try {
      if (resetData) {
        setIsLoading(true);
        setPage(1);
        setHasMore(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await fetch(
        `/api/conversations?include_archived=${showArchived}&page_size=50&page=${
          resetData ? 1 : page
        }`
      );
      if (response.ok) {
        const data = await response.json();
        const newConversations = data.conversations || [];

        // Sort conversations by updated_at descending
        const sortedConversations = newConversations.sort((a: Conversation, b: Conversation) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        if (resetData) {
          setConversations(sortedConversations);
          setPage(2); // Set to 2 for next load
        } else {
          // Prevent duplicates by filtering out conversations we already have
          setConversations((prev) => {
            const existingIds = new Set(prev.map((conv) => conv.id));
            const uniqueNewConversations = sortedConversations.filter(
              (conv: Conversation) => !existingIds.has(conv.id)
            );
            return [...prev, ...uniqueNewConversations];
          });
          setPage((prev) => prev + 1); // Increment for next load
        }

        const hasMoreData = newConversations.length === 50;
        setHasMore(hasMoreData);
      } else {
        toast.error("Failed to load conversation history");
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("Failed to load conversation history");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreConversations = async () => {
    if (isLoadingMore || !hasMore) return;
    await loadConversations(false);
  };

  const filterConversations = () => {
    let filtered = conversations;

    if (searchQuery.trim()) {
      filtered = conversations.filter((conv) =>
        conv.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredConversations(filtered);
  };

  useEffect(() => {
    loadConversations();
  }, [showArchived]);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery]);


  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId)
        );
        toast.success("Conversation deleted");
      } else {
        toast.error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const toggleArchiveConversation = async (
    conversationId: string,
    isArchived: boolean
  ) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_archived: !isArchived }),
      });

      if (response.ok) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, is_archived: !isArchived }
              : conv
          )
        );
        toast.success(
          isArchived ? "Conversation unarchived" : "Conversation archived"
        );
      } else {
        toast.error("Failed to update conversation");
      }
    } catch (error) {
      console.error("Failed to update conversation:", error);
      toast.error("Failed to update conversation");
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

  const groupConversationsByPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const groups = {
      today: [] as Conversation[],
      thisWeek: [] as Conversation[],
      thisMonth: [] as Conversation[],
      older: [] as Conversation[],
    };

    filteredConversations.forEach((conv) => {
      const convDate = new Date(conv.created_at);
      const convDateOnly = new Date(
        convDate.getFullYear(),
        convDate.getMonth(),
        convDate.getDate()
      );

      if (convDateOnly.getTime() === today.getTime()) {
        groups.today.push(conv);
      } else if (convDate >= weekStart && convDate < today) {
        groups.thisWeek.push(conv);
      } else if (convDate >= monthStart && convDate < weekStart) {
        groups.thisMonth.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  // Selection functions
  const toggleConversationSelection = useCallback((conversationId: string) => {
    setSelectedConversations(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(conversationId)) {
        newSelection.delete(conversationId);
      } else {
        newSelection.add(conversationId);
      }
      return newSelection;
    });
  }, []);

  const selectAllInSection = (conversations: Conversation[]) => {
    const conversationIds = conversations.map(conv => conv.id);
    const selectedInSection = conversationIds.filter(id => selectedConversations.has(id));
    const allSelected = selectedInSection.length === conversationIds.length;

    setSelectedConversations(prev => {
      const newSelection = new Set(prev);
      if (allSelected) {
        // Unselect all in this section
        conversationIds.forEach(id => newSelection.delete(id));
      } else {
        // Select all in this section
        conversationIds.forEach(id => newSelection.add(id));
      }
      return newSelection;
    });
  };

  const bulkArchive = async (conversationIds: string[], archive: boolean) => {
    try {
      const response = await fetch('/api/conversations/batch/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_ids: conversationIds,
          is_archived: archive
        })
      });

      if (!response.ok) {
        throw new Error('Batch archive operation failed');
      }

      const result = await response.json();

      setConversations(prev =>
        prev.map(conv =>
          conversationIds.includes(conv.id)
            ? { ...conv, is_archived: archive }
            : conv
        )
      );
      setSelectedConversations(new Set());

      if (result.failed_count > 0) {
        toast.warning(`${result.success_count} conversations ${archive ? 'archived' : 'unarchived'}, ${result.failed_count} failed`);
      } else {
        toast.success(`${result.success_count} conversations ${archive ? 'archived' : 'unarchived'}`);
      }
    } catch (error) {
      console.error('Bulk archive error:', error);
      toast.error("Failed to update conversations");
    }
  };

  const bulkDelete = async (conversationIds: string[]) => {
    try {
      const response = await fetch('/api/conversations/batch/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_ids: conversationIds
        })
      });

      if (!response.ok) {
        throw new Error('Batch delete operation failed');
      }

      const result = await response.json();

      setConversations(prev => prev.filter(conv => !conversationIds.includes(conv.id)));
      setSelectedConversations(new Set());

      if (result.failed_count > 0) {
        toast.warning(`${result.success_count} conversations deleted, ${result.failed_count} failed`);
      } else {
        toast.success(`${result.success_count} conversations deleted`);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error("Failed to delete conversations");
    }
  };

  const conversationGroups = groupConversationsByPeriod();

  const ConversationCard = memo(({
    conversation,
  }: {
    conversation: Conversation;
  }) => {
    const isSelected = selectedConversations.has(conversation.id);

    const handleCardClick = useCallback((e: React.MouseEvent) => {
      // Don't select if clicking on action buttons
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a')) return;
      toggleConversationSelection(conversation.id);
    }, [conversation.id, toggleConversationSelection]);

    return (
      <Card
        className={`group hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden cursor-pointer ${
          isSelected
            ? 'border-1 bg-gradient-to-r from-white via-[#a3bc0144] to-[#a3bc016b] p-[2px]'
            : 'border-0 bg-white'
        }`}
        onClick={handleCardClick}
      >
        {isSelected ? (
          <div className="bg-gradient-to-r from-white via-[#fefff8] to-[#FCFFEC] rounded-2xl h-full">
            <CardContent className="p-4">
              <div className="space-y-2">
                {/* Focus Mode Section - Above title */}
                {conversation.focus_modes && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-xs">{conversation.focus_modes.icon}</span>
                    <span className="font-medium">{conversation.focus_modes.name}</span>
                  </div>
                )}

                {conversation.category && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4 text-[#A3BC02]" />
                    <span className="font-medium">{conversation.category}</span>
                  </div>
                )}

                <h3 className="font-medium text-black text-lg leading-tight line-clamp-3 font-sans mb-2 h-[4.25rem]">
                  {conversation.title || "Untitled Conversation"}
                </h3>

                <hr className="border-black/10" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-black/40 font-sans">
                    Created: {formatDate(conversation.created_at)}
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
                            Delete Conversation
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600 font-sans">
                            Are you sure you want to{" "}
                            <span className="font-semibold text-red-600">delete</span>{" "}
                            this conversation?
                            <br />
                            <span className="block mt-2">
                              <span className="font-semibold">
                                {conversation.title || "Untitled Conversation"}
                              </span>
                            </span>
                            <br />
                            <span className="block mt-2">
                              This action{" "}
                              <span className="font-semibold">cannot be undone</span>.
                              All messages in this conversation will be{" "}
                              <span className="font-semibold">
                                permanently removed
                              </span>
                              .
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-full font-sans">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteConversation(conversation.id)}
                            className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full font-sans"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Archive Confirmation Dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 rounded-full hover:bg-white/50"
                        >
                          <Archive className={`w-4 h-4 ${
                            conversation.is_archived
                              ? 'text-[#A3BC02]'
                              : 'text-black/40'
                          }`} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border border-gray-200 rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-custom-dark-green font-serif">
                            {conversation.is_archived ? "Unarchive" : "Archive"}{" "}
                            Conversation
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600 font-sans">
                            Are you sure you want to{" "}
                            <span className="font-semibold">
                              {conversation.is_archived ? "unarchive" : "archive"}
                            </span>{" "}
                            this conversation?
                            <br />
                            <span className="block mt-2">
                              <span className="font-semibold">
                                {conversation.title || "Untitled Conversation"}
                              </span>
                            </span>
                            <br />
                            <span className="block mt-2">
                              {conversation.is_archived ? (
                                <>
                                  This conversation will be{" "}
                                  <span className="font-semibold">
                                    moved back to your active conversations
                                  </span>
                                  .
                                </>
                              ) : (
                                <>
                                  This conversation will be{" "}
                                  <span className="font-semibold">
                                    hidden from your main conversation list
                                  </span>
                                  .
                                </>
                              )}
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-full font-sans">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              toggleArchiveConversation(
                                conversation.id,
                                conversation.is_archived
                              )
                            }
                            className="bg-[#A3BC02] hover:bg-[#8BA000] text-white border-0 rounded-full font-sans"
                          >
                            {conversation.is_archived ? "Unarchive" : "Archive"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Link href={`/chat?conversation=${conversation.id}`}>
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
          </div>
        ) : (
          <CardContent className="p-4">
            <div className="space-y-2">
              {/* Focus Mode Section - Above title */}
              {conversation.focus_modes && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-xs">{conversation.focus_modes.icon}</span>
                  <span className="font-medium">{conversation.focus_modes.name}</span>
                </div>
              )}

              {conversation.category && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4 text-[#A3BC02]" />
                  <span className="font-medium">{conversation.category}</span>
                </div>
              )}

              <h3 className="font-medium text-black text-lg leading-tight line-clamp-3 font-sans mb-2 h-[4.25rem]">
                {conversation.title || "Untitled Conversation"}
              </h3>

              <hr className="border-black/10" />

              <div className="flex items-center justify-between">
                <span className="text-xs text-black/40 font-sans">
                  Created: {formatDate(conversation.created_at)}
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
                          Delete Conversation
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 font-sans">
                          Are you sure you want to{" "}
                          <span className="font-semibold text-red-600">delete</span>{" "}
                          this conversation?
                          <br />
                          <span className="block mt-2">
                            <span className="font-semibold">
                              {conversation.title || "Untitled Conversation"}
                            </span>
                          </span>
                          <br />
                          <span className="block mt-2">
                            This action{" "}
                            <span className="font-semibold">cannot be undone</span>.
                            All messages in this conversation will be{" "}
                            <span className="font-semibold">
                              permanently removed
                            </span>
                            .
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-full font-sans">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteConversation(conversation.id)}
                          className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full font-sans"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Archive Confirmation Dialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 rounded-full hover:bg-white/50"
                      >
                        <Archive className={`w-4 h-4 ${
                          conversation.is_archived
                            ? 'text-[#A3BC02]'
                            : 'text-black/40'
                        }`} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border border-gray-200 rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-custom-dark-green font-serif">
                          {conversation.is_archived ? "Unarchive" : "Archive"}{" "}
                          Conversation
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 font-sans">
                          Are you sure you want to{" "}
                          <span className="font-semibold">
                            {conversation.is_archived ? "unarchive" : "archive"}
                          </span>{" "}
                          this conversation?
                          <br />
                          <span className="block mt-2">
                            <span className="font-semibold">
                              {conversation.title || "Untitled Conversation"}
                            </span>
                          </span>
                          <br />
                          <span className="block mt-2">
                            {conversation.is_archived ? (
                              <>
                                This conversation will be{" "}
                                <span className="font-semibold">
                                  moved back to your active conversations
                                </span>
                                .
                              </>
                            ) : (
                              <>
                                This conversation will be{" "}
                                <span className="font-semibold">
                                  hidden from your main conversation list
                                </span>
                                .
                              </>
                            )}
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-full font-sans">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            toggleArchiveConversation(
                              conversation.id,
                              conversation.is_archived
                            )
                          }
                          className="bg-[#A3BC02] hover:bg-[#8BA000] text-white border-0 rounded-full font-sans"
                        >
                          {conversation.is_archived ? "Unarchive" : "Archive"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Link href={`/chat?conversation=${conversation.id}`}>
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
        )}
      </Card>
    );
  });

  const ConversationSection = ({
    title,
    conversations,
  }: {
    title: string;
    conversations: Conversation[];
  }) => {
    if (conversations.length === 0) return null;

    const sectionConversationIds = conversations.map(conv => conv.id);
    const selectedInSection = sectionConversationIds.filter(id => selectedConversations.has(id));
    const hasSelections = selectedInSection.length > 0;
    const allSelected = selectedInSection.length === sectionConversationIds.length;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 font-sans">
            {title}
          </h2>

          <div className="flex items-center gap-2">
            {/* Archive Button - only show when selections exist */}

            {/* Selected Count - only show when selections exist */}
            {hasSelections && (
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-[#A3BC02]/10 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-[#A3BC02] rounded-full"></div>
                {selectedInSection.length} Selected
              </div>
            )}
            {hasSelections && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center px-4 py-2 text-sm bg-white border-none text-black rounded-full"
                  >
                    <Archive className="w-3 h-3" />
                    Archive
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white border border-gray-200 rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-custom-dark-green font-serif">
                      Archive Conversations
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 font-sans">
                      Are you sure you want to <span className="font-semibold">archive</span> {selectedInSection.length} conversation{selectedInSection.length > 1 ? 's' : ''}?
                      <br /><br />
                      <span className="block">
                        These conversations will be <span className="font-semibold">hidden from your main conversation list</span>.
                      </span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-full font-sans">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => bulkArchive(selectedInSection, true)}
                      className="bg-[#A3BC02] hover:bg-[#8BA000] text-white border-0 rounded-full font-sans"
                    >
                      Archive {selectedInSection.length} Conversation{selectedInSection.length > 1 ? 's' : ''}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Delete Button - only show when selections exist */}
            {hasSelections && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center px-4 py-2 text-sm bg-white border-none text-black rounded-full"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white border border-gray-200 rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-custom-dark-green font-serif">
                      Delete Conversations
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 font-sans">
                      Are you sure you want to <span className="font-semibold text-red-600">delete</span> {selectedInSection.length} conversation{selectedInSection.length > 1 ? 's' : ''}?
                      <br /><br />
                      <span className="block">
                        This action <span className="font-semibold">cannot be undone</span>. All messages in these conversations will be <span className="font-semibold">permanently removed</span>.
                      </span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-full font-sans">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => bulkDelete(selectedInSection)}
                      className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full font-sans"
                    >
                      Delete {selectedInSection.length} Conversation{selectedInSection.length > 1 ? 's' : ''}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Select All Button - always show */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => selectAllInSection(conversations)}
              className={`flex items-center gap-2 rounded-full font-sans ${
                allSelected
                  ? 'border-1 bg-gradient-to-r from-[#a3bc010a] via-[#a3bc0144] to-[#a3bc016b] p-[2px]'
                  : 'bg-white border-gray-200'
              }`}
            >
              {allSelected ? (
                <div className="bg-gradient-to-r from-white via-[#fefff8] to-[#FCFFEC] rounded-full px-2 py-[6px] flex items-center gap-2">
                  <Square className="w-3 h-3 fill-[#A3BC02] text-[#A3BC02]" />
                  Unselect All
                </div>
              ) : (
                <>
                  <Square className="w-3 h-3 text-[#A3BC02]" />
                  Select All
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {conversations.map((conversation) => (
            <div key={conversation.id}>
              <ConversationCard conversation={conversation} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3BC02] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-none">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-8xl font-medium text-custom-dark-green font-serif">
            Conversation History
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500 font-sans">
              {searchQuery.trim()
                ? `${filteredConversations.length} of ${conversations.length} shown`
                : `${conversations.length} loaded${hasMore ? "+" : ""}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 rounded-full font-sans bg-[#F0F0F0]"
            >
              <Clock className="w-4 h-4" />
              {showArchived ? "Hide Archived" : "Show Archived"}
            </Button>
          </div>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Start a conversation with the AI assistant to see your history here"}
              </p>
              {!searchQuery && (
                <Link href="/chat">
                  <Button className="bg-[#A3BC02] hover:bg-[#8BA000]">
                    Start New Conversation
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <ConversationSection
              title="Today"
              conversations={conversationGroups.today}
            />
            <ConversationSection
              title="This Week"
              conversations={conversationGroups.thisWeek}
            />
            <ConversationSection
              title="This Month"
              conversations={conversationGroups.thisMonth}
            />
            <ConversationSection
              title="Older"
              conversations={conversationGroups.older}
            />


            {/* Loading Indicator */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3BC02] mx-auto mb-4"></div>
                  <p className="text-gray-500 font-sans">
                    Loading more conversations...
                  </p>
                </div>
              </div>
            )}

            {/* Manual Load More Button */}
            {hasMore && !isLoadingMore && (
              <div className="flex items-center justify-center py-8">
                <Button
                  onClick={loadMoreConversations}
                  variant="outline"
                  className="bg-white border-[#A3BC02] text-[#A3BC02] hover:bg-[#A3BC02] hover:text-white rounded-full font-sans"
                >
                  Load more conversations
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
