"use client";

import { useState } from "react";
import { Package, Clock, Play, Loader2 } from "lucide-react";
import type { MealSession } from "@/lib/drivers/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  finding_driver: "Finding Driver",
  driver_assigned: "Assigned",
  awaiting_pickup: "Awaiting Pickup",
  out_for_delivery: "Out for Delivery",
  at_collection_point: "At Destination",
  delivered: "Delivered",
};

interface DeliveryHeaderPanelProps {
  session: MealSession;
  pickupCount: number;
  onStartDelivery: () => Promise<void>;
}

export default function DeliveryHeaderPanel({
  session,
  pickupCount,
  onStartDelivery,
}: DeliveryHeaderPanelProps) {
  const statusLabel =
    STATUS_LABELS[session.deliveryStatus] || session.deliveryStatus;
  const isAssigned = session.deliveryStatus === "driver_assigned";

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-lg border border-border-subtle flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <Package size={24} />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-black">
              {session.sessionName || "Delivery"}
            </h2>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">
              {statusLabel}
            </span>
          </div>
          <p className="text-text-muted font-bold uppercase tracking-widest text-[9px]">
            {session.driverName} &bull; {pickupCount} Pickup{" "}
            {pickupCount === 1 ? "Node" : "Nodes"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAssigned ? (
          <StartDeliveryButton onStart={onStartDelivery} />
        ) : (
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-0.5 text-center md:text-right">
              Event Time
            </p>
            <div className="flex items-center gap-2 text-primary">
              <Clock size={16} strokeWidth={3} />
              <span className="text-xl font-bold tracking-tight">
                {formatTime(session.eventTime)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StartDeliveryButton({ onStart }: { onStart: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onStart();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Play size={14} />
      )}
      Start Delivery
    </button>
  );
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}
