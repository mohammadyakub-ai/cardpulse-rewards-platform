import { Activity, Radio } from "lucide-react";
import { EVENT_META, formatPoints, relativeTime } from "../utils";

const TRACKED = ["offer_click", "offer_activated", "swipe_simulated", "page_view"];

export default function InsightsPanel({ insights, offers }) {
  const counts = insights?.counts ?? {};
  const total = insights?.total_events ?? 0;
  const recent = insights?.recent ?? [];
  const max = Math.max(1, ...TRACKED.map((key) => counts[key] ?? 0));

  function merchantFor(event) {
    if (!event.offer_id) return null;
    return offers.find((offer) => offer.id === event.offer_id)?.merchant_name ?? null;
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-medium tracking-tight">Engagement insights</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand" />
            Live telemetry · refreshes every 6s
          </p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3B5BDB]/10 text-[#3B5BDB]">
          <Radio size={17} />
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-xl bg-paper/70 px-3.5 py-3">
        <Activity size={18} className="text-brand" />
        <div>
          <p className="font-mono text-xl font-semibold leading-none">{formatPoints(total)}</p>
          <p className="mt-1 text-[11px] text-muted">events captured by the collection API</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {TRACKED.map((key) => {
          const meta = EVENT_META[key];
          const value = counts[key] ?? 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                  {meta.label}
                </span>
                <span className="font-mono font-medium text-ink">{formatPoints(value)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round((value / max) * 100)}%`,
                    backgroundColor: meta.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="label">Recent events</p>
        <ul className="mt-2.5 space-y-2.5">
          {recent.length === 0 && (
            <li className="rounded-lg bg-paper/60 px-3 py-2.5 text-xs text-muted">
              No events yet. Click an offer to start the stream.
            </li>
          )}
          {recent.slice(0, 5).map((event) => {
            const meta = EVENT_META[event.event_type] ?? {
              label: event.event_type.replaceAll("_", " "),
              color: "#6B756E",
            };
            const merchant = merchantFor(event);
            return (
              <li key={event.id} className="flex items-start gap-2.5 text-xs">
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">
                    {meta.label}
                    {merchant && <span className="font-normal text-muted"> · {merchant}</span>}
                  </p>
                  <p className="text-[10px] text-muted">{relativeTime(event.created_at)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
