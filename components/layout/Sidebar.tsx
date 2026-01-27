"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Map as MapIcon,
  Settings,
  X,
  Menu,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: <Home size={20} /> },
  { href: "/routes", label: "Active Route", icon: <MapIcon size={20} /> },
  { href: "/settings", label: "Settings", icon: <Settings size={20} /> },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex h-full bg-surface border-r border-border-subtle flex-col transition-all duration-300 z-50 ${
        isExpanded ? "w-72 shadow-xl" : "w-20"
      }`}
    >
      <div
        className={`flex flex-col h-full transition-all duration-300 ${
          isExpanded ? "p-6" : "p-4"
        }`}
      >
        {/* Logo */}
        <div
          className={`flex items-center mb-10 ${
            isExpanded ? "gap-4 overflow-hidden" : "justify-center"
          }`}
        >
          <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <MapIcon size={24} />
          </div>
          {isExpanded && (
            <h1 className="text-xl font-black tracking-tight whitespace-nowrap text-gray-900 dark:text-gray-100">
              SwiftFoods
            </h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center transition-all font-bold text-sm ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/10"
                    : "text-text-muted hover:bg-surface-variant"
                } ${
                  isExpanded
                    ? "w-full gap-4 p-3.5 rounded-xl"
                    : "w-12 h-12 justify-center rounded-xl mx-auto"
                }`}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                  {item.icon}
                </div>
                {isExpanded && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="mt-auto space-y-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center p-3.5 bg-surface-variant rounded-xl text-text-muted hover:text-primary transition-colors"
          >
            {isExpanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
