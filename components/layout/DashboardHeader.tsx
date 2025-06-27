"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { MessageCirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardHeader() {
  const { state, isMobile, openMobile } = useSidebar();

  const showBorder = isMobile ? !openMobile : state === "collapsed";

  return (
    <header
      className={`flex items-center gap-4 px-4 py-3 ${
        showBorder ? "border-l-8 border-l-[#8ECC3A]" : ""
      }`}
    >
      <SidebarTrigger />

      <Link href="/chat">
        <Button
          className="
            text-gray-900
            border
            bg-white
            border-[#A3BC01]
            rounded-full
            px-4
            transition
            duration-200
            [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)]
            hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)]
            hover:bg-[#FAFFD8]
            hover:border-[#8fa002]
          "
        >
          <MessageCirclePlus className="w-4 h-4 mr-2" />
          New
        </Button>
      </Link>
    </header>
  );
}
