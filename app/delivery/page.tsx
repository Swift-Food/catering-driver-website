"use client";

import { useEffect, useState, useCallback } from "react";
import {
  User,
  Loader2,
  AlertCircle,
  Map as MapIcon,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { cateringDriverApi, useDriver } from "@/lib/drivers";
import { useAuth } from "@/lib/auth";
import type { DriverMealSessionDto } from "@/lib/drivers/types";
import ActiveDeliveryView from "@/components/delivery/ActiveDeliveryView";
import SessionCalendarModal from "@/components/delivery/SessionCalendarModal";
import DeliveryCompleteModal from "@/components/ui/DeliveryCompleteModal";
import {
  getSessionDateLabel,
  getSessionTimeRange,
} from "@/components/delivery/sessionUtils";

export default function DeliveryPage() {
  const { isAuthenticated } = useAuth();
  const {
    selectedDriverName,
    setSelectedDriverName,
    clearSelectedDriver,
    isLoading: driverLoading,
  } = useDriver();
  const [driverNames, setDriverNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<DriverMealSessionDto[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [driverAssignmentCounts, setDriverAssignmentCounts] = useState<
    Record<string, number>
  >({});

  // Fetch assignments when driver is selected
  useEffect(() => {
    if (!isAuthenticated || !selectedDriverName) {
      setAssignments([]);
      setSelectedSessionId(null);
      return;
    }

    let stale = false;

    const fetchAssignments = async () => {
      try {
        setAssignmentsLoading(true);
        setAssignmentsError(null);
        const data =
          await cateringDriverApi.getMyAssignments(selectedDriverName);
        if (stale) return;
        const sessions = data ?? [];
        setAssignments(sessions);
        if (sessions.length > 0) {
          setSelectedSessionId(sessions[0].id);
        }
      } catch (err) {
        if (stale) return;
        setAssignmentsError("Failed to load assignments. Please try again.");
        console.error("Error fetching assignments:", err);
      } finally {
        if (!stale) setAssignmentsLoading(false);
      }
    };

    fetchAssignments();
    return () => { stale = true; };
  }, [isAuthenticated, selectedDriverName]);

  // Fetch driver names and assignment counts once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    let stale = false;

    const fetchDriverData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [names, sessions] = await Promise.all([
          cateringDriverApi.getActiveDriverNames(),
          cateringDriverApi.getAssignedSessions(),
        ]);
        if (stale) return;
        setDriverNames(names ?? []);

        // Count assignments per driver name
        const counts: Record<string, number> = {};
        for (const session of sessions ?? []) {
          for (const name of session.driverNames ?? []) {
            counts[name] = (counts[name] || 0) + 1;
          }
        }
        setDriverAssignmentCounts(counts);

        if (selectedDriverName && !(names ?? []).includes(selectedDriverName)) {
          clearSelectedDriver();
        }
      } catch (err) {
        if (stale) return;
        setError("Failed to load available drivers. Please try again.");
        console.error("Error fetching drivers:", err);
      } finally {
        if (!stale) setIsLoading(false);
      }
    };

    fetchDriverData();
    return () => { stale = true; };
  }, [isAuthenticated]);

  const handleDriverSelect = (name: string) => {
    setSelectedDriverName(name);
  };

  const handleSessionUpdate = useCallback((updated: DriverMealSessionDto) => {
    setAssignments((prev) => {
      const previousSession = prev.find((s) => s.id === updated.id);
      // Check if the session just became delivered
      if (
        updated.deliveryStatus === "delivered" &&
        previousSession?.deliveryStatus !== "delivered"
      ) {
        // Show the completion modal
        setShowCompleteModal(true);
        // Remove the delivered session from the list
        const remaining = prev.filter((s) => s.id !== updated.id);
        // If there are remaining sessions, select the first one
        if (remaining.length > 0) {
          setSelectedSessionId(remaining[0].id);
        }
        return remaining;
      }
      return prev.map((s) => (s.id === updated.id ? updated : s));
    });
  }, []);

  const selectedSession = assignments.find((s) => s.id === selectedSessionId);

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
        <p className="text-sm text-text-muted max-w-sm">Please wait...</p>
      </div>
    );
  }

  // Show delivery view when driver is selected
  if (selectedDriverName) {
    // Loading assignments
    if (assignmentsLoading) {
      return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <Loader2 size={40} className="animate-spin" />
          </div>
          <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-gray-100">
            Loading Assignments
          </h2>
          <p className="text-sm text-text-muted max-w-sm">
            Fetching routes for {selectedDriverName}...
          </p>
        </div>
      );
    }

    // Error loading assignments
    if (assignmentsError) {
      return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-status-red/10 rounded-2xl flex items-center justify-center text-status-red mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-gray-100">
            Error Loading Assignments
          </h2>
          <p className="text-sm text-text-muted mb-8 max-w-sm">
            {assignmentsError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    // No assignments
    if (assignments.length === 0) {
      return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <MapIcon size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-gray-100">
            No Active Routes
          </h2>
          <p className="text-sm text-text-muted max-w-sm mb-8">
            No assignments found for{" "}
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {selectedDriverName}
            </span>
            . Check back when routes are assigned.
          </p>
          <button
            onClick={clearSelectedDriver}
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-surface border border-border-subtle text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
          >
            <RefreshCw size={12} />
            Switch Driver
          </button>
        </div>
      );
    }

    // Show delivery view
    return (
      <div className="space-y-6">
        {/* Driver indicator with switch */}
        <div className="flex items-center justify-between bg-surface rounded-xl border border-border-subtle px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <User size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40">
                Driver
              </p>
              <p className="text-sm font-bold">{selectedDriverName}</p>
            </div>
          </div>
          <button
            onClick={clearSelectedDriver}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-variant border border-border-subtle text-[9px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
          >
            <RefreshCw size={12} />
            Switch
          </button>
        </div>

        {/* Session selector */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">
              Your Delivery Sessions ({assignments.length})
            </p>
            <button
              onClick={() => setCalendarOpen(true)}
              className="w-7 h-7 rounded-lg bg-surface-variant border border-border-subtle flex items-center justify-center hover:border-primary hover:text-primary transition-all"
            >
              <Calendar size={14} />
            </button>
          </div>
          {assignments.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {assignments.map((s, i) => {
                const dateLabel = getSessionDateLabel(s);
                const timeRange = getSessionTimeRange(s);
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedSessionId === s.id
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-surface border-border-subtle hover:border-primary/20"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                        selectedSessionId === s.id
                          ? "bg-primary text-white"
                          : "bg-surface-variant"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="text-left">
                      <p className="leading-tight">
                        {s.sessionName || `Session ${i + 1}`} r34r34t3t
                      </p>
                      {(dateLabel || timeRange) && (
                        <p className="text-lg font-medium opacity-50 leading-tight mt-0.5">
                          {dateLabel && <span className="font-black opacity-100 text-text">{dateLabel}</span>}
                          {dateLabel && timeRange ? " · " : ""}
                          {timeRange}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {calendarOpen && (
          <SessionCalendarModal
            sessions={assignments}
            selectedSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
            onClose={() => setCalendarOpen(false)}
          />
        )}

        {selectedSession && (
          <ActiveDeliveryView
            key={selectedSession.id}
            session={selectedSession}
            onSessionUpdate={handleSessionUpdate}
          />
        )}

        <DeliveryCompleteModal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
        />
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
        Please select your driver profile to access delivery lists.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-4xl">
        {driverNames.map((name) => (
          <button
            key={name}
            onClick={() => handleDriverSelect(name)}
            className="relative overflow-visible p-4 bg-surface border border-border-subtle rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-all"
          >
            {driverAssignmentCounts[name] > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black">
                {driverAssignmentCounts[name]}
              </span>
            )}
            <span className="block truncate">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
