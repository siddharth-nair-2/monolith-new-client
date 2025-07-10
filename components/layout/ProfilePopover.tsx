"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Users, Building2, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ProfilePopover() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Check if current user is admin or owner
  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'owner';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-gray-50"
        >
          <Users className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="rounded-2xl w-72 sm:w-80 p-0 bg-white border border-gray-200 [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)]" 
        align="end"
      >
        <div className="rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3">
            <h3 className="text-base font-normal text-[#3E4128]">Workspace</h3>
          </div>
          
          {/* Divider */}
          <div className="px-5">
            <div className="border-b border-gray-200"></div>
          </div>

          {/* User Info */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#A3BC02] rounded-full flex items-center justify-center text-white font-semibold">
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-3 pb-3 space-y-1">
            <Link href="/team">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 transition-colors text-left">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Team</span>
              </button>
            </Link>

            {isAdmin() && (
              <Link href="/organization">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 transition-colors text-left">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Organization</span>
                </button>
              </Link>
            )}

            <Link href="/profile">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 transition-colors text-left">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Profile</span>
              </button>
            </Link>

            <div className="border-t border-gray-100 my-2"></div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Logout</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}