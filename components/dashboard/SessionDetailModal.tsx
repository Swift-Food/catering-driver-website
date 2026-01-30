"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  MapPin,
  Package,
  Clock,
  Store,
  Loader2,
  UserPlus,
  Check,
  ChevronLeft,
} from "lucide-react";
import type { DriverMealSessionDto, MealSessionDeliveryStatus } from "@/lib/drivers/types";
import GoogleMap, { type MapPin as GoogleMapPin } from "@/components/dashboard/GoogleMap";
import { formatTime } from "@/lib/formatters";

interface SessionDetailModalProps {
  session: DriverMealSessionDto | null;
  onClose: () => void;
  onAccept?: (session: DriverMealSessionDto, driverNames: string[]) => Promise<void>;
  onUpdateDriverName?: (
    session: DriverMealSessionDto,
    driverNames: string[]
  ) => Promise<void>;
  onBack?: () => void;
}

export default function SessionDetailModal({
  session,
  onClose,
  onAccept,
  onUpdateDriverName,
  onBack,
}: SessionDetailModalProps) {
  const [drivers, setDrivers] = useState<string[]>([]);
  const [driverInput, setDriverInput] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const driverRef = useRef<HTMLDivElement>(null);
  const lastSyncRef = useRef<string | null>(null);

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

  // Re-initialize drivers when session or driverNames changes
  useEffect(() => {
    if (!session) return;
    // MULTI-DRIVER: Use driverNames array directly
    const driverNamesStr = (session.driverNames || []).join(",");
    const key = `${session.id}::${driverNamesStr}`;
    if (key === lastSyncRef.current) return;
    setDrivers(session.driverNames || []);
    setDriverInput("");
    setIsFocused(false);
    lastSyncRef.current = key;
  }, [session]);

  if (!session) return null;

  const restaurantName = session.sessionName || "Meal Session";
  const portionCount = session.totalPortions;
  const date = session.sessionDate || "";
  const time = formatTime(session.eventTime || "") || "N/A";

  const pickupCount = session.restaurants.length;

  const dropoffAddress = session.delivery.address || "";
  const dropoffLocation = session.delivery.location;

  const isPending =
    (session.deliveryStatus as MealSessionDeliveryStatus) === "finding_driver";
  const readOnly = !onAccept && !onUpdateDriverName;

  // MULTI-DRIVER: Use driverNames array directly
  const existingDrivers = session.driverNames || [];
  const deliveryStatus = session.deliveryStatus || "";

  const hasChanges =
    drivers.length !== existingDrivers.length ||
    drivers.some((d, i) => d !== existingDrivers[i]);

  const mapPins: GoogleMapPin[] = [
    ...session.restaurants
      .filter((r) => r.address.location)
      .map((r) => ({
        latitude: r.address.location!.latitude,
        longitude: r.address.location!.longitude,
        label: r.restaurantName,
        address: `${r.address.addressLine1}, ${r.address.city}`,
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

  const addDriver = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !drivers.includes(trimmed)) {
      setDrivers((prev) => [...prev, trimmed]);
    }
    setDriverInput("");
  };

  const removeDriver = (index: number) => {
    setDrivers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const finalDrivers = driverInput.trim()
      ? [...drivers, driverInput.trim()]
      : drivers;
    if (finalDrivers.length === 0) return;
    setAccepting(true);
    try {
      if (isPending && onAccept) {
        await onAccept(session, finalDrivers);
      } else if (
        onUpdateDriverName &&
        JSON.stringify(finalDrivers) !== JSON.stringify(existingDrivers)
      ) {
        await onUpdateDriverName(session, finalDrivers);
      }
      setDrivers(finalDrivers);
      setDriverInput("");
    } finally {
      setAccepting(false);
      setIsFocused(false);
    }
  };

  const handleCancel = () => {
    setDrivers(existingDrivers);
    setDriverInput("");
    setIsFocused(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative w-[95vw] max-w-lg bg-surface rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10 max-h-[80vh]">
        {/* Scrollable Content */}
        <div className="overflow-y-auto hide-scrollbar max-h-[80vh] rounded-3xl">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-surface rounded-t-3xl px-4 md:px-8 pt-4 md:pt-8 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                  {isPending ? "Incoming Session Invitation" : "Session Details"}
                </p>
                <span className="text-sm font-black text-primary uppercase tracking-widest font-mono">
                  #{session.id.slice(0, 4).toUpperCase()}
                </span>
                <h2 className="text-2xl font-black">{session.delivery.contactName || restaurantName}</h2>
              </div>
              <button
                onClick={onBack ?? onClose}
                className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center hover:text-primary transition-colors border border-border-subtle shrink-0"
              >
                {onBack ? <ChevronLeft size={18} /> : <X size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-6 px-4 md:px-8 pb-4 md:pb-8 pt-2">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <CompactInfo
              icon={<Clock size={16} />}
              label="Event Time"
              value={time}
              color="text-status-blue"
              subtitle={date || undefined}
            />
            <CompactInfo
              icon={<Package size={18} />}
              label="Portions"
              value={portionCount.toString()}
              color="text-primary"
            />
            <CompactInfo
              icon={<Store size={16} />}
              label="Pickups"
              value={pickupCount.toString()}
              color="text-amber-500"
            />
          </div>

          {/* Driver Assignment */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-30">
                {isPending ? "Driver Assignment" : "Assigned Driver"}
              </p>
              {isPending ? (
                <div className="flex items-center gap-1.5 text-amber-500">
                  <UserPlus size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest italic">
                    Unassigned
                  </span>
                </div>
              ) : (
                deliveryStatus && (
                  <span className="px-2 py-0.5 rounded bg-status-blue/10 text-status-blue text-[8px] font-black uppercase tracking-widest border border-status-blue/20">
                    {deliveryStatus.replace(/_/g, " ")}
                  </span>
                )
              )}
            </div>

            {readOnly ? (
              <div className="bg-surface-variant border border-border-subtle rounded-xl p-2.5">
                {existingDrivers.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {existingDrivers.map((name, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px] font-black"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] font-black opacity-40">
                    No driver assigned
                  </span>
                )}
              </div>
            ) : (
            <div ref={driverRef} className="relative">
              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => setIsFocused(true)}
                  className={`flex-1 min-w-0 bg-surface-variant border p-2.5 text-left transition-all ${
                    isFocused
                      ? "border-primary ring-2 ring-primary/10 rounded-t-xl rounded-b-none"
                      : "border-border-subtle rounded-xl"
                  } relative`}
                >
                  {drivers.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {drivers.map((name, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px] font-black"
                        >
                          {name}
                          {isFocused && (
                            <span
                              role="button"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                removeDriver(i);
                              }}
                              className="hover:text-status-red transition-colors cursor-pointer"
                            >
                              <X size={10} strokeWidth={3} />
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] font-black opacity-40">
                      {isPending ? "Assign Driver..." : "Change driver..."}
                    </span>
                  )}
                </button>
                {hasChanges && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={accepting}
                    className="w-10 shrink-0 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {accepting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} strokeWidth={3} />
                    )}
                  </button>
                )}
              </div>

              {isFocused && (
                <div className="absolute top-full left-0 right-0 bg-surface border border-border-subtle border-t-0 rounded-b-xl shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-200 overflow-hidden p-3 space-y-3">
                  <input
                    type="text"
                    autoFocus
                    placeholder={drivers.length === 0 ? "Enter driver name..." : "Add another driver..."}
                    value={driverInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes(",")) {
                        val.split(",").forEach((part) => {
                          if (part.trim()) addDriver(part);
                        });
                        return;
                      }
                      setDriverInput(val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (driverInput.trim()) addDriver(driverInput);
                      }
                      if (e.key === "Backspace" && !driverInput && drivers.length > 0) {
                        removeDriver(drivers.length - 1);
                      }
                      if (e.key === "Escape") handleCancel();
                    }}
                    className="w-full bg-surface-variant border border-border-subtle rounded-lg p-2 text-[10px] font-black outline-none focus:border-primary transition-colors"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-2.5 rounded-lg bg-surface-variant border border-border-subtle text-[9px] font-black uppercase tracking-widest hover:text-status-red transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (driverInput.trim()) addDriver(driverInput);
                      }}
                      disabled={!driverInput.trim()}
                      className="flex-1 py-2.5 rounded-lg bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 disabled:opacity-30 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                    >
                      <Check size={12} strokeWidth={3} />
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>

          {/* Pickup Addresses */}
          {session.restaurants.length > 0 && (
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-3 px-1">
                Pickup Locations ({session.restaurants.length})
              </p>
              <div className="space-y-2">
                {session.restaurants.map((restaurant) => (
                  <div
                    key={restaurant.restaurantId}
                    className="flex items-start gap-2.5 bg-surface-variant p-3 rounded-xl border border-border-subtle"
                  >
                    <div className="w-7 h-7 shrink-0 rounded-lg bg-surface flex items-center justify-center text-primary border border-border-subtle mt-0.5">
                      <Store size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest truncate">
                          {restaurant.restaurantName}
                        </p>
                        {restaurant.collectionTime && (
                          <div className="flex items-center gap-1 shrink-0 text-status-blue">
                            <Clock size={10} />
                            <span className="text-[9px] font-black uppercase tracking-wider">
                              {formatTime(restaurant.collectionTime)}
                            </span>
                          </div>
                        )}
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.address.addressLine1}${restaurant.address.addressLine2 ? `, ${restaurant.address.addressLine2}` : ""}, ${restaurant.address.city} ${restaurant.address.postcode}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:opacity-80 transition-opacity"
                      >
                        <p className="text-[9px] font-bold opacity-50 uppercase tracking-wider underline decoration-dotted underline-offset-2">
                          {restaurant.address.addressLine1}
                          {restaurant.address.addressLine2 ? `, ${restaurant.address.addressLine2}` : ""}
                        </p>
                        <p className="text-[9px] font-bold opacity-50 uppercase tracking-wider underline decoration-dotted underline-offset-2">
                          {restaurant.address.city}, {restaurant.address.postcode}
                        </p>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dropoff Address */}
          {dropoffAddress && (
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-3 px-1">
                Delivery Destination
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dropoffAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-surface-variant p-3 rounded-xl border border-border-subtle hover:opacity-80 transition-opacity"
              >
                <div className="w-7 h-7 shrink-0 rounded-lg bg-surface flex items-center justify-center text-primary border border-border-subtle">
                  <MapPin size={14} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest truncate min-w-0 underline decoration-dotted underline-offset-2">
                  {dropoffAddress}
                </p>
              </a>
            </div>
          )}

          {/* Map */}
          {mapPins.length > 0 && (
            <div>
              <GoogleMap
                pins={mapPins}
                className="aspect-[4/3] border border-border-subtle"
              />
              <div className="flex items-center gap-4 mt-2 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">
                    Pickup
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">
                    Dropoff
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pending: Reject button */}
          {isPending && !readOnly && (
            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl bg-surface-variant border border-border-subtle font-bold text-xs uppercase tracking-widest hover:bg-status-red/5 hover:text-status-red hover:border-status-red/20 transition-all"
            >
              Reject
            </button>
          )}
          </div>
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
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-surface-variant p-4 rounded-2xl border border-border-subtle">
      <div className={`flex items-center gap-2 mb-1 ${color}`}>
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest opacity-50 text-text-muted">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold font-mont">{value}</p>
      {subtitle && (
        <p className="text-[10px] font-bold opacity-50 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
