"use client";

import { useState, useRef, useEffect } from "react";
import {
  Clock,
  Package,
  MapPin,
  Store,
  ChevronRight,
  UserPlus,
  UserCheck,
  Check,
  Loader2,
} from "lucide-react";
import type { DriverMealSessionDto, MealSessionDeliveryStatus } from "@/lib/drivers/types";
import { formatDate, formatTime } from "@/lib/formatters";

interface SessionCardProps {
  session: DriverMealSessionDto;
  onClick?: () => void;
  onDriverSubmit?: (mealSessionId: string, driverName: string) => Promise<void>;
}

export default function SessionCard({
  session,
  onClick,
  onDriverSubmit,
}: SessionCardProps) {
  const isAssigned =
    (session.deliveryStatus as MealSessionDeliveryStatus) !== "finding_driver";
  const existingDriver = session.driverName || "";

  const [inputValue, setInputValue] = useState(existingDriver);
  const [isFocused, setIsFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const driverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFocused) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (driverRef.current && !driverRef.current.contains(e.target as Node)) {
        handleCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFocused]);

  const restaurantName = session.sessionName || "Meal Session";
  const portionCount = session.totalPortions;
  const date = formatDate(session.sessionDate);
  const time = formatTime(session.eventTime);

  const pickupCount = session.restaurants.length;

  const collectionTimes = session.restaurants.map((r) => r.collectionTime).filter(Boolean);
  const pickupTimeRange =
    collectionTimes.length > 1
      ? `${formatTime(collectionTimes[0])} – ${formatTime(collectionTimes[collectionTimes.length - 1])}`
      : collectionTimes.length === 1
        ? formatTime(collectionTimes[0])
        : "";

  const dropoffAddress = session.delivery.address || "";
  const deliveryStatus = session.deliveryStatus || "";

  const handleSubmit = async () => {
    if (!inputValue.trim() || !onDriverSubmit) return;
    if (isAssigned && inputValue.trim() === existingDriver) {
      setIsFocused(false);
      return;
    }
    setSaving(true);
    try {
      await onDriverSubmit(session.id, inputValue.trim());
      setIsFocused(false);
    } catch {
      // keep open on error
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setInputValue(existingDriver);
    setIsFocused(false);
  };

  return (
    <div className="w-full text-left bg-surface p-4 rounded-2xl shadow-sm border border-border-subtle transition-all duration-300 relative flex flex-col h-full group hover:border-primary/40">
      <div onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-6">
            <div
              className={`p-3 rounded-xl transition-colors ${
                isAssigned
                  ? "bg-status-blue/10 text-status-blue"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <Package size={20} />
            </div>
            <div className="text-right">
              {date && (
                <p className="text-[11px] font-black uppercase opacity-30 tracking-widest mb-1">
                  {date}
                </p>
              )}
              <p className="text-[11px] font-black text-primary uppercase tracking-widest leading-none">
                {portionCount} PORTIONS
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-black leading-tight group-hover:text-primary transition-colors">
              {restaurantName}
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-[10px] font-bold opacity-60">
                <div className="w-7 h-7 shrink-0 rounded-lg bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
                  <Store size={14} />
                </div>
                <span className="uppercase tracking-wider">
                  {pickupCount} Pickup{/*pickupCount !== 1 ? "s" : ""*/}
                </span>
              </div>
              {dropoffAddress && (
                <div className="flex items-start gap-2.5 text-[10px] font-bold opacity-60">
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
                    <MapPin size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">
                      Drop
                    </p>
                    <p className="uppercase tracking-wider truncate">
                      {dropoffAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border-subtle space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {time && (
            <div className="bg-surface-variant p-3 rounded-xl border border-border-subtle">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1.5">
                Event<br />Time
              </p>
              <div className="flex items-center gap-2 text-primary">
                <Clock size={12} strokeWidth={2.5} />
                <span className="text-[11px] font-black tracking-tight">
                  {time}
                </span>
              </div>
            </div>
          )}
          {pickupTimeRange && (
            <div className="bg-surface-variant p-3 rounded-xl border border-border-subtle">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1.5">
                Pickup<br />Window
              </p>
              <div className="flex items-center gap-2 text-status-green">
                <Clock size={12} strokeWidth={2.5} />
                <span className="text-[11px] font-black tracking-tight">
                  {pickupTimeRange}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Driver Assignment */}
        {onDriverSubmit && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-30">
                {isAssigned ? "Assigned Driver" : "Driver Assignment"}
              </p>
              {isAssigned ? (
                deliveryStatus && (
                  <span className="px-2 py-0.5 rounded bg-status-blue/10 text-status-blue text-[8px] font-black uppercase tracking-widest border border-status-blue/20">
                    {deliveryStatus.replace(/_/g, " ")}
                  </span>
                )
              ) : (
                <div className="flex items-center gap-1.5 text-amber-500">
                  <UserPlus size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest italic">
                    Unassigned
                  </span>
                </div>
              )}
            </div>

            <div ref={driverRef} className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Assign Driver..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                    if (e.key === "Escape") handleCancel();
                  }}
                  className={`w-full bg-surface-variant border p-2.5 ${isAssigned ? "pr-9" : ""} text-[10px] font-black outline-none transition-all ${
                    isFocused
                      ? "border-primary ring-2 ring-primary/10 rounded-t-xl rounded-b-none"
                      : "border-border-subtle rounded-xl"
                  }`}
                />
                {isAssigned && (
                  <UserCheck
                    size={14}
                    className="absolute right-3 shrink-0 text-status-green pointer-events-none"
                  />
                )}
              </div>

              {isFocused && (
                <div className="absolute top-full left-0 right-0 bg-surface border border-border-subtle border-t-0 rounded-b-xl shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-200 overflow-hidden p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-2.5 rounded-lg bg-surface-variant border border-border-subtle text-[9px] font-black uppercase tracking-widest hover:text-status-red transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={saving || !inputValue.trim()}
                      className="flex-1 py-2.5 rounded-lg bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 disabled:opacity-30 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                    >
                      {saving ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={12} strokeWidth={3} />
                          {isAssigned ? "Save" : "Accept"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div
          onClick={onClick}
          className={`flex items-center justify-between text-primary ${onClick ? "cursor-pointer" : ""}`}
        >
          <span className="text-[9px] font-black uppercase tracking-widest">
            View Details
          </span>
          <ChevronRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </div>
  );
}

