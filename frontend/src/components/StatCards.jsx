import { CreditCard } from "lucide-react";
import { formatCurrency } from "../utils";

export function BalanceCard({ account }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand-deep p-5 text-paper shadow-glow sm:p-6">
      <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full border border-paper/10" />
      <div className="pointer-events-none absolute -right-4 -top-8 h-36 w-36 rounded-full border border-paper/10" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/60">Total balance</p>
          <p className="mt-3 font-mono text-[clamp(1.9rem,4vw,2.5rem)] font-medium leading-none tracking-tight">
            {formatCurrency(account?.balance ?? 0)}
          </p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-paper/10">
          <CreditCard size={17} />
        </span>
      </div>

      <div className="relative mt-7 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs tracking-[0.22em] text-paper/70">
            •••• •••• •••• {account?.card_last4 ?? "••••"}
          </p>
          <p className="mt-1.5 truncate text-[10px] uppercase tracking-[0.18em] text-paper/40">
            {account?.holder_name ?? "CardPulse member"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-paper/40">CardPulse</p>
          <p className="text-xs font-semibold text-paper/80">Platinum</p>
        </div>
      </div>
    </div>
  );
}

export function MetricCard({ label, value, hint, icon: Icon, accent = "#0F5132" }) {
  return (
    <div className="card flex flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="label">{label}</p>
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-5">
        <p className="font-mono text-3xl font-medium leading-none tracking-tight">{value}</p>
        {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}
