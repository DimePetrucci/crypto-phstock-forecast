"use client";

import { useState } from "react";
import { useTrades, useCreateTrade, useDeleteTrade } from "@/hooks/use-journal";
import { usePortfolios } from "@/hooks/use-portfolio";
import type { TradeRead, TradeCategory } from "@/types/trade";
import { Plus, Trash2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES: { value: TradeCategory; label: string }[] = [
  { value: "swing", label: "Swing" },
  { value: "scalp", label: "Scalp" },
  { value: "dca", label: "DCA" },
  { value: "long-term", label: "Long-term" },
  { value: "short", label: "Short" },
  { value: "spot", label: "Spot" },
  { value: "custom", label: "Custom" },
];

const EXCHANGES = ["Binance", "Coins.ph", "BPI Trade", "COL Financial", "First Metro Sec", "Other"];

const MARKET_TYPES = [
  { value: "crypto", label: "Crypto" },
  { value: "stock", label: "PH Stock" },
];

function TradeRow({ trade, onDelete, deleting }: { trade: TradeRead; onDelete: () => void; deleting: boolean }) {
  const pnl = trade.pnl_amount ? parseFloat(trade.pnl_amount) : null;
  const pnlPct = trade.pnl_percentage ? parseFloat(trade.pnl_percentage) : null;
  const entryPrice =
    trade.trade_type === "buy"
      ? trade.buy_price ? parseFloat(trade.buy_price) : null
      : trade.sell_price ? parseFloat(trade.sell_price) : null;
  const investAmt = trade.investment_amount ? parseFloat(trade.investment_amount) : null;

  return (
    <tr className="border-b border-white/[0.03] hover:bg-white/[0.02]">
      <td className="px-4 py-3 pl-5">
        <p className="font-medium text-white">{trade.asset_symbol}</p>
        {trade.asset_name && <p className="text-xs text-white/30">{trade.asset_name}</p>}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          trade.trade_type === "buy" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
        }`}>
          {trade.trade_type.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3">
        {trade.category && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50">
            {trade.category}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-white/70 tabular-nums text-sm">
        {parseFloat(trade.quantity).toLocaleString(undefined, { maximumFractionDigits: 8 })}
      </td>
      <td className="px-4 py-3 text-white/70 tabular-nums text-sm">
        {entryPrice != null ? `$${entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
      </td>
      <td className="px-4 py-3 text-white/50 tabular-nums text-sm">
        {investAmt != null ? `$${investAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
      </td>
      <td className="px-4 py-3 text-white/50 text-xs">{trade.exchange}</td>
      <td className="px-4 py-3 text-white/40 text-xs">
        {trade.fees_paid ? `$${parseFloat(trade.fees_paid).toFixed(4)}` : "—"}
      </td>
      <td className={`px-4 py-3 tabular-nums font-medium text-sm ${
        pnl == null ? "text-white/30" : pnl >= 0 ? "text-emerald-400" : "text-red-400"
      }`}>
        {pnl != null ? (
          <>
            {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(2)}
            {pnlPct != null && (
              <span className="text-xs ml-1 opacity-70">({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)</span>
            )}
          </>
        ) : "—"}
      </td>
      <td className="px-4 py-3 text-white/30 text-xs">
        {trade.entry_at ? format(new Date(trade.entry_at), "MMM d, yy") : format(new Date(trade.created_at), "MMM d, yy")}
      </td>
      <td className="px-4 py-3 max-w-[100px] truncate text-xs text-white/30">{trade.notes ?? "—"}</td>
      <td className="px-4 py-3">
        <button onClick={onDelete} disabled={deleting} className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-50">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function AddTradeForm({ portfolioId, onAdded }: { portfolioId: string; onAdded: () => void }) {
  const createTrade = useCreateTrade();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState({
    asset_symbol: "",
    asset_name: "",
    trade_type: "buy" as "buy" | "sell",
    market_type: "crypto",
    category: "" as TradeCategory | "",
    buy_price: "",
    sell_price: "",
    quantity: "",
    investment_amount: "",
    fees_paid: "",
    exchange: "Binance",
    entry_at: "",
    notes: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTrade.mutate(
      {
        portfolio_id: portfolioId,
        asset_symbol: form.asset_symbol.toUpperCase(),
        asset_name: form.asset_name || undefined,
        trade_type: form.trade_type,
        market_type: form.market_type,
        category: form.category || undefined,
        buy_price: form.buy_price ? parseFloat(form.buy_price) : undefined,
        sell_price: form.sell_price ? parseFloat(form.sell_price) : undefined,
        quantity: parseFloat(form.quantity),
        investment_amount: form.investment_amount ? parseFloat(form.investment_amount) : undefined,
        fees_paid: form.fees_paid ? parseFloat(form.fees_paid) : 0,
        exchange: form.exchange,
        entry_at: form.entry_at ? new Date(form.entry_at).toISOString() : undefined,
        notes: form.notes || undefined,
      },
      { onSuccess: onAdded }
    );
  };

  const fieldClass = "mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary/50";
  const selectClass = `${fieldClass} bg-[#0a0a0a]`;

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <p className="text-sm font-medium text-white">Record Trade</p>

      {/* Core fields */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-white/40">Symbol *</label>
          <input required value={form.asset_symbol} onChange={(e) => set("asset_symbol", e.target.value)}
            placeholder="BTC" className={`${fieldClass} uppercase`} />
        </div>
        <div>
          <label className="text-xs text-white/40">Asset Name</label>
          <input value={form.asset_name} onChange={(e) => set("asset_name", e.target.value)}
            placeholder="Bitcoin" className={fieldClass} />
        </div>
        <div>
          <label className="text-xs text-white/40">Market</label>
          <select value={form.market_type} onChange={(e) => set("market_type", e.target.value)} className={selectClass}>
            {MARKET_TYPES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40">Category</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value as TradeCategory | "")} className={selectClass}>
            <option value="">— none —</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-white/40">Type</label>
          <select value={form.trade_type} onChange={(e) => set("trade_type", e.target.value as "buy" | "sell")} className={selectClass}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40">Platform</label>
          <select value={form.exchange} onChange={(e) => set("exchange", e.target.value)} className={selectClass}>
            {EXCHANGES.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40">Entry Date & Time</label>
          <input type="datetime-local" value={form.entry_at} onChange={(e) => set("entry_at", e.target.value)}
            className={`${fieldClass} [color-scheme:dark]`} />
        </div>
        <div>
          <label className="text-xs text-white/40">Fees Paid</label>
          <input type="number" step="any" min="0" value={form.fees_paid} onChange={(e) => set("fees_paid", e.target.value)}
            placeholder="0.00" className={fieldClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-white/40">
            {form.trade_type === "buy" ? "Buy Price" : "Sell Price"}
          </label>
          {form.trade_type === "buy" ? (
            <input type="number" step="any" min="0" value={form.buy_price} onChange={(e) => set("buy_price", e.target.value)}
              placeholder="Entry price" className={fieldClass} />
          ) : (
            <input type="number" step="any" min="0" value={form.sell_price} onChange={(e) => set("sell_price", e.target.value)}
              placeholder="Exit price" className={fieldClass} />
          )}
        </div>
        <div>
          <label className="text-xs text-white/40">Quantity *</label>
          <input required type="number" step="any" min="0" value={form.quantity} onChange={(e) => set("quantity", e.target.value)}
            placeholder="0.5" className={fieldClass} />
        </div>
        <div>
          <label className="text-xs text-white/40">Investment Amount</label>
          <input type="number" step="any" min="0" value={form.investment_amount} onChange={(e) => set("investment_amount", e.target.value)}
            placeholder="Total capital deployed" className={fieldClass} />
        </div>
      </div>

      {/* Advanced toggle */}
      <button type="button" onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
        {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {showAdvanced ? "Hide" : "Show"} additional fields
      </button>

      {showAdvanced && (
        <div>
          <label className="text-xs text-white/40">Notes / Strategy Rationale</label>
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
            placeholder="Trade rationale, setup description, market conditions…"
            rows={2}
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary/50 resize-none" />
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={createTrade.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50">
          <Plus className="h-4 w-4" />
          {createTrade.isPending ? "Saving…" : "Record Trade"}
        </button>
      </div>
      {createTrade.isError && (
        <p className="text-xs text-red-400">Failed to save trade. Ensure a portfolio exists and inputs are valid.</p>
      )}
    </form>
  );
}

export default function JournalPage() {
  const { data: portfolios } = usePortfolios();
  const { data: tradesData, isLoading } = useTrades();
  const deleteTrade = useDeleteTrade();
  const [showForm, setShowForm] = useState(false);

  const activePortfolioId = portfolios?.[0]?.id ?? null;
  const trades = tradesData?.items ?? [];

  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.pnl_amount && parseFloat(t.pnl_amount) > 0).length;
  const losses = trades.filter((t) => t.pnl_amount && parseFloat(t.pnl_amount) < 0).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(0) : null;
  const totalPnl = trades.reduce((acc, t) => acc + (t.pnl_amount ? parseFloat(t.pnl_amount) : 0), 0);
  const totalInvested = trades.reduce((acc, t) => acc + (t.investment_amount ? parseFloat(t.investment_amount) : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Trade Journal</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Record and review your trade history for behavioural analysis
          </p>
        </div>
        {activePortfolioId && (
          <button onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors">
            <Plus className="h-4 w-4" />
            Record Trade
          </button>
        )}
      </div>

      {/* Stats */}
      {totalTrades > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-xs text-white/40">Total Trades</p>
            <p className="text-2xl font-bold text-white mt-1">{totalTrades}</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-xs text-white/40">Win Rate</p>
            <p className="text-2xl font-bold text-white mt-1">{winRate != null ? `${winRate}%` : "—"}</p>
            {wins + losses > 0 && <p className="text-xs text-white/30 mt-0.5">{wins}W / {losses}L</p>}
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-xs text-white/40">Total P&L</p>
            <p className={`text-2xl font-bold mt-1 ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalPnl >= 0 ? "+" : ""}${Math.abs(totalPnl).toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-xs text-white/40">Total Invested</p>
            <p className="text-2xl font-bold text-white mt-1">
              {totalInvested > 0 ? `$${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
            </p>
          </div>
        </div>
      )}

      {showForm && activePortfolioId && (
        <AddTradeForm portfolioId={activePortfolioId} onAdded={() => setShowForm(false)} />
      )}

      {!activePortfolioId && (
        <div className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center space-y-2">
          <BookOpen className="h-8 w-8 text-white/20 mx-auto" />
          <p className="text-sm text-white/40">Create a portfolio first to start recording trades.</p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg border border-white/[0.06] bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && activePortfolioId && trades.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center">
          <p className="text-sm text-white/30">No trades recorded yet. Click &quot;Record Trade&quot; to add your first entry.</p>
        </div>
      )}

      {trades.length > 0 && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-sm font-medium text-white/60">
              Trade History
              <span className="text-white/30 font-normal ml-1 text-xs">({trades.length})</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Asset", "Type", "Category", "Qty", "Price", "Invested", "Platform", "Fees", "P&L", "Date", "Notes", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-white/30 font-medium first:pl-5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <TradeRow
                    key={t.id}
                    trade={t}
                    onDelete={() => deleteTrade.mutate(t.id)}
                    deleting={deleteTrade.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
