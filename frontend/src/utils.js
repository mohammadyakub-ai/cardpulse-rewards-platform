export const CATEGORIES = ["Dining", "Travel", "Retail", "Groceries", "Electronics"];

export const EVENT_META = {
  offer_click: { label: "Offer clicks", color: "#C07A2C" },
  offer_activated: { label: "Activations", color: "#0F5132" },
  swipe_simulated: { label: "Swipes simulated", color: "#3B5BDB" },
  page_view: { label: "Page views", color: "#8A7A63" },
  insights_view: { label: "Insight views", color: "#0F766E" },
};

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function formatPoints(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

export function formatMultiplier(value) {
  const rounded = Math.round(Number(value) * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}×`;
}

export function daysUntil(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function formatDate(iso) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function relativeTime(iso) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 45) return "just now";
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86_400)}d ago`;
}
