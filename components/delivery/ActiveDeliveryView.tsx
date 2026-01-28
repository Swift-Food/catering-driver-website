"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  MealSession,
  PricingOrderItemDto,
} from "@/lib/drivers/types";
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
  session: MealSession;
  onSessionUpdate: (session: MealSession) => void;
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

  // Determine active stop
  const activeId =
    expandedStopId ||
    (allPickupsCompleted
      ? stops.find((s) => s.type === "DROPOFF" && !s.completed)?.id
      : pickupStops.find((s) => !s.completed)?.id);

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
            // All pickups done, call API
            const updated = await cateringDriverApi.pickupComplete(session.id, {
              driverId: session.driverId || "",
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
            driverId: session.driverId || "",
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
      session.driverId,
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

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <TabSwitcher viewMode={viewMode} onChangeViewMode={setViewMode} />

          {viewMode === "TIMELINE" ? (
            <div className="bg-surface rounded-2xl p-6 shadow-lg border border-border-subtle relative">
              <div className="space-y-4">
                {stops.map((stop, index) => {
                  const isSelectable =
                    !stop.completed &&
                    (stop.type === "PICKUP" || allPickupsCompleted);

                  return (
                    <StopTimelineItem
                      key={stop.id}
                      stop={stop}
                      index={index}
                      isExpanded={activeId === stop.id}
                      isSelectable={isSelectable}
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
          )}
        </div>

        <DeliverySidebar
          session={session}
          totalStops={stops.length}
          remainingStops={stops.filter((s) => !s.completed).length}
        />
      </div>
    </div>
  );
}

// ---- Helpers ----

function deriveStops(
  session: MealSession,
  locallyCompleted: Set<string>
): DeliveryStop[] {
  const pickupsDone = PICKUP_DONE_STATUSES.includes(session.deliveryStatus);
  const deliveryDone = session.deliveryStatus === "delivered";

  // Deduplicate restaurants by ID
  const restaurantMap = new Map<string, PricingOrderItemDto>();
  for (const item of session.orderItems) {
    if (!restaurantMap.has(item.restaurantId)) {
      restaurantMap.set(item.restaurantId, item);
    }
  }

  const pickupStops: DeliveryStop[] = Array.from(
    restaurantMap.entries()
  ).map(([restaurantId, item]) => {
    const addr = session.restaurantPickupAddresses?.[restaurantId];
    const collectionTime =
      session.restaurantCollectionTimes?.[restaurantId] ||
      item.collectionTime ||
      session.collectionTime;

    return {
      id: restaurantId,
      type: "PICKUP",
      locationName: item.restaurantName,
      address: addr
        ? `${addr.addressLine1}${addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, ${addr.city} ${addr.zipcode}`
        : "",
      time: formatTime(collectionTime),
      contactName: session.cateringOrder?.pickupContactName,
      contactPhone: session.cateringOrder?.pickupContactPhone,
      completed: pickupsDone || locallyCompleted.has(restaurantId),
      prepStatus: item.reminderConfirmed ? "READY" : "PREPARING",
    };
  });

  const dropoffStop: DeliveryStop = {
    id: "dropoff",
    type: "DROPOFF",
    locationName: session.cateringOrder?.deliveryAddress || "Delivery Destination",
    address: session.cateringOrder?.deliveryAddress || "",
    time: formatTime(session.eventTime),
    contactName: session.cateringOrder?.customerName,
    contactPhone: session.cateringOrder?.customerPhone,
    completed: deliveryDone,
  };

  return [...pickupStops, dropoffStop];
}

function deriveMapPins(session: MealSession): MapPin[] {
  const pins: MapPin[] = [];

  const pickupAddresses = session.restaurantPickupAddresses;
  if (pickupAddresses) {
    for (const [, addr] of Object.entries(pickupAddresses)) {
      pins.push({
        latitude: addr.location.latitude,
        longitude: addr.location.longitude,
        label: addr.name,
        address: `${addr.addressLine1}, ${addr.city}`,
        color: "pink",
      });
    }
  }

  const dropoffLocation = session.cateringOrder?.deliveryLocation;
  if (dropoffLocation) {
    pins.push({
      latitude: dropoffLocation.latitude,
      longitude: dropoffLocation.longitude,
      label: "Delivery",
      address: session.cateringOrder?.deliveryAddress || "",
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
