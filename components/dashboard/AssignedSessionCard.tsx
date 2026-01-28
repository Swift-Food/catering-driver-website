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
  X,
  Loader2,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MealSession = any;

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

  const restaurantName =
    session.restaurantName ||
    session.restaurant?.name ||
    session.mealSessionName ||
    "Meal Session";

  const portionCount =
    session.portionCount || session.totalPortions || session.quantity || 0;

  const date =
    session.date || session.deliveryDate || session.scheduledDate || "";
  const time =
    session.time || session.deliveryTime || session.scheduledTime || "";

  const pickupAddress =
    session.pickupAddress?.addressLine1 ||
    session.restaurant?.address?.addressLine1 ||
    session.pickupLocation ||
    "";

  const dropoffName =
    session.deliveryAddress?.name ||
    session.dropoffName ||
    session.destination?.name ||
    "Delivery Location";

  const dropoffAddress =
    session.deliveryAddress?.addressLine1 ||
    session.destination?.addressLine1 ||
    session.dropoffLocation ||
    "";

  const driverName = session.driverName || "Unknown Driver";
  const deliveryStatus = session.deliveryStatus || "";
  const sessionId = session.id || session._id;

  const handleSave = async () => {
    if (!editName.trim() || editName.trim() === driverName) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onUpdateDriverName(sessionId, editName.trim());
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
            {portionCount > 0 && (
              <p className="text-[11px] font-black text-primary uppercase tracking-widest leading-none">
                {portionCount} PORTIONS
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-black leading-tight group-hover:text-primary transition-colors">
            {restaurantName}
          </h3>

          <div className="space-y-2">
            {pickupAddress && (
              <div className="flex items-center gap-2.5 text-[10px] font-bold opacity-60">
                <div className="w-7 h-7 rounded-lg bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
                  <Store size={14} />
                </div>
                <span className="uppercase tracking-wider truncate">
                  {pickupAddress}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-[10px] font-bold opacity-60">
              <div className="w-7 h-7 rounded-lg bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
                <MapPin size={14} />
              </div>
              <span className="uppercase tracking-wider truncate">
                Drop: {dropoffName}
                {dropoffAddress ? ` — ${dropoffAddress}` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border-subtle space-y-4">
        {/* Time Block */}
        {time && (
          <div className="bg-surface-variant p-3 rounded-xl border border-border-subtle">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1.5">
              Delivery Time
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

          {isEditing ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="flex-1 bg-surface-variant border border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-xl py-2.5 px-3.5 text-[10px] font-black uppercase tracking-widest outline-none transition-all"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-10 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30 flex items-center justify-center"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={16} strokeWidth={3} />
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(driverName);
                }}
                className="w-10 bg-surface-variant border border-border-subtle rounded-xl hover:text-status-red transition-all flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-surface-variant p-3 rounded-xl border border-border-subtle">
              <div className="flex items-center gap-2 text-status-green">
                <UserCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {driverName}
                </span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="w-7 h-7 rounded-lg hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all text-text-muted"
                title="Edit driver name"
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
