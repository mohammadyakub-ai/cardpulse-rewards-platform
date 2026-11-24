import {
  ArrowUpRight,
  Check,
  Headphones,
  Leaf,
  Plane,
  ShoppingBag,
  Sparkles,
  Utensils,
} from "lucide-react";
import { daysUntil, formatPoints } from "../utils";

const ICONS = {
  utensils: Utensils,
  plane: Plane,
  "shopping-bag": ShoppingBag,
  leaf: Leaf,
  headphones: Headphones,
  sparkles: Sparkles,
};

export default function OfferCard({ offer, onTrackClick, onActivate, busy, disabled }) {
  const Icon = ICONS[offer.icon] || Sparkles;
  const active = offer.is_active;
  const days = daysUntil(offer.valid_until);

  return (
    <article
      onClick={() => onTrackClick(offer)}
      className={`group relative flex flex-col rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift ${
        active ? "border-brand/25 bg-brand-soft/40" : "border-line bg-surface shadow-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ backgroundColor: `${offer.accent}16`, color: offer.accent }}
          >
            <Icon size={19} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{offer.category}</p>
            <p className="truncate text-sm font-semibold">{offer.merchant_name}</p>
          </div>
        </div>
        {active ? (
          <span className="chip shrink-0 bg-brand text-paper">
            <Check size={12} strokeWidth={3} /> Active
          </span>
        ) : (
          <span className="chip shrink-0 bg-paper text-muted">+{offer.bonus_points} pts</span>
        )}
      </div>

      <h3 className="mt-4 font-display text-xl font-medium leading-snug tracking-tight">{offer.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{offer.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="chip bg-brand-soft text-brand-deep">{offer.reward_multiplier}× points</span>
        <span className="text-xs text-muted">
          {days > 0 ? `${days} day${days === 1 ? "" : "s"} left` : "Ends today"}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line/80 pt-5">
        <span className="text-[11px] text-muted">
          Welcome bonus <span className="font-semibold text-ink">{formatPoints(offer.bonus_points)} pts</span>
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onActivate(offer);
          }}
          disabled={active || busy || disabled}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            active
              ? "cursor-default bg-brand/10 text-brand-deep"
              : "bg-ink text-paper hover:bg-brand-deep active:translate-y-px disabled:opacity-50"
          }`}
        >
          {active ? (
            <>
              <Check size={13} strokeWidth={3} /> Activated
            </>
          ) : busy ? (
            "Activating…"
          ) : (
            <>
              Activate offer <ArrowUpRight size={13} />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
