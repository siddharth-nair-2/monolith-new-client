"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { RefreshCw, Lock, Clock, X, Network } from "lucide-react";
import { useIntegrations } from "@/lib/integrations-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function ConnectionsPopover() {
  const { isGoogleDriveConnected, hasActiveSync } = useIntegrations();
  const router = useRouter();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-none rounded-full px-4 py-2 shadow-lg [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2),0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:bg-gray-50"
        >
          <Network className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Connected</span>
          <div className="w-2 h-2 bg-[#A3BC02] rounded-full"></div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="rounded-2xl w-72 sm:w-80 p-0 bg-white border border-gray-200 [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)]"
        align="end"
      >
        <div className="rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3">
            <h3 className="text-base font-normal text-[#3E4128]">Portals</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>Synced</span>
              <RefreshCw className="w-3 h-3" />
            </div>
          </div>

          {/* Divider */}
          <div className="px-5">
            <div className="border-b border-gray-200"></div>
          </div>

          {/* Connections List */}
          <div className="p-5 space-y-2">
            {/* SharePoint - Coming Soon */}
            <button
              onClick={() => router.push("/settings?tab=integrations")}
              className="w-full flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/icons/integrations/sharepoint.png"
                  alt="SharePoint"
                  width={20}
                  height={20}
                />
                <span className="text-sm font-medium text-gray-700">
                  SharePoint
                </span>
              </div>
              <Clock className="w-4 h-4 text-gray-400" />
            </button>

            {/* Outlook - Coming Soon */}
            <button
              onClick={() => router.push("/settings?tab=integrations")}
              className="w-full flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/icons/integrations/outlook.svg"
                  alt="Outlook"
                  width={20}
                  height={20}
                />
                <span className="text-sm font-medium text-gray-700">
                  Outlook
                </span>
              </div>
              <Clock className="w-4 h-4 text-gray-400" />
            </button>

            {/* Teams - Coming Soon */}
            <button
              onClick={() => router.push("/settings?tab=integrations")}
              className="w-full flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/icons/integrations/teams.svg"
                  alt="Teams"
                  width={20}
                  height={20}
                />
                <span className="text-sm font-medium text-gray-700">
                  Teams
                </span>
              </div>
              <Clock className="w-4 h-4 text-gray-400" />
            </button>

            {/* Google Drive - Always show, status depends on connection */}
            <button
              onClick={() => router.push("/settings?tab=integrations")}
              className="w-full flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/icons/integrations/drive.png"
                  alt="Google Drive"
                  width={20}
                  height={20}
                />
                <span className="text-sm font-medium text-gray-700">
                  Google Drive
                </span>
              </div>
              {isGoogleDriveConnected ? (
                <div
                  className={`w-2 h-2 rounded-full ${
                    hasActiveSync ? "bg-blue-500 animate-pulse" : "bg-[#A3BC02]"
                  }`}
                ></div>
              ) : (
                <X className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Monolith Secure Section */}
          <div className="bg-[#181818] text-white p-4 py-2 flex items-center justify-between">
            <div className="flex flex-col gap-0">
              <h4 className="text-lg font-serif">
                Mono<span className="underline">l</span>ith Secure
              </h4>
              <Link
                href="/#how-it-works"
                className="text-[10px] text-white/50 underline decoration-[0.25px] underline-offset-2 hover:text-white transition-colors"
              >
                Learn how data is managed
              </Link>
            </div>
            <Lock className="w-4 h-4" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
