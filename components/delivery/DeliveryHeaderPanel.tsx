"use client";

import { useState, useEffect } from "react";
import { Package, Clock, Calendar, Store, Play, Loader2, User, Timer } from "lucide-react";
import type { DriverMealSessionDto } from "@/lib/drivers/types";
import { formatTime, formatDate } from "@/lib/formatters";

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
  onStartDelivery?: () => Promise<void>;
}

export default function DeliveryHeaderPanel({
  session,
  pickupCount,
  onStartDelivery,
}: DeliveryHeaderPanelProps) {
  const statusLabel =
    STATUS_LABELS[session.deliveryStatus] || session.deliveryStatus;

  const earliestPickupTime = getEarliestPickupTime(session);
  const showStartButton =
    session.deliveryStatus === "driver_assigned" &&
    onStartDelivery &&
    isWithinTwoHoursOfPickup(session);

  const deliveryStarted =
    session.deliveryStatus !== "pending" &&
    session.deliveryStatus !== "finding_driver" &&
    session.deliveryStatus !== "driver_assigned";

  const countdown = useCountdown(session, deliveryStarted);

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border-subtle flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <Package size={24} />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-lg font-black flex items-center gap-2">
              <User size={16} className="text-primary" />
              {session.delivery.contactName || "Delivery"}
            </h2>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">
              #{session.id.slice(0, 4).toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Calendar size={11} />
              <span className="font-bold uppercase tracking-widest text-[9px]">
                {formatDate(session.sessionDate, "N/A")}
              </span>
            </div>
            <span className="text-text-muted text-[9px]">&bull;</span>
            <span className="text-text-muted font-bold uppercase tracking-widest text-[9px]">
              {pickupCount} Pickup{pickupCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* Earliest Pickup - always shown */}
        <div className="text-center">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1 flex items-center justify-center gap-1.5">
            <Store size={10} />
            Earliest Pickup
          </p>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Clock size={14} strokeWidth={3} />
            <span className="text-base font-bold tracking-tight">
              {earliestPickupTime}
            </span>
          </div>
        </div>

        <div className="w-px h-10 bg-border-subtle" />

        {/* Event Time */}
        <div className="text-center">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1">
            Event Time
          </p>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Clock size={14} strokeWidth={3} />
            <span className="text-base font-bold tracking-tight">
              {formatTime(session.eventTime, "N/A")}
            </span>
          </div>
        </div>

        {/* Countdown - shown after delivery started */}
        {countdown && (
          <>
            <div className="w-px h-10 bg-border-subtle" />
            <div className="text-left lg:text-right">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-0.5 flex items-center gap-1.5">
                <Timer size={10} />
                {countdown.label}
              </p>
              <div className={`flex items-center gap-2 ${countdown.urgent ? "text-red-500" : "text-primary"}`}>
                <Timer size={14} strokeWidth={3} className={countdown.urgent ? "animate-pulse" : ""} />
                <span className="text-base font-bold tracking-tight tabular-nums">
                  {countdown.display}
                </span>
              </div>
            </div>
          </>
        )}

        {showStartButton && (
          <>
            <div className="w-px h-10 bg-border-subtle" />
            <StartDeliveryButton onStart={onStartDelivery} />
          </>
        )}
      </div>
    </div>
  );
}

interface CountdownResult {
  label: string;
  display: string;
  urgent: boolean;
}

function useCountdown(
  session: DriverMealSessionDto,
  deliveryStarted: boolean
): CountdownResult | null {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!deliveryStarted) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [deliveryStarted]);

  if (!deliveryStarted) return null;

  // Collect all restaurant pickup times with their collected status
  const collectedIds = new Set(Object.keys(session.restaurantPickupStatus || {}));
  const uncollectedTimes: Date[] = [];
  const allPickupTimes: Date[] = [];

  for (const restaurant of session.restaurants) {
    if (restaurant.collectionTime) {
      const d = parseCollectionTime(restaurant.collectionTime, session.sessionDate);
      if (d) {
        allPickupTimes.push(d);
        if (!collectedIds.has(restaurant.restaurantId)) {
          uncollectedTimes.push(d);
        }
      }
    }
  }

  // Sort uncollected times ascending to find the next one
  uncollectedTimes.sort((a, b) => a.getTime() - b.getTime());

  const allPastPickup =
    allPickupTimes.length === 0 ||
    allPickupTimes.every((t) => now.getTime() >= t.getTime());

  if (!allPastPickup && uncollectedTimes.length > 0) {
    // Find the next future uncollected pickup time
    const nextPickup = uncollectedTimes.find((t) => t.getTime() > now.getTime());
    if (nextPickup) {
      const diff = nextPickup.getTime() - now.getTime();
      return {
        label: "Next Pickup In",
        display: formatCountdown(diff),
        urgent: diff < 10 * 60 * 1000, // under 10 minutes
      };
    }
  }

  // All pickup times have passed — countdown to delivery (event time)
  if (allPastPickup && session.eventTime) {
    const eventDate = parseCollectionTime(session.eventTime, session.sessionDate);
    if (eventDate) {
      const diff = eventDate.getTime() - now.getTime();
      if (diff > 0) {
        return {
          label: "Deliver In",
          display: formatCountdown(diff),
          urgent: diff < 15 * 60 * 1000, // under 15 minutes
        };
      }
      // Past event time — show how late
      return {
        label: "Overdue By",
        display: `+${formatCountdown(Math.abs(diff))}`,
        urgent: true,
      };
    }
  }

  return null;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
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
      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
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

function isWithinTwoHoursOfPickup(session: DriverMealSessionDto): boolean {
  const times: Date[] = [];

  for (const restaurant of session.restaurants) {
    if (restaurant.collectionTime) {
      const d = parseCollectionTime(restaurant.collectionTime, session.sessionDate);
      if (d) times.push(d);
    }
  }

  if (times.length === 0) return false;

  const earliest = new Date(Math.min(...times.map((d) => d.getTime())));
  const now = new Date();
  const twoHoursBefore = new Date(earliest.getTime() - 2 * 60 * 60 * 1000);

  return now >= twoHoursBefore;
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

