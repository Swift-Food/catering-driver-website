"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import { cateringDriverApi } from "@/lib/drivers";
import type { DriverMealSessionDto } from "@/lib/drivers/types";
import SessionCard from "@/components/dashboard/SessionCard";
import SessionDetailModal from "@/components/dashboard/SessionDetailModal";
import SessionCalendarModal from "@/components/delivery/SessionCalendarModal";
import Link from "next/link";

export default function CompletedPage() {
  const [sessions, setSessions] = useState<DriverMealSessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<DriverMealSessionDto | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [openedFromCalendar, setOpenedFromCalendar] = useState(false);
  const [calendarSelectedDay, setCalendarSelectedDay] = useState<string | null>(
    null,
  );

  const fetchCompleted = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cateringDriverApi.getCompletedSessions();
      // Sort by recency — latest first
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
        const dateA = a.deliveredAt || a.sessionDate || "";
        const dateB = b.deliveredAt || b.sessionDate || "";
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      setSessions(sorted);
    } catch (err) {
      console.error("Failed to fetch completed sessions:", err);
      setError("Failed to load completed orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompleted();
  }, [fetchCompleted]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-surface-variant border border-border-subtle flex items-center justify-center hover:text-primary transition-colors"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="bg-status-green/10 p-2 rounded-lg text-status-green border border-status-green/20">
              <CheckCircle2 size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                Completed Orders
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40">
                Delivery History
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <span className="text-xs font-bold opacity-40 uppercase tracking-widest hidden md:block">
              {sessions.length} Completed
            </span>
          )}
          {sessions.length > 0 && (
            <button
              onClick={() => setCalendarOpen(true)}
              className="w-8 h-8 rounded-lg bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer"
            >
              <Calendar size={16} />
            </button>
          )}
        </div>
      </div>
      {!loading && (
        <p className="text-xs font-bold opacity-40 uppercase tracking-widest -mt-6 md:hidden">
          {sessions.length} Completed
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center bg-surface rounded-3xl border border-border-subtle">
          <Loader2
            size={32}
            className="mx-auto mb-4 animate-spin text-primary"
          />
          <p className="font-bold text-sm uppercase tracking-widest opacity-40">
            Loading completed orders...
          </p>
        </div>
      ) : error ? (
        <div className="py-12 text-center bg-surface rounded-3xl border border-border-subtle">
          <AlertCircle
            size={48}
            className="mx-auto mb-4 text-status-red opacity-60"
          />
          <p className="font-bold text-sm uppercase tracking-widest opacity-40">
            {error}
          </p>
          <button
            onClick={fetchCompleted}
            className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="col-span-full py-12 text-center opacity-30 bg-surface rounded-3xl border border-border-subtle">
          <CheckCircle2 size={48} className="mx-auto mb-4" />
          <p className="font-bold text-sm uppercase tracking-widest">
            No completed orders yet
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => setSelectedSession(session)}
            />
          ))}
        </div>
      )}

      {/* Calendar Modal */}
      {calendarOpen && (
        <SessionCalendarModal
          sessions={sessions}
          selectedSessionId={selectedSession?.id ?? null}
          initialSelectedDay={calendarSelectedDay}
          onSelectSession={(id) => {
            const session = sessions.find((s) => s.id === id);
            if (session) {
              setSelectedSession(session);
              setOpenedFromCalendar(true);
              if (session.sessionDate) {
                const d = new Date(session.sessionDate);
                if (!isNaN(d.getTime())) {
                  setCalendarSelectedDay(
                    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
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
