import {
  Clock,
  Package,
  MapPin,
  Store,
  ChevronRight,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MealSession = any;

interface SessionCardProps {
  session: MealSession;
}

export default function SessionCard({ session }: SessionCardProps) {
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
