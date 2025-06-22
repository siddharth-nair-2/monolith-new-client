"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function DashboardHeader() {
  const { state, isMobile, openMobile } = useSidebar();

  const showBorder = isMobile ? !openMobile : state === "collapsed";

  return (
    <header className={`px-4 py-4 ${showBorder ? "border-l-8 border-l-[#8ECC3A]" : ""}`}>
      <SidebarTrigger />
    </header>
  );
}