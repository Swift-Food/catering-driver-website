"use client";

import {
  User,
  Clock,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  ListChecks,
} from "lucide-react";
import type { MealSession } from "@/lib/drivers/types";

interface DeliverySidebarProps {
  session: MealSession;
  totalStops: number;
  remainingStops: number;
}

export default function DeliverySidebar({
  session,
  totalStops,
  remainingStops,
}: DeliverySidebarProps) {
  const customerName =
    session.cateringOrder?.customerName || "Customer";
  const customerPhone = session.cateringOrder?.customerPhone || "";
  const deliveryAddress =
    session.cateringOrder?.deliveryAddress || "Delivery Destination";
  const eventTime = formatTime(session.eventTime);

  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Mission Communications */}
      <div className="bg-surface p-6 rounded-2xl shadow-md border border-border-subtle space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
          Mission Communications
        </h3>
        <div className="space-y-4">
          <SidebarItem
            name={customerName}
            role="Customer Contact"
            icon={<User size={14} />}
            phone={customerPhone}
          />
          <SidebarItem
            name={eventTime}
            role="Target Delivery"
            icon={<Clock size={14} />}
          />
          <SidebarItem
            name={deliveryAddress}
            role="Delivery Location"
            icon={<MapPin size={14} />}
            actionIcon={<Navigation size={10} />}
            actionHref={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddress)}`}
          />
        </div>

        <div className="pt-4 border-t border-border-subtle space-y-2">
          {customerPhone ? (
            <a
              href={`tel:${customerPhone}`}
              className="block w-full py-3 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10 text-center"
            >
              Contact Customer
            </a>
          ) : (
            <button className="w-full py-3 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10">
              Contact Customer
            </button>
          )}
        </div>
      </div>

      {/* Route Progress */}
      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <ListChecks size={18} className="text-primary" />
          <h4 className="text-xs font-black uppercase tracking-widest">
            Route Progress
          </h4>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold opacity-40 uppercase">
              Total Stops
            </span>
            <span className="text-xs font-black">{totalStops}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold opacity-40 uppercase">
              Remaining
            </span>
            <span className="text-xs font-black text-primary">
              {remainingStops}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  name,
  role,
  icon,
  phone,
  actionIcon,
  actionHref,
}: {
  name: string;
  role: string;
  icon: React.ReactNode;
  phone?: string;
  actionIcon?: React.ReactNode;
  actionHref?: string;
}) {
  return (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-surface-variant p-2 rounded-xl transition-all">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
          {icon}
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-xs truncate">{name}</p>
          <p className="text-[8px] font-bold uppercase opacity-30 tracking-widest truncate">
            {role}
          </p>
        </div>
      </div>
      {(phone || actionIcon) && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {actionIcon && actionHref ? (
            <a
              href={actionHref}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-primary/10 text-primary rounded-md"
            >
              {actionIcon}
            </a>
          ) : phone ? (
            <>
              <a
                href={`tel:${phone}`}
                className="p-1.5 bg-primary/10 text-primary rounded-md"
              >
                <Phone size={10} />
              </a>
              <button className="p-1.5 bg-primary/10 text-primary rounded-md">
                <MessageSquare size={10} />
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}
