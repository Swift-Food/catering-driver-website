"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-app-bg transition-colors duration-300 overflow-hidden font-sans safe-top">
      {/* Sidebar Navigation - Desktop only */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <Header />

        {/* Scrolling Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-40 md:pb-10 hide-scrollbar">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
