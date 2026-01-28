"use client";

import { useState } from "react";
import {
  Clock,
  Package,
  MapPin,
  Store,
  UserCheck,
  Pencil,
  Check,
  Loader2,
} from "lucide-react";
import type { MealSession } from "@/lib/drivers/types";

interface AssignedSessionCardProps {
  session: MealSession;
  onUpdateDriverName: (
    mealSessionId: string,
    driverName: string
  ) => Promise<void>;
}

export default function AssignedSessionCard({
  session,
  onUpdateDriverName,
}: AssignedSessionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.driverName || "");
  const [saving, setSaving] = useState(false);

  const restaurantName = session.sessionName || "Meal Session";
  const portionCount = session.totalDeliveryPortions;
  const date = session.sessionDate || "";
  const time = session.eventTime || "";

  const firstPickupAddress = session.restaurantPickupAddresses
    ? Object.values(session.restaurantPickupAddresses)[0]
    : null;

  const dropoffAddress = session.cateringOrder?.deliveryAddress || "";
  const driverName = session.driverName || "Unknown Driver";
  const deliveryStatus = session.deliveryStatus || "";

  const handleSave = async () => {
    if (!editName.trim() || editName.trim() === driverName) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onUpdateDriverName(session.id, editName.trim());
      setIsEditing(false);
    } catch {
      // keep editing open on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full text-left bg-surface p-6 rounded-2xl shadow-sm border border-border-subtle transition-all duration-300 relative flex flex-col h-full group hover:border-primary/40">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 rounded-xl bg-status-blue/10 text-status-blue transition-colors">
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
            {firstPickupAddress && (
              <div className="flex items-center gap-2.5 text-[10px] font-bold opacity-60">
                <div className="w-7 h-7 rounded-lg bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
                  <Store size={14} />
                </div>
                <span className="uppercase tracking-wider truncate">
                  {firstPickupAddress.addressLine1}
                </span>
              </div>
            )}
            {dropoffAddress && (
              <div className="flex items-center gap-2.5 text-[10px] font-bold opacity-60">
                <div className="w-7 h-7 rounded-lg bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
                  <MapPin size={14} />
                </div>
                <span className="uppercase tracking-wider truncate">
                  Drop: {dropoffAddress}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border-subtle space-y-4">
        {/* Time Block */}
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

        {/* Driver Assignment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-30">
              Assigned Driver
            </p>
            {deliveryStatus && (
              <span className="px-2 py-0.5 rounded bg-status-blue/10 text-status-blue text-[8px] font-black uppercase tracking-widest border border-status-blue/20">
                {deliveryStatus.replace(/_/g, " ")}
              </span>
            )}
          </div>

          <div className="relative">
            <div
              onClick={() => setIsEditing(!isEditing)}
              className={`w-full bg-surface-variant border p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between cursor-pointer transition-all ${
                isEditing
                  ? "border-primary ring-2 ring-primary/10"
                  : "border-border-subtle hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2 text-status-green truncate mr-2">
                <UserCheck size={12} />
                <span>{driverName}</span>
              </div>
              <Pencil size={12} className="opacity-30 shrink-0" />
            </div>

            {isEditing && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-surface border border-border-subtle rounded-xl shadow-2xl z-[100] animate-in slide-in-from-bottom-2 duration-200 overflow-hidden">
                <div className="p-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Enter driver name..."
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                      if (e.key === "Escape") {
                        setIsEditing(false);
                        setEditName(driverName);
                      }
                    }}
                    className="w-full bg-surface-variant border-none rounded-lg py-1.5 px-3 text-[9px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex gap-2 p-2 pt-0">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(driverName);
                    }}
                    className="flex-1 py-2 rounded-lg bg-surface-variant border border-border-subtle text-[9px] font-black uppercase tracking-widest hover:text-status-red transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !editName.trim()}
                    className="flex-1 py-2 rounded-lg bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 disabled:opacity-30 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    {saving ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={12} strokeWidth={3} />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
