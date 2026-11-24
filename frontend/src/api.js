export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

function describeError(data, status) {
  if (data && typeof data.detail === "string") return data.detail;
  if (data && Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg).join(", ");
  }
  return `Request failed (${status})`;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(describeError(data, response.status));
  }
  return data;
}

export const api = {
  getAccount: () => request("/api/v1/account"),
  getOffers: () => request("/api/v1/offers"),
  activateOffer: (offerId) => request(`/api/v1/offers/${offerId}/activate`, { method: "POST" }),
  getTransactions: () => request("/api/v1/transactions"),
  createTransaction: (payload) =>
    request("/api/v1/transactions", { method: "POST", body: JSON.stringify(payload) }),
  getInsights: () => request("/api/v1/telemetry/insights"),
};

export function track(eventType, offerId = null, payload = {}) {
  fetch(`${API_BASE}/api/v1/telemetry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: eventType, offer_id: offerId, payload }),
    keepalive: true,
  }).catch(() => {});
}
