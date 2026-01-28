import {
  Clock,
  Package,
  MapPin,
  Store,
  ChevronRight,
} from "lucide-react";
import type { MealSession } from "@/lib/drivers/types";

interface SessionCardProps {
  session: MealSession;
  onClick?: () => void;
}

export default function SessionCard({ session, onClick }: SessionCardProps) {
  const restaurantName = session.sessionName || "Meal Session";
  const portionCount = session.totalDeliveryPortions;
  const date = session.sessionDate || "";
  const time = session.eventTime || "";
  const firstPickupAddress = session.restaurantPickupAddresses
    ? Object.values(session.restaurantPickupAddresses)[0]
    : null;

  const dropoffAddress = session.cateringOrder?.deliveryAddress || "";

  return (
    <div
      onClick={onClick}
      className={`w-full text-left bg-surface p-6 rounded-2xl shadow-sm border border-border-subtle transition-all duration-300 relative flex flex-col h-full group hover:border-primary/40${onClick ? " cursor-pointer" : ""}`}
    >
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
            <p className="text-[11px] font-black text-primary uppercase tracking-widest leading-none">
              {portionCount} PORTIONS
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-black leading-tight group-hover:text-primary transition-colors">
            {restaurantName}
          </h3>

          <div className="space-y-2">
            {firstPickupAddress && (
              <div className="flex items-center gap-2.5 text-[10px] font-bold opacity-60">
                <div className="w-7 h-7 rounded-lg bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
                  <Store size={14} />
                </div>
                <span className="uppercase tracking-wider truncate">
                  {firstPickupAddress.addressLine1}
                </span>
              </div>
            )}
            {dropoffAddress && (
              <div className="flex items-center gap-2.5 text-[10px] font-bold opacity-60">
                <div className="w-7 h-7 rounded-lg bg-surface-variant flex items-center justify-center text-primary border border-border-subtle">
                  <MapPin size={14} />
                </div>
                <span className="uppercase tracking-wider truncate">
                  Drop: {dropoffAddress}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border-subtle">
        <div className="grid grid-cols-2 gap-3">
          {time && (
            <div className="bg-surface-variant p-3 rounded-xl border border-border-subtle">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1.5">
                Event Time
              </p>
              <div className="flex items-center gap-2 text-primary">
                <Clock size={12} strokeWidth={2.5} />
                <span className="text-[11px] font-black tracking-tight">
                  {time}
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
