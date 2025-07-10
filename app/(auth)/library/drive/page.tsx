"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useIntegrations } from "@/lib/integrations-context";

export default function GoogleDriveRedirectPage() {
  const router = useRouter();
  const { googleDriveConnections, isLoading } = useIntegrations();

  useEffect(() => {
    if (isLoading) return;

    // Redirect to first available connection or settings if none
    if (googleDriveConnections.length > 0) {
      router.replace(`/library/drive/${googleDriveConnections[0].id}`);
    } else {
      router.replace('/settings?tab=integrations');
    }
  }, [googleDriveConnections, isLoading, router]);

  return (
    <div className="min-h-screen bg-none">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#A3BC02]" />
        </div>
      </div>
    </div>
  );
}