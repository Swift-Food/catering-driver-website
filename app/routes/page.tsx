"use client";

import { Map as MapIcon, User } from "lucide-react";

export default function RoutesPage() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
        <MapIcon size={40} />
      </div>
      <h2 className="text-2xl font-black mb-2">No Active Routes</h2>
      <p className="text-sm text-text-muted mb-8 max-w-sm">
        You don&apos;t have any active routes at the moment. New routes will appear here when assigned.
      </p>
      <div className="flex items-center gap-3 bg-surface border border-border-subtle rounded-xl p-4">
        <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary">
          <User size={20} />
        </div>
        <div className="text-left">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Status</p>
          <p className="font-bold text-sm">Ready for Assignment</p>
        </div>
      </div>
    </div>
  );
}
