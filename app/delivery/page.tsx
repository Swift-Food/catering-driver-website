"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Loader2, AlertCircle, Star, Truck } from "lucide-react";
import { driversApi, type DriverUser, CateringDeliveryMethod } from "@/lib/drivers";

const DELIVERY_METHOD_LABELS: Record<CateringDeliveryMethod, string> = {
  [CateringDeliveryMethod.E_BIKE]: "E-Bike",
  [CateringDeliveryMethod.E_BIKE_TRAILER]: "E-Bike + Trailer",
  [CateringDeliveryMethod.UBER]: "Uber",
  [CateringDeliveryMethod.MINI_VAN]: "Mini Van",
  [CateringDeliveryMethod.TRUCK]: "Truck",
};

export default function DeliveryPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await driversApi.getAvailableDrivers();
        setDrivers(data);
      } catch (err) {
        setError("Failed to load available drivers. Please try again.");
        console.error("Error fetching drivers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleDriverSelect = (driverId: string) => {
    router.push(`/delivery/routes?driverId=${driverId}`);
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
          <Loader2 size={40} className="animate-spin" />
        </div>
        <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-gray-100">
          Loading Drivers
        </h2>
        <p className="text-sm text-text-muted max-w-sm">
          Fetching available drivers...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-status-red/10 rounded-2xl flex items-center justify-center text-status-red mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-gray-100">
          Error Loading Drivers
        </h2>
        <p className="text-sm text-text-muted mb-8 max-w-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
          <User size={40} />
        </div>
        <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-gray-100">
          No Available Drivers
        </h2>
        <p className="text-sm text-text-muted max-w-sm">
          There are no drivers available at the moment. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
        <User size={40} />
      </div>
      <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-gray-100">
        Select Driver
      </h2>
      <p className="text-sm text-text-muted mb-8 max-w-sm">
        Please select a driver profile to view their active route task lists and
        verification tools.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-4xl">
        {drivers.map((driver) => (
          <button
            key={driver.id}
            onClick={() => handleDriverSelect(driver.id)}
            className="p-4 bg-surface border border-border-subtle rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-all shadow-sm text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              {driver.user.profilePicture ? (
                <img
                  src={driver.user.profilePicture}
                  alt={driver.user.username || driver.user.email}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                  {driver.user.username || driver.user.email.split("@")[0]}
                </p>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs">
                    {Number(driver.cateringRating).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
            {driver.cateringDeliveryMethods &&
              driver.cateringDeliveryMethods.length > 0 && (
                <div className="flex items-center gap-1 text-text-muted text-xs">
                  <Truck size={12} />
                  <span className="truncate">
                    {driver.cateringDeliveryMethods
                      .map((m) => DELIVERY_METHOD_LABELS[m])
                      .join(", ")}
                  </span>
                </div>
              )}
          </button>
        ))}
      </div>
    </div>
  );
}
