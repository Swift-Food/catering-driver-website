"use client";

import {
  User,
  Clock,
  MapPin,
  ListChecks,
  Phone,
  MessageSquare,
  MessageCircle,
} from "lucide-react";
import type { DriverMealSessionDto } from "@/lib/drivers/types";
import { formatTime } from "@/lib/formatters";

interface DeliverySidebarProps {
  session: DriverMealSessionDto;
  totalStops: number;
  remainingStops: number;
}

export default function DeliverySidebar({
  session,
  totalStops,
  remainingStops,
}: DeliverySidebarProps) {
  const customerName = session.delivery.contactName || "Customer";
  const customerPhone = session.delivery.contactPhone || "";
  const deliveryAddress = session.delivery.address || "Delivery Destination";
  const eventTime = formatTime(session.eventTime, "N/A");

  return (
    <div className="space-y-6">
      {/* Mission Communications */}
      <div className="bg-surface p-6 rounded-2xl border border-border-subtle space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
          Customer Details
        </h3>
        <div className="space-y-4">
          <SidebarItem
            name={customerName}
            role="Customer Name"
            icon={<User size={14} />}
          />
          <SidebarItem
            name={eventTime}
            role="Target Delivery Time"
            icon={<Clock size={14} />}
          />
          <SidebarItem
            name={deliveryAddress}
            role="Delivery Location"
            icon={<MapPin size={14} />}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddress)}`}
          />
        </div>

        <div className="pt-4 border-t border-border-subtle">
          <div className="flex gap-2">
            {customerPhone ? (
              <a
                href={`tel:${customerPhone}`}
                className="flex-1 py-3 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10 flex items-center justify-center gap-2"
              >
                <Phone size={14} /> Call
              </a>
            ) : (
              <button disabled className="flex-1 py-3 bg-primary/5 text-primary/30 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10 flex items-center justify-center gap-2">
                <Phone size={14} /> Call
              </button>
            )}
            {customerPhone ? (
              <a
                href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10 flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} /> WhatsApp
              </a>
            ) : (
              <button disabled className="flex-1 py-3 bg-primary/5 text-primary/30 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10 flex items-center justify-center gap-2">
                <MessageSquare size={14} /> WhatsApp
              </button>
            )}
          </div>
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

      {/* Contact Swift */}
      <div className="bg-surface p-6 rounded-2xl border border-border-subtle space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
          Contact Swift
        </h3>
        <div className="flex gap-2">
          <a
            href="tel:+441234567890"
            className="flex-1 py-3 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10 flex items-center justify-center gap-2"
          >
            <Phone size={14} /> Call
          </a>
          <a
            href="https://wa.me/441234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-green-500/10 text-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all border border-green-500/20 flex items-center justify-center gap-2"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  name,
  role,
  icon,
  href,
}: {
  name: string;
  role: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const content = (
    <>
      <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="font-bold text-xs truncate">{name}</p>
        <p className="text-[8px] font-bold uppercase opacity-30 tracking-widest truncate">
          {role}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 overflow-hidden group hover:bg-surface-variant p-2 rounded-xl transition-all"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 overflow-hidden p-2 rounded-xl">
      {content}
    </div>
  );
}

