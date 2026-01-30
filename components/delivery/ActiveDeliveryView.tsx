"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { DriverMealSessionDto } from "@/lib/drivers/types";
import { cateringDriverApi } from "@/lib/drivers";
import type { DeliveryStop, ChecklistItem } from "./types";
import type { ViewMode } from "./TabSwitcher";
import type { MapPin } from "@/components/dashboard/GoogleMap";
import DeliveryHeaderPanel from "./DeliveryHeaderPanel";
import TabSwitcher from "./TabSwitcher";
import StopTimelineItem from "./StopTimelineItem";
import DeliverySidebar, { ContactSwiftCard } from "./DeliverySidebar";
import GoogleMap from "@/components/dashboard/GoogleMap";
import { formatTime } from "@/lib/formatters";
import { useDriver } from "@/lib/drivers/driverContext";

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
  const { selectedDriverName, setHasPendingPhotos } = useDriver();
  const [viewMode, setViewMode] = useState<ViewMode>("TIMELINE");
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);
  const [locallyCompleted, setLocallyCompleted] = useState<Set<string>>(
    new Set()
  );
  const [stopPhotos, setStopPhotos] = useState<Record<string, string>>({});
  const [uploadingStopId, setUploadingStopId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [itemsConfirmedStops, setItemsConfirmedStops] = useState<Set<string>>(new Set());

  // Update pending photos flag when stopPhotos changes
  useEffect(() => {
    setHasPendingPhotos(Object.keys(stopPhotos).length > 0);
  }, [stopPhotos, setHasPendingPhotos]);

  const handleStartDelivery = useCallback(async () => {
    const updated = await cateringDriverApi.startDelivery(session.id);
    onSessionUpdate(updated);
  }, [session.id, onSessionUpdate]);

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

  const handlePhotoSelected = useCallback(
    async (stopId: string, file: File) => {
      setUploadingStopId(stopId);
      setUploadError(null);
      try {
        const url = await cateringDriverApi.uploadImage(file);
        setStopPhotos((prev) => ({ ...prev, [stopId]: url }));
      } catch (err) {
        console.error("Upload failed:", err);
        setUploadError("Photo upload failed. Please try again.");
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
        const driverName = selectedDriverName || session.driverNames?.[0] || "Driver";

        if (stop.type === "PICKUP") {
          // Collect individual restaurant
          const updated = await cateringDriverApi.collectRestaurant(session.id, {
            restaurantId: stop.id,
            pickupProofImageUrl: photoUrl,
            collectedBy: driverName,
          });
          onSessionUpdate(updated);

          // Clear the photo from pending state
          setStopPhotos((prev) => {
            const next = { ...prev };
            delete next[stop.id];
            return next;
          });

          // Mark locally completed for optimistic UI
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
          }
        } else {
          // One confirmation = session delivered
          try {
            await cateringDriverApi.arriveAtDestination(session.id);
          } catch {
            // May already be at destination
          }
          const updated = await cateringDriverApi.confirmDriverDelivery(session.id, {
            deliveryProofImageUrl: photoUrl,
            driverName,
          });
          onSessionUpdate(updated);

          // Clear the photo from pending state
          setStopPhotos((prev) => {
            const next = { ...prev };
            delete next[stop.id];
            return next;
          });
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

      {/* Customer details & route progress - mobile only, at top */}
      <div className="lg:hidden">
        <DeliverySidebar
          session={session}
          totalStops={stops.length}
          remainingStops={stops.filter((s) => !s.completed).length}
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <TabSwitcher viewMode={viewMode} onChangeViewMode={setViewMode} />

          {viewMode === "TIMELINE" ? (
            <div className="bg-surface rounded-2xl p-6 border border-border-subtle relative">
              {uploadError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                  {uploadError}
                </div>
              )}
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
                      itemsConfirmed={itemsConfirmedStops.has(stop.id)}
                      onItemsConfirmedChange={(confirmed) => {
                        setItemsConfirmedStops((prev) => {
                          const next = new Set(prev);
                          if (confirmed) next.add(stop.id);
                          else next.delete(stop.id);
                          return next;
                        });
                      }}
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

        {/* Customer details, route progress & contact - desktop sidebar */}
        <div className="hidden lg:block lg:col-span-2 space-y-6">
          <DeliverySidebar
            session={session}
            totalStops={stops.length}
            remainingStops={stops.filter((s) => !s.completed).length}
          />
          <ContactSwiftCard />
        </div>
      </div>

      {/* Contact Swift - mobile only, at bottom */}
      <div className="lg:hidden">
        <ContactSwiftCard />
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

  const pickupStops: DeliveryStop[] = session.restaurants
    .slice()
    .sort((a, b) => {
      const ta = a.collectionTime ? new Date(a.collectionTime).getTime() : 0;
      const tb = b.collectionTime ? new Date(b.collectionTime).getTime() : 0;
      return ta - tb;
    })
    .map((restaurant) => {
      const addr = restaurant.address;

      // Derive checklist items from orderItems matching this restaurant
      const orderItem = session.orderItems?.find(
        (oi) => oi.restaurantId === restaurant.restaurantId
      );
      const items: ChecklistItem[] | undefined = orderItem?.menuItems?.map((mi) => ({
        id: mi.menuItemId,
        label: mi.menuItemName,
        quantity: mi.quantity,
      }));

      return {
        id: restaurant.restaurantId,
        type: "PICKUP",
        locationName: restaurant.restaurantName,
        address: `${addr.addressLine1}${addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, ${addr.city} ${addr.postcode}`,
        time: formatTime(restaurant.collectionTime),
        contactName: restaurant.contact.phone ? undefined : session.delivery.contactName,
        contactPhone: restaurant.contact.phone || session.delivery.contactPhone,
        completed: pickupsDone || locallyCompleted.has(restaurant.restaurantId),
        items: items && items.length > 0 ? items : undefined,
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

