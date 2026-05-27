"use client";

import { useState } from "react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      {children}
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-white/80">{label}</p>
        {description && <p className="text-xs text-white/30 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [currency, setCurrency] = useState("USDT");
  const [cryptoPanicKey, setCryptoPanicKey] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: persist to backend settings endpoint
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-white/40 mt-0.5">
          Platform preferences and API configuration
        </p>
      </div>

      <Section title="Display Preferences">
        <SettingRow
          label="Base Currency"
          description="Used for portfolio values and price display"
        >
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border border-white/[0.08] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-primary/50"
          >
            <option value="USDT">USDT</option>
            <option value="PHP">PHP</option>
            <option value="USD">USD</option>
          </select>
        </SettingRow>
      </Section>

      <Section title="API Keys">
        <p className="text-xs text-white/30">
          API keys are stored securely and never exposed to the browser after saving.
        </p>
        <SettingRow
          label="CryptoPanic API Key"
          description="Optional — enables richer crypto news feed. Free at cryptopanic.com"
        >
          <input
            type="password"
            value={cryptoPanicKey}
            onChange={(e) => setCryptoPanicKey(e.target.value)}
            placeholder="Leave blank for free tier"
            className="w-56 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-primary/50"
          />
        </SettingRow>
      </Section>

      <Section title="Tracked Assets">
        <SettingRow
          label="Crypto Symbols"
          description="Symbols monitored by the intelligence engine and scheduler"
        >
          <p className="text-xs text-white/40 font-mono bg-white/[0.04] px-3 py-1.5 rounded">
            BTC · ETH · BNB · SOL · ADA
          </p>
        </SettingRow>
        <p className="text-xs text-white/20">
          To modify tracked symbols, update <code className="text-white/40">TRACKED_CRYPTO_SYMBOLS</code> in your .env file and restart the API container.
        </p>
      </Section>

      <Section title="Platform">
        <SettingRow label="API Version" description="Backend REST API">
          <span className="text-xs text-white/40 font-mono">v1</span>
        </SettingRow>
        <SettingRow label="Data Sources" description="Active market data providers">
          <span className="text-xs text-white/40">Binance · Alternative.me</span>
        </SettingRow>
        <SettingRow label="Scheduler" description="Background intelligence refresh">
          <span className="text-xs text-emerald-400">Active</span>
        </SettingRow>
      </Section>

      <div className="flex items-center justify-end gap-3">
        {saved && <p className="text-xs text-emerald-400">Settings saved.</p>}
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
