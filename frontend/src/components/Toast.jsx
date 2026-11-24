import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const TONES = {
  success: { icon: CheckCircle2, color: "text-brand", ring: "border-brand/20" },
  error: { icon: AlertCircle, color: "text-coral", ring: "border-coral/25" },
  info: { icon: Info, color: "text-[#3B5BDB]", ring: "border-[#3B5BDB]/20" },
};

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 4200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const tone = TONES[toast.tone] || TONES.success;
  const Icon = tone.icon;

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-4 z-50 flex max-w-sm animate-rise-in items-start gap-3 rounded-2xl border bg-surface p-4 shadow-lift sm:right-6 ${tone.ring}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${tone.color}`} />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-0.5 text-muted transition hover:bg-paper hover:text-ink"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}
