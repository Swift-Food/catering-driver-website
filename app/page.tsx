"use client";

import { useAuth } from "@/lib/auth";
import { Home, Truck, CheckCircle, Clock } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
          <Home size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Welcome, {user?.firstName || user?.email || "Driver"}
          </h2>
          <p className="text-xs opacity-40 font-bold uppercase tracking-widest text-gray-900 dark:text-gray-100">
            Driver Dashboard
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-sm">
          <div className="w-12 h-12 bg-status-blue/10 rounded-xl flex items-center justify-center mb-4">
            <Truck className="w-6 h-6 text-status-blue" />
          </div>
          <h3 className="font-bold text-sm mb-1 text-gray-900 dark:text-gray-100">Active Routes</h3>
          <p className="text-3xl font-black text-status-blue">0</p>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-sm">
          <div className="w-12 h-12 bg-status-green/10 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-status-green" />
          </div>
          <h3 className="font-bold text-sm mb-1 text-gray-900 dark:text-gray-100">Completed Today</h3>
          <p className="text-3xl font-black text-status-green">0</p>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-sm">
          <div className="w-12 h-12 bg-status-amber/10 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-status-amber" />
          </div>
          <h3 className="font-bold text-sm mb-1 text-gray-900 dark:text-gray-100">Pending</h3>
          <p className="text-3xl font-black text-status-amber">0</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-surface rounded-2xl p-8 border border-border-subtle text-center">
        <p className="text-text-muted">
          No active deliveries at the moment. Check back later for new routes.
        </p>
      </div>
    </div>
  );
}
