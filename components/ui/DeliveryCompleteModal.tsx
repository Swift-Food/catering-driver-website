"use client";

import { CheckCircle } from "lucide-react";

interface DeliveryCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeliveryCompleteModal({
  isOpen,
  onClose,
}: DeliveryCompleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-surface rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-black mb-2">Delivery Complete!</h3>
          <p className="text-sm opacity-60 mb-6">
            Great job! This delivery has been marked as complete.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-green-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
