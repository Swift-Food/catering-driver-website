"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map as MapIcon, Settings } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: <Home size={22} /> },
  { href: "/delivery", label: "Delivery", icon: <MapIcon size={22} /> },
  { href: "/settings", label: "Settings", icon: <Settings size={22} /> },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-border-subtle px-4 pb-3 flex justify-evenly items-center z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${
              isActive ? "text-primary" : "text-text-muted opacity-60"
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${
                isActive ? "bg-primary/10" : ""
              }`}
            >
              {item.icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
