"use client";

import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { Users, Sun, Moon, LogOut } from "lucide-react";

export function Header() {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-8 py-4 flex items-center justify-between z-40">
      <div className="flex items-center gap-4">
        {/* Logo for mobile only */}
        <div className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
          <Image
            src="/logo.png"
            alt="SwiftFoods Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* <div className="hidden lg:flex items-center gap-6 mr-2">
          <div className="text-right">
            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest text-gray-900 dark:text-gray-100">
              Admin Node
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Consolidated View
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
            <Users size={20} />
          </div>
        </div> */}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-surface-variant text-text-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-status-red/5 text-status-red flex items-center justify-center hover:bg-status-red hover:text-white transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
