import { useState } from "react";
import { ArrowRight, ReceiptText, Zap } from "lucide-react";
import { CATEGORIES, formatCurrency, formatMultiplier, formatPoints } from "../utils";

const QUICK_AMOUNTS = [25, 50, 100, 250];

export default function SwipeForm({ offers, onSubmit, lastTx }) {
  const [merchant, setMerchant] = useState("Saffron Table");
  const [category, setCategory] = useState("Dining");
  const [amount, setAmount] = useState("48.50");
  const [pending, setPending] = useState(false);

  const activeCategories = new Set(offers.filter((offer) => offer.is_active).map((offer) => offer.category));

  async function handleSubmit(event) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;

    setPending(true);
    try {
      await onSubmit({
        merchant_name: merchant.trim() || "CardPulse Merchant",
        category,
        amount: value,
      });
    } catch {
      return;
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-medium tracking-tight">Simulate a card swipe</h2>
          <p className="mt-1 text-xs text-muted">Test dynamic rewards against your active offers.</p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
          <Zap size={17} />
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
        <div>
          <label htmlFor="merchant" className="label mb-1.5 block">
            Merchant
          </label>
          <input
            id="merchant"
            type="text"
            list="merchant-options"
            value={merchant}
            onChange={(event) => setMerchant(event.target.value)}
            className="field"
            placeholder="e.g. Saffron Table"
            autoComplete="off"
          />
          <datalist id="merchant-options">
            {offers.map((offer) => (
              <option key={offer.id} value={offer.merchant_name} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="category" className="label mb-1.5 block">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="field appearance-none bg-[length:14px] bg-[right_0.9rem_center] bg-no-repeat pr-9"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B756E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              }}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                  {activeCategories.has(item) ? " · boosted" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="amount" className="label mb-1.5 block">
              Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                $
              </span>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="field pl-7 font-mono"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value.toFixed(2))}
              className="rounded-lg border border-line bg-paper/60 px-2.5 py-1 text-[11px] font-medium text-muted transition hover:border-brand/30 hover:text-ink"
            >
              ${value}
            </button>
          ))}
        </div>

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? (
            "Processing swipe…"
          ) : (
            <>
              Run transaction <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      {lastTx && (
        <div className="mt-4 animate-rise-in rounded-xl border border-brand/15 bg-brand-soft/70 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-deep/70">Last swipe</p>
            <span className="chip bg-surface text-brand-deep">
              {formatMultiplier(lastTx.multiplier_applied)} rate
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-semibold text-brand-deep">
              +{formatPoints(lastTx.points_earned)}
            </span>
            <span className="text-xs font-medium text-brand-deep/70">points</span>
            <span className="ml-auto font-mono text-xs text-brand-deep/60">{formatCurrency(lastTx.amount)}</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-deep/70">
            <ReceiptText size={12} />
            {lastTx.offer_title ? `${lastTx.offer_title} applied` : "Base earn rate applied"}
          </p>
        </div>
      )}
    </div>
  );
}
