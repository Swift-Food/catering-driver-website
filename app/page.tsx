"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Clock,
  TrendingUp,
  CheckCircle2,
  Package,
  MapPin,
  Store,
  AlertCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cateringDriverApi } from "@/lib/drivers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MealSession = any;

export default function HomePage() {
  const [sessions, setSessions] = useState<MealSession[]>([]);
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
              sessions.map((session: MealSession) => (
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

function MetricBox({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-surface-variant p-5 px-6 rounded-2xl border border-border-subtle transition-all hover:scale-[1.02] cursor-default">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${bg} ${color}`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-widest opacity-40 font-black mb-1">
            {label}
          </p>
          <p className="text-3xl font-black font-mont leading-none tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: MealSession }) {
  const restaurantName =
    session.restaurantName ||
    session.restaurant?.name ||
    session.mealSessionName ||
    "Meal Session";

  const portionCount =
    session.portionCount ||
    session.totalPortions ||
    session.quantity ||
    0;

  const date = session.date || session.deliveryDate || session.scheduledDate || "";
  const time = session.time || session.deliveryTime || session.scheduledTime || "";

  const pickupAddress =
    session.pickupAddress?.addressLine1 ||
    session.restaurant?.address?.addressLine1 ||
    session.pickupLocation ||
    "";

  const dropoffName =
    session.deliveryAddress?.name ||
    session.dropoffName ||
    session.destination?.name ||
    "Delivery Location";

  const dropoffAddress =
    session.deliveryAddress?.addressLine1 ||
    session.destination?.addressLine1 ||
    session.dropoffLocation ||
    "";

  const fee = session.fee || session.deliveryFee || session.driverFee || 0;

  return (
    <div className="w-full text-left bg-surface p-6 rounded-2xl shadow-sm border border-border-subtle transition-all duration-300 relative flex flex-col h-full group hover:border-primary/40">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <Package size={20} />
          </div>
          <div className="text-right">
            {date && (
              <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-1">
                {date}
              </p>
            )}
            {portionCount > 0 && (
              <p className="text-[11px] font-black text-primary uppercase tracking-widest leading-none">
                {portionCount} PORTIONS
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-black leading-tight group-hover:text-primary transition-colors">
            {restaurantName}
          </h3>

          <div className="space-y-2">
            {pickupAddress && (
              <div className="flex items-center gap-2.5 text-[10px] font-bold opacity-60">
                <div className="w-7 h-7 rounded-lg bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
                  <Store size={14} />
                </div>
                <span className="uppercase tracking-wider truncate">
                  {pickupAddress}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-[10px] font-bold opacity-60">
              <div className="w-7 h-7 rounded-lg bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
                <MapPin size={14} />
              </div>
              <span className="uppercase tracking-wider truncate">
                Drop: {dropoffName}
                {dropoffAddress ? ` — ${dropoffAddress}` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border-subtle">
        <div className="grid grid-cols-2 gap-3">
          {time && (
            <div className="bg-surface-variant p-3 rounded-xl border border-border-subtle">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1.5">
                Delivery Time
              </p>
              <div className="flex items-center gap-2 text-primary">
                <Clock size={12} strokeWidth={2.5} />
                <span className="text-[11px] font-black tracking-tight">
                  {time}
                </span>
              </div>
            </div>
          )}
          {fee > 0 && (
            <div className="bg-surface-variant p-3 rounded-xl border border-border-subtle">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1.5">
                Driver Fee
              </p>
              <div className="flex items-center gap-2 text-status-green">
                <span className="text-[11px] font-black tracking-tight">
                  ${typeof fee === "number" ? fee.toFixed(2) : fee}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-primary">
          <span className="text-[9px] font-black uppercase tracking-widest">
            View Details
          </span>
          <ChevronRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </div>
  );
}
