"use client";

import { ReactNode, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Map as MapIcon, Settings } from "lucide-react";
import { useDriver } from "@/lib/drivers";

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
  const router = useRouter();
  const { requestNavigation } = useDriver();

  const handleNavClick = useCallback(
    (href: string) => {
      if (pathname === href) return;
      const leavingDelivery = pathname === "/delivery" && href !== "/delivery";
      requestNavigation(href, () => router.push(href), leavingDelivery ? { clearDriver: true } : undefined);
    },
    [pathname, requestNavigation, router]
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-border-subtle px-4 pt-1 pb-4 safe-bottom flex justify-evenly items-center z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <button
            key={item.href}
            onClick={() => handleNavClick(item.href)}
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
          </button>
        );
      })}
    </nav>
  );
}
