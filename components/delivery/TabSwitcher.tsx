"use client";

export type ViewMode = "TIMELINE" | "MAP";

interface TabSwitcherProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

export default function TabSwitcher({
  viewMode,
  onChangeViewMode,
}: TabSwitcherProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="bg-surface-variant p-1 rounded-xl flex w-fit border border-border-subtle">
        <TabButton
          active={viewMode === "TIMELINE"}
          label="Details"
          onClick={() => onChangeViewMode("TIMELINE")}
        />
        <TabButton
          active={viewMode === "MAP"}
          label="Map"
          onClick={() => onChangeViewMode("MAP")}
        />
      </div>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
        active
          ? "bg-surface shadow-sm text-primary"
          : "text-text-muted"
      }`}
    >
      {label}
    </button>
  );
}
