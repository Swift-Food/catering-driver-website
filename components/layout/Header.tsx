"use client";

import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import {
  Map as MapIcon,
  Info,
  Users,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

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
        <div className="md:hidden w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg">
          <MapIcon size={18} />
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-500 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
          <Info size={12} />
          <span className="hidden sm:inline">Shared Dashboard</span>
          <span className="sm:hidden">Shared</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden lg:flex items-center gap-6 mr-2">
          <div className="text-right">
            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">
              Admin Node
            </p>
            <p className="text-sm font-bold">Consolidated View</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
            <Users size={20} />
          </div>
        </div>

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
