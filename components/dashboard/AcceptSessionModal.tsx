"use client";

import { useState } from "react";
import { X, MapPin, Package, Clock, Loader2 } from "lucide-react";
import type { MealSession } from "@/lib/drivers/types";

interface AcceptSessionModalProps {
  session: MealSession | null;
  onClose: () => void;
  onAccept: (session: MealSession, driverName: string) => Promise<void>;
}

export default function AcceptSessionModal({
  session,
  onClose,
  onAccept,
}: AcceptSessionModalProps) {
  const [driverName, setDriverName] = useState("");
  const [accepting, setAccepting] = useState(false);

  if (!session) return null;

  const restaurantName = session.sessionName || "Meal Session";
  const portionCount = session.totalDeliveryPortions;
  const time = session.eventTime || "N/A";
  const guestCount = session.guestCount;

  const handleAccept = async () => {
    if (!driverName.trim()) return;
    setAccepting(true);
    try {
      await onAccept(session, driverName.trim());
    } finally {
      setAccepting(false);
      setDriverName("");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-surface rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
              Incoming Session Invitation
            </p>
            <h2 className="text-2xl font-black">{restaurantName}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center hover:text-primary transition-colors border border-border-subtle"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <CompactInfo
            icon={<Package size={16} />}
            label="Portions"
            value={portionCount.toString()}
            color="text-primary"
          />
          <CompactInfo
            icon={<Clock size={16} />}
            label="Event Time"
            value={time}
            color="text-status-blue"
          />
          <CompactInfo
            icon={<MapPin size={16} />}
            label="Guests"
            value={guestCount ? guestCount.toString() : "—"}
            color="text-amber-500"
          />
        </div>

        <div className="mb-6">
          <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-2 px-1">
            Driver Name
          </p>
          <input
            type="text"
            placeholder="Enter driver name..."
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="w-full bg-surface-variant border border-border-subtle focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-xl py-3 px-4 text-[11px] font-bold outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-xl bg-surface-variant border border-border-subtle font-bold text-xs uppercase tracking-widest hover:bg-status-red/5 hover:text-status-red hover:border-status-red/20 transition-all"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            disabled={!driverName.trim() || accepting}
            className="flex-[2] py-4 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-30 disabled:grayscale transition-all hover:translate-y-[-1px] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {accepting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Accept Mission"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompactInfo({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-surface-variant p-4 rounded-2xl border border-border-subtle">
      <div className={`flex items-center gap-2 mb-1 ${color}`}>
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest opacity-50 text-text-muted">
          {label}
        </span>
      </div>
      <p className="text-lg font-mont">{value}</p>
    </div>
  );
}
