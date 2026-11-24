import { ReceiptText } from "lucide-react";
import { formatCurrency, formatMultiplier, formatPoints, relativeTime } from "../utils";

export default function TransactionsTable({ transactions }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-display text-xl font-medium tracking-tight">Recent activity</h2>
          <p className="mt-1 text-xs text-muted">Every swipe and the rewards it generated.</p>
        </div>
        <span className="chip bg-paper text-muted">{transactions.length} transactions</span>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <ReceiptText size={22} className="text-muted" />
          <p className="text-sm font-medium">No transactions yet</p>
          <p className="text-xs text-muted">Run a simulated swipe to see it appear here.</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-line/60 md:hidden">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{transaction.merchant_name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                    <span className="chip bg-paper px-2 py-0.5">{transaction.category}</span>
                    <span>{relativeTime(transaction.created_at)}</span>
                  </div>
                  {transaction.offer_title && (
                    <p className="mt-1 truncate text-[11px] text-muted">{transaction.offer_title}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm">{formatCurrency(transaction.amount)}</p>
                  <p className="mt-1 text-[11px] font-semibold text-brand-deep">
                    +{formatPoints(transaction.points_earned)} pts ·{" "}
                    {formatMultiplier(transaction.multiplier_applied)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line/80 text-[10px] uppercase tracking-[0.14em] text-muted">
                  <th className="px-5 py-3 font-semibold sm:px-6">Merchant</th>
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 text-right font-semibold">Amount</th>
                  <th className="px-3 py-3 text-right font-semibold">Rate</th>
                  <th className="px-3 py-3 text-right font-semibold">Points</th>
                  <th className="px-5 py-3 text-right font-semibold sm:px-6">When</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-line/60 last:border-0 hover:bg-paper/40">
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-medium">{transaction.merchant_name}</p>
                      {transaction.offer_title && (
                        <p className="text-[11px] text-muted">{transaction.offer_title}</p>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="chip bg-paper text-muted">{transaction.category}</span>
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono">{formatCurrency(transaction.amount)}</td>
                    <td className="px-3 py-3.5 text-right">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          transaction.multiplier_applied > 1 ? "text-brand" : "text-muted"
                        }`}
                      >
                        {formatMultiplier(transaction.multiplier_applied)}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono font-medium text-brand-deep">
                      +{formatPoints(transaction.points_earned)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-muted sm:px-6">
                      {relativeTime(transaction.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
