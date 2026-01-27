"use client";

import { useSearchParams } from "next/navigation";
import { Map as MapIcon } from "lucide-react";

export default function DriverRoutesPage() {
  const searchParams = useSearchParams();
  const driverId = searchParams.get("driverId");

  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
        <MapIcon size={40} />
      </div>
      <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-gray-100">
        Driver Routes
      </h2>
      <p className="text-sm text-text-muted max-w-sm">
        Route details for driver will appear here.
      </p>
      {driverId && (
        <div className="mt-6 px-4 py-2 bg-surface-variant rounded-lg">
          <p className="text-xs text-text-muted">
            Driver ID: <span className="font-mono font-bold">{driverId}</span>
          </p>
        </div>
      )}
    </div>
  );
}
