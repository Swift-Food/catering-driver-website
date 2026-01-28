"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cateringDriverApi } from "@/lib/drivers";
import MetricBox from "@/components/dashboard/MetricBox";
import SessionCard from "@/components/dashboard/SessionCard";

export default function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await cateringDriverApi.getAvailableSessions();
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch available sessions:", err);
        setError("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

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

      {/* Available Sessions Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black">Available Sessions</h2>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
              Awaiting Driver
            </span>
          </div>
          {!loading && (
            <span className="text-xs font-bold opacity-40 uppercase tracking-widest">
              {sessions.length} Available
            </span>
          )}
        </div>

        {loading ? (
          <div className="col-span-full py-16 text-center bg-surface rounded-3xl border border-border-subtle">
            <Loader2
              size={32}
              className="mx-auto mb-4 animate-spin text-primary"
            />
            <p className="font-bold text-sm uppercase tracking-widest opacity-40">
              Loading sessions...
            </p>
          </div>
        ) : error ? (
          <div className="col-span-full py-12 text-center bg-surface rounded-3xl border border-border-subtle">
            <AlertCircle
              size={48}
              className="mx-auto mb-4 text-status-red opacity-60"
            />
            <p className="font-bold text-sm uppercase tracking-widest opacity-40">
              {error}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <SessionCard key={session.id || session._id} session={session} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center opacity-30 bg-surface rounded-3xl border border-border-subtle">
                <AlertCircle size={48} className="mx-auto mb-4" />
                <p className="font-bold text-sm uppercase tracking-widest">
                  No sessions available at this time
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
