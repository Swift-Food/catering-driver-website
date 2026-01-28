"use client";

import { useEffect, useState } from "react";
import { User, Loader2, AlertCircle, Map as MapIcon } from "lucide-react";
import { cateringDriverApi, useDriver } from "@/lib/drivers";
import type { MealSession } from "@/lib/drivers/types";

export default function DeliveryPage() {
  const {
    selectedDriverName,
    setSelectedDriverName,
    clearSelectedDriver,
    isLoading: driverLoading,
  } = useDriver();
  const [driverNames, setDriverNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<MealSession[]>([]);

  useEffect(() => {
    if (!selectedDriverName) {
      setAssignments([]);
      return;
    }

    const fetchAssignments = async () => {
      try {
        const data = await cateringDriverApi.getMyAssignments(selectedDriverName);
        setAssignments(data);
      } catch (err) {
        console.error("Error fetching assignments:", err);
      }
    };

    fetchAssignments();
  }, [selectedDriverName]);

  useEffect(() => {
    const fetchDriverNames = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await cateringDriverApi.getActiveDriverNames();
        setDriverNames(data);
      } catch (err) {
        setError("Failed to load available drivers. Please try again.");
        console.error("Error fetching drivers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch drivers if no driver is selected
    if (!selectedDriverName) {
      fetchDriverNames();
    } else {
      setIsLoading(false);
    }
  }, [selectedDriverName]);

  const handleDriverSelect = (name: string) => {
    setSelectedDriverName(name);
  };

  // Show loading while checking for persisted driver
  if (driverLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
          <Loader2 size={40} className="animate-spin" />
        </div>
        <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-gray-100">
          Loading
        </h2>
        <p className="text-sm text-text-muted max-w-sm">
          Please wait...
        </p>
      </div>
    );
  }

  // Show routes view when driver is selected
  if (selectedDriverName) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
          <MapIcon size={40} />
        </div>
        <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-gray-100">
          Routes
        </h2>
        <p className="text-sm text-text-muted mb-8 max-w-sm">
          Route details for{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {selectedDriverName}
          </span>{" "}
          will appear here.
        </p>
        <button
          onClick={clearSelectedDriver}
          className="text-[10px] text-primary font-bold hover:underline"
        >
          Switch Driver
        </button>
      </div>
    );
  }

  // Loading drivers
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

  // Error loading drivers
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

  // No drivers available
  if (driverNames.length === 0) {
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

  // Driver selection view
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
        <User size={40} />
      </div>
      <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-gray-100">
        Identify Driver
      </h2>
      <p className="text-sm text-text-muted mb-8 max-w-sm">
        Please select your driver profile to access active route task lists and
        verification tools.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-4xl">
        {driverNames.map((name) => (
          <button
            key={name}
            onClick={() => handleDriverSelect(name)}
            className="p-4 bg-surface border border-border-subtle rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-all shadow-sm truncate"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
