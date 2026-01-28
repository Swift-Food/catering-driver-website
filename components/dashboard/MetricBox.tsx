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
