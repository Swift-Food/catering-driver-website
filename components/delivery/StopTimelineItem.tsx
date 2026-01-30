"use client";

import { useRef, useState } from "react";
import {
  CheckCircle,
  Camera,
  ChevronRight,
  Timer,
  Phone,
  ImageIcon,
  Loader2,
  ListChecks,
} from "lucide-react";
import type { DeliveryStop } from "./types";

interface StopTimelineItemProps {
  stop: DeliveryStop;
  index: number;
  isExpanded: boolean;
  isSelectable: boolean;
  isLocked?: boolean;
  photoUrl?: string;
  isUploading: boolean;
  onSelect: () => void;
  onPhotoSelected: (file: File) => void;
  onComplete: () => void;
  isCompleting: boolean;
  itemsConfirmed: boolean;
  onItemsConfirmedChange: (confirmed: boolean) => void;
}

export default function StopTimelineItem({
  stop,
  index,
  isExpanded,
  isSelectable,
  isLocked,
  photoUrl,
  isUploading,
  onSelect,
  onPhotoSelected,
  onComplete,
  isCompleting,
  itemsConfirmed,
  onItemsConfirmedChange,
}: StopTimelineItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCompleted = stop.completed;
  const [itemChecks, setItemChecks] = useState<Record<string, boolean>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPhotoSelected(file);
    e.target.value = "";
  };

  const isPickup = stop.type === "PICKUP";
  const canComplete = isPickup
    ? photoUrl && itemsConfirmed
    : photoUrl;

  return (
    <div
      onClick={() => isSelectable && onSelect()}
      className={`flex gap-6 p-5 rounded-xl border transition-all duration-300 ${
        isExpanded
          ? "bg-primary/5 border-primary/20 shadow-sm"
          : "border-transparent hover:bg-surface-variant"
      } ${isLocked && !isCompleted ? "opacity-30" : "cursor-pointer"}`}
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
                {isPickup ? "Collection" : "Final Delivery"}
              </h3>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address || stop.locationName)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block"
            >
              <p className="text-primary font-bold text-sm">
                {stop.locationName}
              </p>
              <p className="text-[10px] opacity-40 font-medium">{stop.address}</p>
            </a>
          </div>
          <div className="text-left md:text-right flex flex-col items-start md:items-end">
            <div className="flex items-center gap-1.5 text-primary">
              <Timer size={14} />
              <p className="text-sm font-black uppercase tracking-tighter">
                {stop.time}
              </p>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && !isCompleted && (
          <div className="mt-5 -ml-14 flex flex-col gap-4 animate-in slide-in-from-top-1 duration-300">
            <div className="grid md:grid-cols-2 gap-4">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Left Panel: Item Checklist + Contact */}
            <div className="bg-surface-variant p-5 rounded-xl border border-border-subtle shadow-sm">
              {isPickup ? (
                <div className="space-y-4">
                  {/* Item Checklist */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ListChecks size={14} className="text-primary" />
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40">
                        Item Checklist
                      </p>
                      {stop.items && stop.items.length > 0 && (
                        <span className="text-[9px] font-bold text-primary ml-auto">
                          {Object.values(itemChecks).filter(Boolean).length}/{stop.items.length}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] opacity-30 mb-3">
                      For your own reference — tick off items as you check them
                    </p>

                    {stop.items && stop.items.length > 0 && (
                      <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5">
                        {stop.items.map((item) => (
                          <label
                            key={item.id}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-white/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 rounded accent-primary cursor-pointer flex-shrink-0"
                              checked={!!itemChecks[item.id]}
                              onChange={(e) => {
                                setItemChecks((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.checked,
                                }));
                              }}
                            />
                            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                              {item.label}
                            </span>
                            <span className="text-[9px] font-bold text-primary/60 ml-auto">
                              x{item.quantity}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contact Section */}
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
                        <button disabled className="flex-1 py-3 bg-primary/5 text-primary/30 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2">
                          <Phone size={14} /> Call
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center py-4">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30">
                    Recipient
                  </p>
                  <p className="font-black text-sm">{stop.contactName}</p>
                  <div className="flex gap-2">
                    {stop.contactPhone ? (
                      <a
                        href={`tel:${stop.contactPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-3 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                      >
                        Call
                      </a>
                    ) : (
                      <button disabled className="flex-1 py-3 bg-primary/10 text-primary/30 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        Call
                      </button>
                    )}
                    {stop.contactPhone ? (
                      <a
                        href={`https://wa.me/${stop.contactPhone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-3 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                      >
                        WhatsApp
                      </a>
                    ) : (
                      <button disabled className="flex-1 py-3 bg-primary/10 text-primary/30 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Photo + Action Panel */}
            <div className="flex flex-col justify-between gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="flex-1 bg-primary/5 p-4 rounded-xl border border-primary/10 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2
                      size={20}
                      className="text-primary animate-spin mb-1"
                    />
                    <p className="text-[10px] font-bold text-primary">
                      Uploading...
                    </p>
                  </>
                ) : photoUrl ? (
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
                      Take Photo
                    </p>
                    <p className="text-[8px] opacity-30 mt-0.5">
                      Tap to capture or select
                    </p>
                  </>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                disabled={!canComplete || isCompleting}
                className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isCompleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isPickup
                      ? "Complete Collection"
                      : "Confirm Dropoff"}
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
            </div>

            {/* T&C Confirmation Checkbox - full width below grid */}
            {isPickup && (
              <label
                onClick={(e) => e.stopPropagation()}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  itemsConfirmed
                    ? "bg-primary/10 border-primary/30"
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-primary cursor-pointer flex-shrink-0"
                  checked={itemsConfirmed}
                  onChange={(e) => onItemsConfirmedChange(e.target.checked)}
                />
                <span className={`text-[11px] font-bold leading-tight ${
                  itemsConfirmed ? "text-primary" : "opacity-70"
                }`}>
                  I confirm that all items for this collection have been checked and are present
                </span>
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
