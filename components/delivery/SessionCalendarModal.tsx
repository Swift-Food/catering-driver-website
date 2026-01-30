"use client";

import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { DriverMealSessionDto } from "@/lib/drivers/types";
import {
  getSessionDateLabel,
  getSessionTimeRange,
} from "@/components/delivery/sessionUtils";

interface SessionCalendarModalProps {
  sessions: DriverMealSessionDto[];
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
  onClose: () => void;
  initialSelectedDay?: string | null;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getSessionDateKey(session: DriverMealSessionDto): string | null {
  if (!session.sessionDate) return null;
  const d = new Date(session.sessionDate);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function SessionCalendarModal({
  sessions,
  selectedSessionId,
  onSelectSession,
  onClose,
  initialSelectedDay,
}: SessionCalendarModalProps) {
  const today = new Date();
  const initialMonth = initialSelectedDay
    ? parseInt(initialSelectedDay.split("-")[1], 10) - 1
    : today.getMonth();
  const initialYear = initialSelectedDay
    ? parseInt(initialSelectedDay.split("-")[0], 10)
    : today.getFullYear();
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(initialSelectedDay ?? null);

  // Map date keys to sessions
  const sessionsByDate = useMemo(() => {
    const map: Record<string, DriverMealSessionDto[]> = {};
    for (const s of sessions) {
      const key = getSessionDateKey(s);
      if (key) {
        if (!map[key]) map[key] = [];
        map[key].push(s);
      }
    }
    return map;
  }, [sessions]);

  // Calendar grid cells
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    // Monday = 0 ... Sunday = 6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells: { day: number; inMonth: boolean; key: string }[] = [];

    // Leading blanks
    for (let i = 0; i < startDow; i++) {
      cells.push({ day: 0, inMonth: false, key: `blank-${i}` });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push({
        day: d,
        inMonth: true,
        key: dateKey(viewYear, viewMonth, d),
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  const todayKey = dateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daySessions = selectedDay ? (sessionsByDate[selectedDay] ?? []) : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative w-[95vw] max-w-lg bg-surface rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-4 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                Calendar
              </p>
              <h2 className="text-2xl font-black">Delivery Sessions</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center hover:text-primary transition-colors border border-border-subtle shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Calendar grid (fixed) */}
        <div className="space-y-5 px-4 md:px-8 pb-4 shrink-0">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg bg-surface-variant border border-border-subtle flex items-center justify-center hover:text-primary transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-sm font-black">{monthLabel}</p>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg bg-surface-variant border border-border-subtle flex items-center justify-center hover:text-primary transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                className="text-center text-[9px] font-black uppercase tracking-widest opacity-40 py-1"
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell) => {
              if (!cell.inMonth) {
                return <div key={cell.key} />;
              }

              const sessionCount = sessionsByDate[cell.key]?.length ?? 0;
              const isToday = cell.key === todayKey;
              const isSelected = cell.key === selectedDay;

              return (
                <button
                  key={cell.key}
                  onClick={() =>
                    setSelectedDay(isSelected ? null : cell.key)
                  }
                  className={`relative flex flex-col items-center justify-center py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-white"
                      : isToday
                        ? "ring-1 ring-primary/40"
                        : ""
                  } ${sessionCount > 0 && !isSelected ? "hover:bg-primary/10" : "hover:bg-surface-variant"}`}
                >
                  {cell.day}
                  {sessionCount > 0 && (
                    <span className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: sessionCount }).map((_, j) => (
                        <span
                          key={j}
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? "bg-white" : "bg-primary"
                          }`}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Session label (fixed) */}
        {selectedDay && daySessions.length > 0 && (
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 px-5 md:px-9 pb-3 shrink-0">
            Sessions on this day ({daySessions.length})
          </p>
        )}

        {/* Session list (scrollable) */}
        <div className="overflow-y-auto hide-scrollbar min-h-0 flex-1 px-4 md:px-8 pb-8 md:pb-12">
          {selectedDay && daySessions.length > 0 && (
            <div>
              <div className="space-y-2">
                {daySessions.map((s, i) => {
                  const dateLabel = getSessionDateLabel(s);
                  const timeRange = getSessionTimeRange(s);

                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectSession(s.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                        selectedSessionId === s.id
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-surface border-border-subtle hover:border-primary/20"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                          selectedSessionId === s.id
                            ? "bg-primary text-white"
                            : "bg-surface-variant"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="text-left flex-1 min-w-0">
                        <p className="leading-tight">
                          {s.sessionName || `Session ${i + 1}`}
                        </p>
                        {(dateLabel || timeRange) && (
                          <p className="text-[9px] font-medium opacity-50 leading-tight mt-0.5">
                            {dateLabel && (
                              <span className="font-black opacity-100 text-text">
                                {dateLabel}
                              </span>
                            )}
                            {dateLabel && timeRange ? " · " : ""}
                            {timeRange}
                          </p>
                        )}
                      </div>
                      {s.driverNames && s.driverNames.length > 0 && (
                        <span className="text-[9px] font-black text-status-green shrink-0 truncate max-w-[100px]">
                          {s.driverNames.join(", ")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedDay && daySessions.length === 0 && (
            <p className="text-center text-xs font-bold opacity-40 py-4">
              No sessions on this day
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
