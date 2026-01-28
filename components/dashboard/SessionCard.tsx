"use client";

import { useState } from "react";
import {
  Clock,
  Package,
  MapPin,
  Store,
  ChevronRight,
  UserPlus,
  Check,
  Loader2,
  Pencil,
} from "lucide-react";
import type { MealSession } from "@/lib/drivers/types";

interface SessionCardProps {
  session: MealSession;
  onClick?: () => void;
  onAccept?: (mealSessionId: string, driverName: string) => Promise<void>;
}

export default function SessionCard({
  session,
  onClick,
  onAccept,
}: SessionCardProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [saving, setSaving] = useState(false);

  const restaurantName = session.sessionName || "Meal Session";
  const portionCount = session.totalDeliveryPortions;
  const date = session.sessionDate || "";
  const time = session.eventTime || "";

  const pickupAddresses = session.restaurantPickupAddresses;
  const pickupCount = pickupAddresses
    ? Object.keys(pickupAddresses).length
    : 0;

  const collectionTimes = session.restaurantCollectionTimes;
  const timeValues = collectionTimes ? Object.values(collectionTimes) : [];
  const pickupTimeRange =
    timeValues.length > 1
      ? `${timeValues[0]} – ${timeValues[timeValues.length - 1]}`
      : timeValues.length === 1
        ? timeValues[0]
        : "";

  const dropoffAddress = session.cateringOrder?.deliveryAddress || "";

  const handleSave = async () => {
    if (!driverName.trim() || !onAccept) return;
    setSaving(true);
    try {
      await onAccept(session.id, driverName.trim());
      setIsAssigning(false);
      setDriverName("");
    } catch {
      // keep open on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full text-left bg-surface p-6 rounded-2xl shadow-sm border border-border-subtle transition-all duration-300 relative flex flex-col h-full group hover:border-primary/40">
      <div onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <Package size={20} />
            </div>
            <div className="text-right">
              {date && (
                <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-1">
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
                  {pickupCount} Pickup Node{pickupCount !== 1 ? "s" : ""}
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
                Event Time
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
                Pickup Window
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
        {onAccept && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-30">
                Identity Assignment
              </p>
              <div className="flex items-center gap-1.5 text-amber-500">
                <UserPlus size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest italic">
                  Unassigned
                </span>
              </div>
            </div>

            <div className="relative">
              <div
                onClick={() => setIsAssigning(!isAssigning)}
                className={`w-full bg-surface-variant border p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between cursor-pointer transition-all ${
                  isAssigning
                    ? "border-primary ring-2 ring-primary/10"
                    : "border-border-subtle hover:border-primary/30"
                }`}
              >
                <span
                  className={`truncate mr-2 ${driverName ? "" : "text-gray-400"}`}
                >
                  {driverName || "Assign Driver..."}
                </span>
                <Pencil size={12} className="opacity-30 shrink-0" />
              </div>

              {isAssigning && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-surface border border-border-subtle rounded-xl shadow-2xl z-[100] animate-in slide-in-from-bottom-2 duration-200 overflow-hidden">
                  <div className="p-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Enter driver name..."
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") {
                          setIsAssigning(false);
                          setDriverName("");
                        }
                      }}
                      className="w-full bg-surface-variant border-none rounded-lg py-1.5 px-3 text-[9px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex gap-2 p-2 pt-0">
                    <button
                      onClick={() => {
                        setIsAssigning(false);
                        setDriverName("");
                      }}
                      className="flex-1 py-2 rounded-lg bg-surface-variant border border-border-subtle text-[9px] font-black uppercase tracking-widest hover:text-status-red transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !driverName.trim()}
                      className="flex-1 py-2 rounded-lg bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 disabled:opacity-30 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                    >
                      {saving ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={12} strokeWidth={3} />
                          Accept
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
