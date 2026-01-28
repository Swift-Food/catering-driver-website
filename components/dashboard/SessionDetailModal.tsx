"use client";

import { useState } from "react";
import { X, MapPin, Package, Clock, Store, Loader2, UserCheck } from "lucide-react";
import type { MealSession, MealSessionDeliveryStatus } from "@/lib/drivers/types";
import GoogleMap, { type MapPin as GoogleMapPin } from "@/components/dashboard/GoogleMap";

interface SessionDetailModalProps {
  session: MealSession | null;
  onClose: () => void;
  onAccept: (session: MealSession, driverName: string) => Promise<void>;
  onUpdateDriverName?: (session: MealSession, driverName: string) => Promise<void>;
}

export default function SessionDetailModal({
  session,
  onClose,
  onAccept,
  onUpdateDriverName,
}: SessionDetailModalProps) {
  const [driverName, setDriverName] = useState("");
  const [accepting, setAccepting] = useState(false);

  if (!session) return null;

  const restaurantName = session.sessionName || "Meal Session";
  const portionCount = session.totalDeliveryPortions;
  const date = session.sessionDate || "";
  const time = session.eventTime || "N/A";

  const pickupAddresses = session.restaurantPickupAddresses;
  const pickupEntries = pickupAddresses ? Object.entries(pickupAddresses) : [];
  const pickupCount = pickupEntries.length;

  const dropoffAddress = session.cateringOrder?.deliveryAddress || "";
  const dropoffLocation = session.cateringOrder?.deliveryLocation;

  const mapPins: GoogleMapPin[] = [
    ...pickupEntries.map(([, addr]) => ({
      latitude: addr.location.latitude,
      longitude: addr.location.longitude,
      label: addr.name,
      address: `${addr.addressLine1}, ${addr.city}`,
      color: "pink" as const,
    })),
    ...(dropoffLocation
      ? [
          {
            latitude: dropoffLocation.latitude,
            longitude: dropoffLocation.longitude,
            label: "Delivery",
            address: dropoffAddress,
            color: "green" as const,
          },
        ]
      : []),
  ];

  const isPending =
    (session.deliveryStatus as MealSessionDeliveryStatus) === "finding_driver";

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
      <div className="relative w-full max-w-lg bg-surface rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10 max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
              {isPending ? "Incoming Session Invitation" : "Session Details"}
            </p>
            <h2 className="text-2xl font-black">{restaurantName}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center hover:text-primary transition-colors border border-border-subtle shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <CompactInfo
            icon={<Package size={16} />}
            label="Portions"
            value={portionCount.toString()}
            color="text-primary"
          />
          <div className="bg-surface-variant p-4 rounded-2xl border border-border-subtle">
            <div className="flex items-center gap-2 mb-1 text-status-blue">
              <Clock size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-50 text-text-muted">
                Event Time
              </span>
            </div>
            <p className="text-lg font-mont leading-tight">{time}</p>
            {date && (
              <p className="text-[10px] font-bold opacity-50 mt-1">{date}</p>
            )}
          </div>
          <CompactInfo
            icon={<Store size={16} />}
            label="Pickups"
            value={pickupCount.toString()}
            color="text-amber-500"
          />
        </div>

        {/* Pickup Addresses */}
        {pickupEntries.length > 0 && (
          <div className="mb-6">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-3 px-1">
              Pickup Locations ({pickupEntries.length})
            </p>
            <div className="space-y-2">
              {pickupEntries.map(([id, addr]) => (
                <div
                  key={id}
                  className="flex items-start gap-2.5 bg-surface-variant p-3 rounded-xl border border-border-subtle"
                >
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-surface flex items-center justify-center text-primary border border-border-subtle mt-0.5">
                    <Store size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest truncate">
                      {addr.name}
                    </p>
                    <p className="text-[9px] font-bold opacity-50 uppercase tracking-wider">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    </p>
                    <p className="text-[9px] font-bold opacity-50 uppercase tracking-wider">
                      {addr.city}, {addr.zipcode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dropoff Address */}
        {dropoffAddress && (
          <div className="mb-6">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-3 px-1">
              Delivery Destination
            </p>
            <div className="flex items-start gap-2.5 bg-surface-variant p-3 rounded-xl border border-border-subtle">
              <div className="w-7 h-7 shrink-0 rounded-lg bg-surface flex items-center justify-center text-primary border border-border-subtle mt-0.5">
                <MapPin size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest truncate">
                  {dropoffAddress}
                </p>
              </div>
            </div>
          </div>
        )}

        {mapPins.length > 0 && (
          <div className="mb-6">
            <GoogleMap
              pins={mapPins}
              className="h-[200px] border border-border-subtle"
            />
          </div>
        )}

        {isPending ? (
          <>
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
                  "Accept Delivery"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-2 px-1">
                Assigned Driver
              </p>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Enter driver name..."
                  value={driverName || session.driverName || ""}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-surface-variant border border-border-subtle focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-xl py-3 px-4 pr-10 text-[11px] font-bold outline-none transition-all placeholder:text-gray-400"
                />
                <UserCheck
                  size={14}
                  className="absolute right-4 text-status-green pointer-events-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-xl bg-surface-variant border border-border-subtle font-bold text-xs uppercase tracking-widest hover:border-primary/30 transition-all"
              >
                Close
              </button>
              {onUpdateDriverName && (
                <button
                  onClick={async () => {
                    const name = driverName.trim() || session.driverName || "";
                    if (!name || name === session.driverName) return;
                    setAccepting(true);
                    try {
                      await onUpdateDriverName(session, name);
                    } finally {
                      setAccepting(false);
                    }
                  }}
                  disabled={
                    accepting ||
                    !(driverName.trim()) ||
                    driverName.trim() === (session.driverName || "")
                  }
                  className="flex-[2] py-4 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-30 disabled:grayscale transition-all hover:translate-y-[-1px] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {accepting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Update Driver"
                  )}
                </button>
              )}
            </div>
          </>
        )}
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
