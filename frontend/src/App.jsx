import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Radio,
  RefreshCw,
  Sparkles,
  Tag,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import { BalanceCard, MetricCard } from "./components/StatCards";
import OfferCard from "./components/OfferCard";
import SwipeForm from "./components/SwipeForm";
import InsightsPanel from "./components/InsightsPanel";
import TransactionsTable from "./components/TransactionsTable";
import Toast from "./components/Toast";
import { API_BASE, api, track } from "./api";
import { CATEGORIES, formatPoints } from "./utils";

const FILTERS = ["All", ...CATEGORIES];

export default function App() {
  const [account, setAccount] = useState(null);
  const [offers, setOffers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [busyOfferId, setBusyOfferId] = useState(null);
  const [lastTx, setLastTx] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeSection, setActiveSection] = useState("overview");
  const pageViewTracked = useRef(false);

  const notify = useCallback((message, tone = "success") => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  const loadDashboard = useCallback(async () => {
    try {
      const [accountData, offersData, transactionData, insightData] = await Promise.all([
        api.getAccount(),
        api.getOffers(),
        api.getTransactions(),
        api.getInsights(),
      ]);
      setAccount(accountData);
      setOffers(offersData);
      setTransactions(transactionData);
      setInsights(insightData);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to reach the CardPulse API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (pageViewTracked.current) return;
    pageViewTracked.current = true;
    track("page_view", null, { path: "/" });
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        setInsights(await api.getInsights());
      } catch {
        return;
      }
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  function handleTrackClick(offer) {
    track("offer_click", offer.id, { source: "offers_grid", category: offer.category });
  }

  async function handleActivate(offer) {
    if (busyOfferId) return;
    track("offer_click", offer.id, { source: "activate_button", category: offer.category });
    setBusyOfferId(offer.id);
    try {
      const result = await api.activateOffer(offer.id);
      track("offer_activated", offer.id, { awarded_points: result.awarded_points });
      setOffers((previous) =>
        previous.map((item) => (item.id === offer.id ? result.offer : item))
      );
      const [accountData, insightData] = await Promise.all([api.getAccount(), api.getInsights()]);
      setAccount(accountData);
      setInsights(insightData);
      notify(
        result.awarded_points > 0
          ? `${offer.merchant_name} is live · +${formatPoints(result.awarded_points)} bonus points`
          : "This offer is already active",
        result.awarded_points > 0 ? "success" : "info"
      );
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBusyOfferId(null);
    }
  }

  async function handleSwipe(payload) {
    try {
      const transaction = await api.createTransaction(payload);
      track("swipe_simulated", transaction.offer_id, {
        amount: transaction.amount,
        category: transaction.category,
        points: transaction.points_earned,
      });
      setLastTx(transaction);
      const [accountData, transactionData, insightData] = await Promise.all([
        api.getAccount(),
        api.getTransactions(),
        api.getInsights(),
      ]);
      setAccount(accountData);
      setTransactions(transactionData);
      setInsights(insightData);
      notify(
        `${transaction.multiplier_applied}× applied · +${formatPoints(transaction.points_earned)} points earned`,
        "success"
      );
      return transaction;
    } catch (err) {
      notify(err.message, "error");
      throw err;
    }
  }

  if (loading && !account) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="flex flex-col items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-paper shadow-glow">
            <Activity size={24} />
          </span>
          <div className="text-center">
            <p className="font-display text-2xl font-semibold">CardPulse</p>
            <p className="mt-1 text-xs text-muted">Loading your rewards…</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredOffers =
    categoryFilter === "All" ? offers : offers.filter((offer) => offer.category === categoryFilter);
  const activeCount = offers.filter((offer) => offer.is_active).length;
  const totalEvents = insights?.total_events ?? 0;
  const firstName = account?.holder_name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen">
      <Sidebar account={account} activeSection={activeSection} onNavigate={setActiveSection} />

      <div className="lg:pl-[248px]">
        <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <a href="#overview" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-paper">
                <Activity size={18} strokeWidth={2.4} />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight">CardPulse</span>
            </a>
            <a
              href={`${API_BASE}/docs`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              <BookOpen size={14} /> API docs
            </a>
          </div>

          <main id="overview" className="scroll-mt-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label">{today}</p>
                <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight sm:text-4xl">
                  {greeting}, {firstName}.
                </h1>
                <p className="mt-1.5 text-sm text-muted">
                  Here is how your card is earning today.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip border border-brand/15 bg-brand-soft text-brand-deep">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand" />
                  Live demo
                </span>
                <a
                  href={`${API_BASE}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost hidden sm:inline-flex"
                >
                  API docs <ArrowUpRight size={14} />
                </a>
              </div>
            </header>

            {error && (
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-coral/25 bg-coral/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-coral" />
                  <div>
                    <p className="text-sm font-semibold">Can&apos;t reach the CardPulse API</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {error}. Start the backend on port 8000, then retry.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    loadDashboard();
                  }}
                  className="btn-ghost self-start sm:self-auto"
                >
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            )}

            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <BalanceCard account={account} />
              <MetricCard
                label="Reward points"
                value={formatPoints(account?.points)}
                hint="Includes offer activation bonuses"
                icon={Sparkles}
                accent="#C07A2C"
              />
              <MetricCard
                label="Active offers"
                value={`${activeCount}/${offers.length || 5}`}
                hint="Activated merchant perks"
                icon={Tag}
                accent="#0F5132"
              />
              <MetricCard
                label="Events captured"
                value={formatPoints(totalEvents)}
                hint="Telemetry events logged"
                icon={Radio}
                accent="#3B5BDB"
              />
            </section>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(330px,1fr)]">
              <section id="offers" className="scroll-mt-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="label">Curated for you</p>
                    <h2 className="mt-1 font-display text-2xl font-medium tracking-tight sm:text-3xl">
                      Merchant offers
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Activate a perk, then swipe to earn at the boosted rate.
                    </p>
                  </div>
                  <span className="chip bg-brand-soft text-brand-deep">{activeCount} active</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setCategoryFilter(filter)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        categoryFilter === filter
                          ? "border-ink bg-ink text-paper"
                          : "border-line bg-surface text-muted hover:border-brand/30 hover:text-ink"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {filteredOffers.length === 0 ? (
                  <div className="card mt-4 px-6 py-12 text-center">
                    <p className="text-sm font-medium">No offers in this category</p>
                    <p className="mt-1 text-xs text-muted">Try another category or refresh the page.</p>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {filteredOffers.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        busy={busyOfferId === offer.id}
                        disabled={busyOfferId !== null && busyOfferId !== offer.id}
                        onTrackClick={handleTrackClick}
                        onActivate={handleActivate}
                      />
                    ))}
                  </div>
                )}
              </section>

              <aside className="space-y-6">
                <SwipeForm offers={offers} onSubmit={handleSwipe} lastTx={lastTx} />
                <div id="insights" className="scroll-mt-6">
                  <InsightsPanel insights={insights} offers={offers} />
                </div>
              </aside>
            </div>

            <section id="activity" className="mt-8 scroll-mt-6">
              <TransactionsTable transactions={transactions} />
            </section>

            <footer className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-line pt-5 text-xs text-muted sm:flex-row sm:items-center">
              <p>CardPulse · Smart merchant offers &amp; rewards · demo environment</p>
              <p>
                FastAPI · SQLite · React ·{" "}
                <a
                  href={`${API_BASE}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand hover:underline"
                >
                  OpenAPI docs
                </a>
              </p>
            </footer>
          </main>
        </div>
      </div>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
