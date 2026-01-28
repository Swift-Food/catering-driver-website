"use client";

import {
  CheckCircle,
  Camera,
  ChevronRight,
  Timer,
  Phone,
  MessageSquare,
  ImageIcon,
} from "lucide-react";
import type { DeliveryStop } from "./types";

interface StopTimelineItemProps {
  stop: DeliveryStop;
  index: number;
  isExpanded: boolean;
  isSelectable: boolean;
  photoUrl?: string;
  onSelect: () => void;
  onOpenCamera: () => void;
  onComplete: () => void;
  isCompleting: boolean;
}

export default function StopTimelineItem({
  stop,
  index,
  isExpanded,
  isSelectable,
  photoUrl,
  onSelect,
  onOpenCamera,
  onComplete,
  isCompleting,
}: StopTimelineItemProps) {
  const isCompleted = stop.completed;

  return (
    <div
      onClick={() => isSelectable && onSelect()}
      className={`flex gap-6 p-5 rounded-xl border transition-all duration-300 ${
        isExpanded
          ? "bg-primary/5 border-primary/20 shadow-sm"
          : "border-transparent hover:bg-surface-variant"
      } ${!isSelectable && !isCompleted ? "opacity-30" : "cursor-pointer"}`}
    >
      {/* Step Number / Check */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all mt-1 ${
          isCompleted
            ? "bg-status-green border-status-green/20 text-white"
            : isSelectable
            ? "bg-surface border-primary/20 text-primary shadow-sm"
            : "bg-surface-variant border-transparent text-gray-400"
        }`}
      >
        {isCompleted ? (
          <CheckCircle size={14} />
        ) : (
          <span className="text-[10px] font-black">{index + 1}</span>
        )}
      </div>

      {/* Stop Content */}
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3
                className={`text-base font-black ${
                  isCompleted ? "line-through text-gray-400" : ""
                }`}
              >
                {stop.type === "PICKUP" ? "Collection" : "Final Delivery"}
              </h3>
              {stop.prepStatus && !isCompleted && (
                <span
                  className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${
                    stop.prepStatus === "READY"
                      ? "bg-status-green/10 text-status-green border-status-green/20"
                      : "bg-status-amber/10 text-status-amber border-status-amber/20"
                  }`}
                >
                  {stop.prepStatus}
                </span>
              )}
            </div>
            <p className="text-primary font-bold text-sm">
              {stop.locationName}
            </p>
            <p className="text-[10px] opacity-40 font-medium">{stop.address}</p>
          </div>
          <div className="text-left md:text-right flex flex-col items-start md:items-end">
            <div className="flex items-center gap-1.5 text-primary opacity-60">
              <Timer size={12} />
              <p className="text-[10px] font-black uppercase tracking-tighter">
                {stop.time}
              </p>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && !isCompleted && (
          <div className="mt-5 grid md:grid-cols-2 gap-4 animate-in slide-in-from-top-1 duration-300">
            {/* Contact Panel */}
            <div className="bg-surface-variant p-5 rounded-xl border border-border-subtle shadow-sm">
              {stop.type === "PICKUP" ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1">
                      Point of Contact
                    </p>
                    <p className="font-black text-sm">
                      {stop.contactName || "Restaurant Lead"}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-border-subtle">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2 text-center">
                      Contact Restaurant
                    </p>
                    <div className="flex gap-2">
                      {stop.contactPhone ? (
                        <a
                          href={`tel:${stop.contactPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 py-3 bg-primary/5 text-primary rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
                        >
                          <Phone size={14} /> Call
                        </a>
                      ) : (
                        <button className="flex-1 py-3 bg-primary/5 text-primary rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all">
                          <Phone size={14} /> Call
                        </button>
                      )}
                      <button className="flex-1 py-3 bg-primary/5 text-primary rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all">
                        <MessageSquare size={14} /> Chat
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center py-4">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30">
                    Recipient Node
                  </p>
                  <p className="font-black text-sm">{stop.contactName}</p>
                  <div className="flex gap-2">
                    {stop.contactPhone ? (
                      <a
                        href={`tel:${stop.contactPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-3 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                      >
                        Direct Call
                      </a>
                    ) : (
                      <button className="flex-1 py-3 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                        Direct Call
                      </button>
                    )}
                    <button className="flex-1 py-3 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                      Secure Message
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Camera + Action Panel */}
            <div className="flex flex-col justify-between gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCamera();
                }}
                className="flex-1 bg-primary/5 p-4 rounded-xl border border-primary/10 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-all"
              >
                {photoUrl ? (
                  <>
                    <ImageIcon
                      size={20}
                      className="text-status-green mb-1"
                    />
                    <p className="text-[10px] font-bold text-status-green">
                      Photo Captured
                    </p>
                    <p className="text-[8px] opacity-40 mt-0.5">
                      Tap to retake
                    </p>
                  </>
                ) : (
                  <>
                    <Camera
                      size={20}
                      className="text-primary opacity-40 mb-1"
                    />
                    <p className="text-[10px] font-bold opacity-60">
                      Identity Confirmation
                    </p>
                    <p className="text-[8px] opacity-30 mt-0.5">
                      Tap to capture
                    </p>
                  </>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                disabled={!photoUrl || isCompleting}
                className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isCompleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {stop.type === "PICKUP"
                      ? "Complete Collection"
                      : "Confirm Dropoff"}
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
