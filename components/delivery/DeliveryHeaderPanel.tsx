"use client";

import { Package, Clock, Calendar, Store } from "lucide-react";
import type { DriverMealSessionDto } from "@/lib/drivers/types";

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
  session: DriverMealSessionDto;
  pickupCount: number;
}

export default function DeliveryHeaderPanel({
  session,
  pickupCount,
}: DeliveryHeaderPanelProps) {
  const statusLabel =
    STATUS_LABELS[session.deliveryStatus] || session.deliveryStatus;

  const earliestPickupTime = getEarliestPickupTime(session);

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border-subtle flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <Package size={24} />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-lg font-black">
              {session.sessionName || "Delivery"}
            </h2>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Calendar size={11} />
              <span className="font-bold uppercase tracking-widest text-[9px]">
                {formatDate(session.sessionDate)}
              </span>
            </div>
            <span className="text-text-muted text-[9px]">&bull;</span>
            <span className="text-text-muted font-bold uppercase tracking-widest text-[9px]">
              {pickupCount} Pickup{pickupCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
        {/* Earliest Pickup */}
        <div className="text-left lg:text-right">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-0.5 flex items-center gap-1.5">
            <Store size={10} />
            Earliest Pickup
          </p>
          <div className="flex items-center gap-2 text-primary">
            <Clock size={14} strokeWidth={3} />
            <span className="text-base font-bold tracking-tight">
              {earliestPickupTime}
            </span>
          </div>
        </div>

        <div className="w-full h-px lg:w-px lg:h-10 bg-border-subtle" />

        {/* Event Time */}
        <div className="text-left lg:text-right">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-0.5">
            Event Time
          </p>
          <div className="flex items-center gap-2 text-primary">
            <Clock size={14} strokeWidth={3} />
            <span className="text-base font-bold tracking-tight">
              {formatTime(session.eventTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseCollectionTime(
  timeStr: string,
  sessionDate?: string | null
): Date | null {
  // Try parsing as-is (full ISO date string)
  const d = new Date(timeStr);
  if (!isNaN(d.getTime())) return d;

  // Try combining with session date (for time-only strings like "10:30" or "10:30 AM")
  if (sessionDate) {
    const datePrefix = sessionDate.split("T")[0];
    const combined = new Date(`${datePrefix}T${timeStr}`);
    if (!isNaN(combined.getTime())) return combined;
  }

  return null;
}

function getEarliestPickupTime(session: DriverMealSessionDto): string {
  const times: Date[] = [];

  // Check per-restaurant collection times
  for (const restaurant of session.restaurants) {
    if (restaurant.collectionTime) {
      const d = parseCollectionTime(restaurant.collectionTime, session.sessionDate);
      if (d) times.push(d);
    }
  }

  if (times.length === 0) return "N/A";

  const earliest = new Date(Math.min(...times.map((d) => d.getTime())));
  return formatTime(earliest.toISOString());
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try as time-only string (e.g. "11:00", "2:30 PM")
      date = new Date(`1970-01-01T${dateStr}`);
      if (isNaN(date.getTime())) return dateStr;
    }
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
