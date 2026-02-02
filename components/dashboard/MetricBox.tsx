import React from "react";
import Link from "next/link";

interface MetricBoxProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  href?: string;
}

export default function MetricBox({ label, value, icon, color, bg, href }: MetricBoxProps) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className={`p-1.5 md:p-2 rounded-md md:rounded-lg ${bg} ${color}`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] md:text-[11px] uppercase tracking-widest opacity-40 font-black mb-0.5 md:mb-1">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-black font-mont leading-none tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </>
  );

  const className = `bg-surface-variant p-3 md:p-5 md:px-6 rounded-lg md:rounded-xl border border-border-subtle transition-all hover:scale-[1.02] ${href ? "cursor-pointer" : "cursor-default"}`;

  if (href) {
    return (
      <Link href={href} className={`block ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
