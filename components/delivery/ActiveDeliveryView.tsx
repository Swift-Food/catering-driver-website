"use client";

import { useState, useMemo, useCallback } from "react";
import type { DriverMealSessionDto } from "@/lib/drivers/types";
import { cateringDriverApi } from "@/lib/drivers";
import type { DeliveryStop } from "./types";
import type { ViewMode } from "./TabSwitcher";
import type { MapPin } from "@/components/dashboard/GoogleMap";
import DeliveryHeaderPanel from "./DeliveryHeaderPanel";
import TabSwitcher from "./TabSwitcher";
import StopTimelineItem from "./StopTimelineItem";
import DeliverySidebar from "./DeliverySidebar";
import GoogleMap from "@/components/dashboard/GoogleMap";

interface ActiveDeliveryViewProps {
  session: DriverMealSessionDto;
  onSessionUpdate: (session: DriverMealSessionDto) => void;
}

const PICKUP_DONE_STATUSES = [
  "out_for_delivery",
  "at_collection_point",
  "delivered",
];

export default function ActiveDeliveryView({
  session,
  onSessionUpdate,
}: ActiveDeliveryViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("TIMELINE");
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);
  const [locallyCompleted, setLocallyCompleted] = useState<Set<string>>(
    new Set()
  );
  const [stopPhotos, setStopPhotos] = useState<Record<string, string>>({});
  const [uploadingStopId, setUploadingStopId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Derive stops from session data
  const stops = useMemo(() => deriveStops(session, locallyCompleted), [
    session,
    locallyCompleted,
  ]);

  const pickupStops = stops.filter((s) => s.type === "PICKUP");
  const allPickupsCompleted = pickupStops.every((s) => s.completed);

  const deliveryStarted =
    session.deliveryStatus !== "pending" &&
    session.deliveryStatus !== "finding_driver" &&
    session.deliveryStatus !== "driver_assigned";

  // Determine active stop
  const activeId = deliveryStarted
    ? expandedStopId ||
      (allPickupsCompleted
        ? stops.find((s) => s.type === "DROPOFF" && !s.completed)?.id
        : pickupStops.find((s) => !s.completed)?.id)
    : null;

  // Map pins
  const mapPins = useMemo(() => deriveMapPins(session), [session]);

  const handleStartDelivery = useCallback(async () => {
    const updated = await cateringDriverApi.startDelivery(session.id);
    onSessionUpdate(updated);
  }, [session.id, onSessionUpdate]);

  const handlePhotoSelected = useCallback(
    async (stopId: string, file: File) => {
      setUploadingStopId(stopId);
      try {
        const url = await cateringDriverApi.uploadImage(file);
        setStopPhotos((prev) => ({ ...prev, [stopId]: url }));
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploadingStopId(null);
      }
    },
    []
  );

  const handleCompleteStop = useCallback(
    async (stop: DeliveryStop) => {
      const photoUrl = stopPhotos[stop.id];
      if (!photoUrl) return;

      setIsCompleting(true);
      try {
        if (stop.type === "PICKUP") {
          // Mark locally completed
          const newCompleted = new Set(locallyCompleted);
          newCompleted.add(stop.id);
          setLocallyCompleted(newCompleted);

          // Check if all pickups are now done locally
          const allPickupIds = pickupStops.map((s) => s.id);
          const allDone = allPickupIds.every(
            (id) => id === stop.id || locallyCompleted.has(id)
          );

          if (allDone) {
            // All pickups done — auto-expand the dropoff stop
            setExpandedStopId("dropoff");

            // Call API
            const updated = await cateringDriverApi.pickupComplete(session.id, {
              driverId: "",
              pickupProofImageUrl: photoUrl,
            });
            onSessionUpdate(updated);
          }
        } else {
          // Dropoff - call arrive then delivery complete
          try {
            await cateringDriverApi.arriveAtDestination(session.id);
          } catch {
            // May already be at destination
          }
          const updated = await cateringDriverApi.deliveryComplete(session.id, {
            driverId: "",
            deliveryProofImageUrl: photoUrl,
          });
          onSessionUpdate(updated);
        }
      } catch (err) {
        console.error("Failed to complete stop:", err);
      } finally {
        setIsCompleting(false);
      }
    },
    [
      stopPhotos,
      locallyCompleted,
      pickupStops,
      session.id,
      onSessionUpdate,
    ]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <DeliveryHeaderPanel
        session={session}
        pickupCount={pickupStops.length}
        onStartDelivery={handleStartDelivery}
      />

      {/* Customer details - mobile only, right after header */}
      <div className="lg:hidden">
        <DeliverySidebar
          session={session}
          totalStops={stops.length}
          remainingStops={stops.filter((s) => !s.completed).length}
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <TabSwitcher viewMode={viewMode} onChangeViewMode={setViewMode} />

          {viewMode === "TIMELINE" ? (
            <div className="bg-surface rounded-2xl p-6 shadow-lg border border-border-subtle relative">
              <div className="space-y-4">
                {stops.map((stop, index) => {
                  const isSelectable =
                    deliveryStarted &&
                    !stop.completed &&
                    (stop.type === "PICKUP" || allPickupsCompleted);

                  return (
                    <StopTimelineItem
                      key={stop.id}
                      stop={stop}
                      index={index}
                      isExpanded={activeId === stop.id}
                      isSelectable={isSelectable}
                      isLocked={deliveryStarted && stop.type === "DROPOFF" && !allPickupsCompleted}
                      photoUrl={stopPhotos[stop.id]}
                      isUploading={uploadingStopId === stop.id}
                      onSelect={() => setExpandedStopId(stop.id)}
                      onPhotoSelected={(file) =>
                        handlePhotoSelected(stop.id, file)
                      }
                      onComplete={() => handleCompleteStop(stop)}
                      isCompleting={isCompleting}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-border-subtle shadow-inner">
                {mapPins.length > 0 ? (
                  <GoogleMap pins={mapPins} className="h-full" />
                ) : (
                  <div className="h-full w-full bg-surface-variant flex items-center justify-center">
                    <p className="text-text-muted text-sm font-bold">
                      No location data available
                    </p>
                  </div>
                )}
              </div>
              {mapPins.length > 0 && (
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
              )}
            </div>
          )}
        </div>

        {/* Customer details - desktop only, in sidebar */}
        <div className="hidden lg:block lg:col-span-4">
          <DeliverySidebar
            session={session}
            totalStops={stops.length}
            remainingStops={stops.filter((s) => !s.completed).length}
          />
        </div>
      </div>
    </div>
  );
}

// ---- Helpers ----

function deriveStops(
  session: DriverMealSessionDto,
  locallyCompleted: Set<string>
): DeliveryStop[] {
  const pickupsDone = PICKUP_DONE_STATUSES.includes(session.deliveryStatus);
  const deliveryDone = session.deliveryStatus === "delivered";

  const pickupStops: DeliveryStop[] = session.restaurants.map((restaurant) => {
    const addr = restaurant.address;

    return {
      id: restaurant.restaurantId,
      type: "PICKUP",
      locationName: restaurant.restaurantName,
      address: `${addr.addressLine1}${addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, ${addr.city} ${addr.postcode}`,
      time: formatTime(restaurant.collectionTime),
      contactName: restaurant.contact.phone ? undefined : session.delivery.contactName,
      contactPhone: restaurant.contact.phone || session.delivery.contactPhone,
      completed: pickupsDone || locallyCompleted.has(restaurant.restaurantId),
    };
  });

  const dropoffStop: DeliveryStop = {
    id: "dropoff",
    type: "DROPOFF",
    locationName: session.delivery.address || "Delivery Destination",
    address: session.delivery.address || "",
    time: formatTime(session.eventTime),
    contactName: session.delivery.contactName,
    contactPhone: session.delivery.contactPhone,
    completed: deliveryDone,
  };

  return [...pickupStops, dropoffStop];
}

function deriveMapPins(session: DriverMealSessionDto): MapPin[] {
  const pins: MapPin[] = [];

  for (const restaurant of session.restaurants) {
    if (restaurant.address.location) {
      pins.push({
        latitude: restaurant.address.location.latitude,
        longitude: restaurant.address.location.longitude,
        label: restaurant.restaurantName,
        address: `${restaurant.address.addressLine1}, ${restaurant.address.city}`,
        color: "pink",
      });
    }
  }

  const dropoffLocation = session.delivery.location;
  if (dropoffLocation) {
    pins.push({
      latitude: dropoffLocation.latitude,
      longitude: dropoffLocation.longitude,
      label: "Delivery",
      address: session.delivery.address || "",
      color: "green",
    });
  }

  return pins;
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
