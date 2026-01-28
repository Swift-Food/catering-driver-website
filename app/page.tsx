"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cateringDriverApi } from "@/lib/drivers";
import type { MealSession } from "@/lib/drivers/types";
import MetricBox from "@/components/dashboard/MetricBox";
import SessionCard from "@/components/dashboard/SessionCard";
import SessionDetailModal from "@/components/dashboard/SessionDetailModal";

export default function HomePage() {
  const [availableSessions, setAvailableSessions] = useState<MealSession[]>([]);
  const [assignedSessions, setAssignedSessions] = useState<MealSession[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [errorAvailable, setErrorAvailable] = useState<string | null>(null);
  const [errorAssigned, setErrorAssigned] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<MealSession | null>(
    null
  );

  const fetchAvailable = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      setErrorAvailable(null);
      const data = await cateringDriverApi.getAvailableSessions();
      console.log("Pending:", data);
      setAvailableSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch available sessions:", err);
      setErrorAvailable("Failed to load sessions");
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  const fetchAssigned = useCallback(async () => {
    try {
      setLoadingAssigned(true);
      setErrorAssigned(null);
      const data = await cateringDriverApi.getAssignedSessions();
      console.log("Upcoming:", data);
      setAssignedSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch assigned sessions:", err);
      setErrorAssigned("Failed to load assigned sessions");
    } finally {
      setLoadingAssigned(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailable();
    fetchAssigned();
  }, [fetchAvailable, fetchAssigned]);

  const handleAccept = async (mealSessionId: string, driverName: string) => {
    await cateringDriverApi.acceptMealSession(mealSessionId, { driverName });
    fetchAvailable();
    fetchAssigned();
  };

  const handleUpdateDriverName = async (
    mealSessionId: string,
    driverName: string
  ) => {
    await cateringDriverApi.updateDriverName(mealSessionId, { driverName });
    fetchAssigned();
  };

  const handleAcceptFromModal = async (
    session: MealSession,
    driverName: string
  ) => {
    await cateringDriverApi.acceptMealSession(session.id, { driverName });
    setSelectedSession(null);
    fetchAvailable();
    fetchAssigned();
  };

  const pendingCount = 3;
  const activeCount = 1;
  const completedCount = 12;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Stats Section */}
      <div className="bg-surface p-8 rounded-3xl shadow-lg border border-border-subtle relative overflow-hidden group">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl text-primary border border-primary/20">
                <Activity size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">
                  Analytics
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40">
                  Delivery Overview
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <MetricBox
              label="Pending"
              value={pendingCount.toString().padStart(2, "0")}
              icon={<Clock size={16} />}
              color="text-amber-500"
              bg="bg-amber-500/5 dark:bg-amber-500/10"
            />
            <MetricBox
              label="Active"
              value={activeCount.toString().padStart(2, "0")}
              icon={<TrendingUp size={16} />}
              color="text-primary"
              bg="bg-primary/5 dark:bg-primary/10"
            />
            <MetricBox
              label="Completed"
              value={completedCount.toString().padStart(2, "0")}
              icon={<CheckCircle2 size={16} />}
              color="text-status-green"
              bg="bg-status-green/5 dark:bg-status-green/10"
            />
          </div>
        </div>
      </div>

      {/* Available Sessions (Pending) Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black">Pending Assignment</h2>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
              Requires Driver
            </span>
          </div>
          {!loadingAvailable && (
            <span className="text-xs font-bold opacity-40 uppercase tracking-widest">
              {availableSessions.length} Available
            </span>
          )}
        </div>

        {loadingAvailable ? (
          <div className="py-16 text-center bg-surface rounded-3xl border border-border-subtle">
            <Loader2
              size={32}
              className="mx-auto mb-4 animate-spin text-primary"
            />
            <p className="font-bold text-sm uppercase tracking-widest opacity-40">
              Loading sessions...
            </p>
          </div>
        ) : errorAvailable ? (
          <div className="py-12 text-center bg-surface rounded-3xl border border-border-subtle">
            <AlertCircle
              size={48}
              className="mx-auto mb-4 text-status-red opacity-60"
            />
            <p className="font-bold text-sm uppercase tracking-widest opacity-40">
              {errorAvailable}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSessions.length > 0 ? (
              availableSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => setSelectedSession(session)}
                  onDriverSubmit={handleAccept}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center opacity-30 bg-surface rounded-3xl border border-border-subtle">
                <AlertCircle size={48} className="mx-auto mb-4" />
                <p className="font-bold text-sm uppercase tracking-widest">
                  Clear Queue: All tasks assigned
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Logistics (Assigned) Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Upcoming Logistics</h2>
          {!loadingAssigned && (
            <span className="text-xs font-bold opacity-40 uppercase tracking-widest">
              {assignedSessions.length} Dispatched
            </span>
          )}
        </div>

        {loadingAssigned ? (
          <div className="py-16 text-center bg-surface rounded-3xl border border-border-subtle">
            <Loader2
              size={32}
              className="mx-auto mb-4 animate-spin text-primary"
            />
            <p className="font-bold text-sm uppercase tracking-widest opacity-40">
              Loading assignments...
            </p>
          </div>
        ) : errorAssigned ? (
          <div className="py-12 text-center bg-surface rounded-3xl border border-border-subtle">
            <AlertCircle
              size={48}
              className="mx-auto mb-4 text-status-red opacity-60"
            />
            <p className="font-bold text-sm uppercase tracking-widest opacity-40">
              {errorAssigned}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedSessions.length > 0 ? (
              assignedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => setSelectedSession(session)}
                  onDriverSubmit={handleUpdateDriverName}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center opacity-30 border-2 border-dashed border-border-subtle rounded-3xl">
                <p className="font-bold text-sm uppercase tracking-widest">
                  No scheduled departures
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onAccept={handleAcceptFromModal}
      />
    </div>
  );
}
