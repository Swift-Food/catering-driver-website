"use client";

import { ReactNode } from "react";
import { useTheme } from "@/lib/theme";
import { Settings, Sun, Moon, ChevronRight } from "lucide-react";

interface OptionItemProps {
  icon: ReactNode;
  label: string;
  value: string;
  onClick: () => void;
  toggle?: boolean;
  isOn?: boolean;
}

function OptionItem({
  icon,
  label,
  value,
  onClick,
  toggle,
  isOn,
}: OptionItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-6 bg-surface rounded-3xl border border-border-subtle shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div className="text-left">
          <p className="font-black text-sm text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-[9px] font-bold uppercase opacity-30 tracking-widest text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
      </div>
      {toggle ? (
        <div
          className={`w-12 h-7 rounded-full transition-colors relative ${
            isOn ? "bg-primary" : "bg-gray-200 dark:bg-white/10"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
              isOn ? "right-1" : "left-1 shadow-sm"
            }`}
          ></div>
        </div>
      ) : (
        <ChevronRight size={18} className="opacity-20 text-gray-900 dark:text-gray-100" />
      )}
    </button>
  );
}

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">System Settings</h2>
          <p className="text-xs opacity-40 font-bold uppercase tracking-widest text-gray-900 dark:text-gray-100">
            Configuration & Preferences
          </p>
        </div>
      </div>

    <div className="space-y-4 mt-8">
        <h3 className="text-sm font-black uppercase tracking-widest opacity-40 px-2 text-gray-900 dark:text-gray-100">
          Appearance
        </h3>
        <div className="space-y-3">
          <OptionItem
            icon={isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            label="Visual Theme"
            value={isDarkMode ? "Dark Mode Active" : "Light Mode Active"}
            onClick={toggleTheme}
            toggle
            isOn={isDarkMode}
          />
        </div>
      </div>

      <div className="pt-8 border-t border-border-subtle">
        <p className="text-[10px] text-center opacity-20 font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100">
          SwiftFoods Driver Console v2.4.0
        </p>
      </div>
    </div>
  );
}
