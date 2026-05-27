"use client";

import { useState } from "react";
import {
  usePortfolioSummary,
  useCreatePortfolio,
  useAddHolding,
  useRemoveHolding,
} from "@/hooks/use-portfolio";
import type { HoldingWithPnL } from "@/types/portfolio";
import { Briefcase, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";

function CreatePortfolioForm({ onCreated }: { onCreated: () => void }) {
  const create = useCreatePortfolio();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate({ name: name.trim() }, { onSuccess: onCreated });
  };

  return (
    <div className="max-w-sm mx-auto text-center space-y-6 py-16">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08]">
        <Briefcase className="h-6 w-6 text-white/40" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">Create your portfolio</h2>
        <p className="text-sm text-white/40 mt-1">
          Track holdings, monitor P&L, and get AI-powered insights.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Portfolio name"
          className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary/50"
          autoFocus
        />
        <button
          type="submit"
          disabled={create.isPending || !name.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
        >
          {create.isPending ? "Creating…" : "Create"}
        </button>
      </form>
      {create.isError && (
        <p className="text-xs text-red-400">Failed to create portfolio. Try again.</p>
      )}
    </div>
  );
}

function AddHoldingForm({
  portfolioId,
  onAdded,
}: {
  portfolioId: string;
  onAdded: () => void;
}) {
  const addHolding = useAddHolding(portfolioId);
  const [form, setForm] = useState({
    asset_symbol: "",
    asset_name: "",
    quantity: "",
    avg_buy_price: "",
    exchange: "Binance",
    market_type: "crypto",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addHolding.mutate(
      {
        asset_symbol: form.asset_symbol.toUpperCase(),
        asset_name: form.asset_name || undefined,
        quantity: parseFloat(form.quantity),
        avg_buy_price: parseFloat(form.avg_buy_price),
        exchange: form.exchange || undefined,
        market_type: form.market_type,
      },
      { onSuccess: onAdded }
    );
  };

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5 space-y-4"
    >
      <p className="text-sm font-medium text-white">Add Holding</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/40">Symbol</label>
          <input
            required
            value={form.asset_symbol}
            onChange={(e) => set("asset_symbol", e.target.value)}
            placeholder="BTC"
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary/50 uppercase"
          />
        </div>
        <div>
          <label className="text-xs text-white/40">Name (optional)</label>
          <input
            value={form.asset_name}
            onChange={(e) => set("asset_name", e.target.value)}
            placeholder="Bitcoin"
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-white/40">Quantity</label>
          <input
            required
            type="number"
            step="any"
            min="0"
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            placeholder="0.5"
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-white/40">Avg Buy Price (USDT)</label>
          <input
            required
            type="number"
            step="any"
            min="0"
            value={form.avg_buy_price}
            onChange={(e) => set("avg_buy_price", e.target.value)}
            placeholder="30000"
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-white/40">Exchange</label>
          <input
            value={form.exchange}
            onChange={(e) => set("exchange", e.target.value)}
            placeholder="Binance"
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-white/40">Market</label>
          <select
            value={form.market_type}
            onChange={(e) => set("market_type", e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-primary/50"
          >
            <option value="crypto">Crypto</option>
            <option value="stock">Stock (PSE)</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={addHolding.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {addHolding.isPending ? "Adding…" : "Add Holding"}
        </button>
      </div>
      {addHolding.isError && (
        <p className="text-xs text-red-400">Failed to add holding. Check inputs and try again.</p>
      )}
    </form>
  );
}

function HoldingRow({
  holding,
  portfolioId,
}: {
  holding: HoldingWithPnL;
  portfolioId: string;
}) {
  const remove = useRemoveHolding(portfolioId);
  const pnl = holding.unrealised_pnl ? parseFloat(holding.unrealised_pnl) : null;
  const currentPrice = holding.current_price ? parseFloat(holding.current_price) : null;

  return (
    <tr className="border-b border-white/[0.03] hover:bg-white/[0.02]">
      <td className="px-4 py-3 pl-5">
        <p className="font-medium text-white">{holding.asset_symbol}</p>
        {holding.asset_name && <p className="text-xs text-white/30">{holding.asset_name}</p>}
      </td>
      <td className="px-4 py-3 text-white/70 tabular-nums">
        {parseFloat(holding.quantity).toLocaleString(undefined, { maximumFractionDigits: 8 })}
      </td>
      <td className="px-4 py-3 text-white/70 tabular-nums">
        ${parseFloat(holding.avg_buy_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </td>
      <td className="px-4 py-3 text-white/70 tabular-nums">
        {currentPrice != null
          ? `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          : "—"}
      </td>
      <td className="px-4 py-3 text-white/70 tabular-nums">
        {holding.current_value
          ? `$${parseFloat(holding.current_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          : "—"}
      </td>
      <td
        className={`px-4 py-3 tabular-nums font-medium ${
          pnl == null ? "text-white/30" : pnl >= 0 ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {pnl != null
          ? `${pnl >= 0 ? "+" : ""}$${Math.abs(pnl).toFixed(2)}`
          : "—"}
        {holding.unrealised_pnl_pct != null && (
          <span className="text-xs ml-1 opacity-70">
            ({holding.unrealised_pnl_pct >= 0 ? "+" : ""}
            {holding.unrealised_pnl_pct.toFixed(1)}%)
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-white/40 tabular-nums">
        {holding.allocation_pct != null ? `${holding.allocation_pct.toFixed(1)}%` : "—"}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => remove.mutate(holding.id)}
          disabled={remove.isPending}
          className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

export default function PortfolioPage() {
  const { data: summary, isLoading, isError, refetch } = usePortfolioSummary();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-lg border border-white/[0.06] bg-white/[0.02] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError || !summary) {
    return <CreatePortfolioForm onCreated={() => refetch()} />;
  }

  const totalValue = summary.total_current_value
    ? parseFloat(summary.total_current_value)
    : null;
  const totalPnl = summary.total_unrealised_pnl
    ? parseFloat(summary.total_unrealised_pnl)
    : null;
  const pnlPct = summary.total_unrealised_pnl_pct;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{summary.portfolio_name}</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {summary.holdings_count} holding{summary.holdings_count !== 1 ? "s" : ""} ·{" "}
            {summary.currency}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Holding
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider">Current Value</p>
          <p className="text-2xl font-bold text-white mt-1">
            {totalValue != null
              ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider">Cost Basis</p>
          <p className="text-2xl font-bold text-white mt-1">
            $
            {parseFloat(summary.total_cost_basis).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider">Unrealised P&L</p>
          <div className="flex items-center gap-2 mt-1">
            <p
              className={`text-2xl font-bold ${
                totalPnl == null
                  ? "text-white"
                  : totalPnl >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {totalPnl != null
                ? `${totalPnl >= 0 ? "+" : ""}$${Math.abs(totalPnl).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}`
                : "—"}
            </p>
            {pnlPct != null &&
              (pnlPct >= 0 ? (
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              ))}
          </div>
          {pnlPct != null && (
            <p
              className={`text-xs mt-0.5 ${pnlPct >= 0 ? "text-emerald-400" : "text-red-400"}`}
            >
              {pnlPct >= 0 ? "+" : ""}
              {pnlPct.toFixed(2)}%
            </p>
          )}
        </div>
      </div>

      {showForm && (
        <AddHoldingForm
          portfolioId={summary.portfolio_id}
          onAdded={() => setShowForm(false)}
        />
      )}

      {/* Holdings table */}
      {summary.holdings.length > 0 ? (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-sm font-medium text-white/60">Holdings</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Asset", "Qty", "Avg Buy", "Price", "Value", "P&L", "Alloc", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs text-white/30 font-medium first:pl-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.holdings.map((h) => (
                  <HoldingRow key={h.id} holding={h} portfolioId={summary.portfolio_id} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center">
          <p className="text-sm text-white/30">
            No holdings yet. Add your first holding above.
          </p>
        </div>
      )}
    </div>
  );
}
