import {
  Activity,
  ArrowUpRight,
  CreditCard,
  LayoutDashboard,
  Radio,
  ReceiptText,
  Tag,
} from "lucide-react";
import { API_BASE } from "../api";
import { formatCurrency } from "../utils";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "#overview" },
  { id: "offers", label: "Merchant offers", icon: Tag, href: "#offers" },
  { id: "activity", label: "Activity", icon: ReceiptText, href: "#activity" },
  { id: "insights", label: "Insights", icon: Radio, href: "#insights" },
];

export default function Sidebar({ account, activeSection, onNavigate }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-surface/70 px-4 py-6 backdrop-blur-md lg:flex">
      <a href="#overview" className="flex items-center gap-3 px-2" onClick={() => onNavigate("overview")}>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-paper shadow-glow">
          <Activity size={20} strokeWidth={2.4} />
        </span>
        <span>
          <span className="block font-display text-xl font-semibold leading-none tracking-tight">CardPulse</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            Rewards portal
          </span>
        </span>
      </a>

      <nav className="mt-9 flex flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-brand-soft font-semibold text-brand-deep"
                  : "text-muted hover:bg-paper hover:text-ink"
              }`}
            >
              <Icon size={17} className={isActive ? "text-brand" : ""} />
              {item.label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-8">
        <div className="relative overflow-hidden rounded-2xl bg-brand-deep p-4 text-paper">
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border border-paper/10" />
          <div className="relative flex items-center justify-between">
            <CreditCard size={18} className="text-paper/70" />
            <span className="rounded-full bg-paper/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/70">
              Platinum
            </span>
          </div>
          <p className="relative mt-5 font-mono text-xs tracking-[0.2em] text-paper/80">
            •••• •••• •••• {account?.card_last4 ?? "••••"}
          </p>
          <div className="relative mt-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-paper/40">Available</p>
              <p className="font-mono text-lg font-medium leading-tight">{formatCurrency(account?.balance)}</p>
            </div>
            <p className="max-w-[92px] truncate text-right text-[11px] text-paper/60">
              {account?.holder_name ?? "CardPulse member"}
            </p>
          </div>
        </div>

        <a
          href={`${API_BASE}/docs`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs font-medium text-muted transition hover:border-brand/25 hover:text-ink"
        >
          API reference
          <ArrowUpRight size={14} />
        </a>
      </div>
    </aside>
  );
}
