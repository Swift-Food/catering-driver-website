import React from "react";

interface MetricBoxProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export default function MetricBox({ label, value, icon, color, bg }: MetricBoxProps) {
  return (
    <div className="bg-surface-variant p-3 md:p-5 md:px-6 rounded-lg md:rounded-xl border border-border-subtle transition-all hover:scale-[1.02] cursor-default">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className={`p-1.5 md:p-2 rounded-md md:rounded-lg ${bg} ${color}`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[8px] md:text-[9px] uppercase tracking-widest opacity-40 font-black mb-0.5 md:mb-1">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-black font-mont leading-none tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
