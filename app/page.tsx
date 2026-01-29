"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { cateringDriverApi } from "@/lib/drivers";
import type { DriverMealSessionDto, DeliveryAnalyticsDto } from "@/lib/drivers/types";
import MetricBox from "@/components/dashboard/MetricBox";
import SessionCard from "@/components/dashboard/SessionCard";
import SessionDetailModal from "@/components/dashboard/SessionDetailModal";
import SessionCalendarModal from "@/components/delivery/SessionCalendarModal";

export default function HomePage() {
  const [availableSessions, setAvailableSessions] = useState<DriverMealSessionDto[]>([]);
  const [assignedSessions, setAssignedSessions] = useState<DriverMealSessionDto[]>([]);
  const [analytics, setAnalytics] = useState<DeliveryAnalyticsDto | null>(null);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [errorAvailable, setErrorAvailable] = useState<string | null>(null);
  const [errorAssigned, setErrorAssigned] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<DriverMealSessionDto | null>(
    null
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [openedFromCalendar, setOpenedFromCalendar] = useState(false);
  const [calendarSelectedDay, setCalendarSelectedDay] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await cateringDriverApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  }, []);

  const fetchAvailable = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      setErrorAvailable(null);
      const data = await cateringDriverApi.getAvailableSessions();
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
      setAssignedSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch assigned sessions:", err);
      setErrorAssigned("Failed to load assigned sessions");
    } finally {
      setLoadingAssigned(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchAvailable();
    fetchAssigned();
  }, [fetchAnalytics, fetchAvailable, fetchAssigned]);

  const handleAccept = async (mealSessionId: string, driverName: string) => {
    await cateringDriverApi.acceptMealSession(mealSessionId, { driverName });
    fetchAnalytics();
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
    session: DriverMealSessionDto,
    driverName: string
  ) => {
    await cateringDriverApi.acceptMealSession(session.id, { driverName });
    setSelectedSession(null);
    fetchAnalytics();
    fetchAvailable();
    fetchAssigned();
  };

  const handleUpdateDriverNameFromModal = async (
    session: DriverMealSessionDto,
    driverName: string
  ) => {
    await cateringDriverApi.updateDriverName(session.id, { driverName });
    setSelectedSession(null);
    fetchAssigned();
  };

  const pendingCount = analytics?.pending ?? 0;
  const activeCount = analytics?.active ?? 0;
  const completedCount = analytics?.completed ?? 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Stats Section */}
      <div className="bg-surface p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-border-subtle relative overflow-hidden group">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 p-2 rounded-lg text-primary border border-primary/20">
                <Activity size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight">
                  Analytics
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40">
                  Delivery Overview
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-5">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  No Assignments Available: All tasks assigned
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Deliveries (Assigned) Section */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Upcoming Deliveries</h2>
            <div className="flex items-center gap-3">
              {!loadingAssigned && (
                <span className="text-xs font-bold opacity-40 uppercase tracking-widest hidden md:block">
                  {assignedSessions.length} Upcoming
                </span>
              )}
              {assignedSessions.length > 0 && (
                <button
                  onClick={() => setCalendarOpen(true)}
                  className="w-8 h-8 rounded-lg bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer"
                >
                  <Calendar size={16} />
                </button>
              )}
            </div>
          </div>
          {!loadingAssigned && (
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1 md:hidden">
              {assignedSessions.length} Upcoming
            </p>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Calendar Modal */}
      {calendarOpen && (
        <SessionCalendarModal
          sessions={assignedSessions}
          selectedSessionId={selectedSession?.id ?? null}
          initialSelectedDay={calendarSelectedDay}
          onSelectSession={(id) => {
            const session = assignedSessions.find((s) => s.id === id);
            if (session) {
              setSelectedSession(session);
              setOpenedFromCalendar(true);
              if (session.sessionDate) {
                const d = new Date(session.sessionDate);
                if (!isNaN(d.getTime())) {
                  setCalendarSelectedDay(
                    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                  );
                }
              }
            }
            setCalendarOpen(false);
          }}
          onClose={() => setCalendarOpen(false)}
        />
      )}

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => {
          setSelectedSession(null);
          setOpenedFromCalendar(false);
          setCalendarSelectedDay(null);
        }}
        onAccept={handleAcceptFromModal}
        onUpdateDriverName={handleUpdateDriverNameFromModal}
        onBack={
          openedFromCalendar
            ? () => {
                setSelectedSession(null);
                setCalendarOpen(true);
              }
            : undefined
        }
      />
    </div>
  );
}
