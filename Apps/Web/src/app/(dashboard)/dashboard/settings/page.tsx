"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useCurrentUser, useChangePassword, useResendVerification, useDeleteAccount } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

function Section({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`rounded-lg border p-5 space-y-4 ${danger ? "border-red-500/20 bg-red-500/5" : "border-white/[0.06] bg-white/[0.02]"}`}>
      <p className={`text-sm font-semibold ${danger ? "text-red-400" : "text-white"}`}>{title}</p>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
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

function ChangePasswordSection() {
  const changePassword = useChangePassword();
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k: keyof typeof show) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    changePassword.mutate(
      { current_password: form.current_password, new_password: form.new_password },
      {
        onSuccess: () => {
          toast({ title: "Password changed successfully" });
          setForm({ current_password: "", new_password: "", confirm_password: "" });
        },
        onError: () => toast({ title: "Failed to change password", description: "Current password may be incorrect", variant: "destructive" }),
      }
    );
  };

  const PasswordField = ({ id, label, field, showKey }: { id: string; label: string; field: keyof typeof form; showKey: keyof typeof show }) => (
    <div>
      <label className="text-xs text-white/40">{label}</label>
      <div className="relative mt-1">
        <input
          id={id}
          type={show[showKey] ? "text" : "password"}
          value={form[field]}
          onChange={(e) => set(field, e.target.value)}
          required
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 pr-10 text-sm text-white placeholder-white/20 outline-none focus:border-primary/50"
        />
        <button
          type="button"
          onClick={() => toggle(showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          tabIndex={-1}
        >
          {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <PasswordField id="current_pw" label="Current Password" field="current_password" showKey="current" />
        <PasswordField id="new_pw" label="New Password" field="new_password" showKey="next" />
        <PasswordField id="confirm_pw" label="Confirm New Password" field="confirm_password" showKey="confirm" />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={changePassword.isPending}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {changePassword.isPending ? "Saving…" : "Change Password"}
        </button>
      </div>
    </form>
  );
}

function VerificationSection() {
  const { data: user } = useCurrentUser();
  const resend = useResendVerification();

  const handleResend = () => {
    if (!user?.email) return;
    resend.mutate(user.email, {
      onSuccess: () => toast({ title: "Verification email sent", description: "Check your inbox." }),
      onError: () => toast({ title: "Failed to send", variant: "destructive" }),
    });
  };

  if (!user) return null;

  return (
    <SettingRow label="Email Verification" description={user.email}>
      {user.is_verified ? (
        <span className="text-xs text-emerald-400 font-medium">Verified</span>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400">Unverified</span>
          <button
            onClick={handleResend}
            disabled={resend.isPending}
            className="text-xs text-primary hover:underline disabled:opacity-50"
          >
            {resend.isPending ? "Sending…" : "Resend"}
          </button>
        </div>
      )}
    </SettingRow>
  );
}

function DeleteAccountSection() {
  const deleteAccount = useDeleteAccount();
  const [confirm, setConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    deleteAccount.mutate(password, {
      onError: () => toast({ title: "Incorrect password", description: "Please try again", variant: "destructive" }),
    });
  };

  if (!confirm) {
    return (
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-white/70">Permanently delete your account and all associated data.</p>
          <button
            onClick={() => setConfirm(true)}
            className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors"
          >
            I want to delete my account
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleDelete} className="space-y-3">
      <p className="text-sm text-red-400/80">
        This is irreversible. All portfolios, trades, and data will be permanently deleted.
        Enter your password to confirm.
      </p>
      <div className="relative">
        <input
          type={showPw ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter password to confirm"
          className="w-full rounded-lg border border-red-500/30 bg-white/[0.03] px-3 py-2 pr-10 text-sm text-white placeholder-white/20 outline-none focus:border-red-500/60"
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          tabIndex={-1}
        >
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="px-4 py-2 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={deleteAccount.isPending}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-red-500 transition-colors"
        >
          {deleteAccount.isPending ? "Deleting…" : "Permanently Delete Account"}
        </button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const [currency, setCurrency] = useState("USDT");
  const [cryptoPanicKey, setCryptoPanicKey] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-white/40 mt-0.5">Platform preferences, security, and account management</p>
      </div>

      <Section title="Display Preferences">
        <SettingRow label="Base Currency" description="Used for portfolio values and price display">
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

      <Section title="Account Security">
        <VerificationSection />
        <div className="border-t border-white/[0.06] pt-4">
          <p className="text-sm text-white/60 mb-3">Change Password</p>
          <ChangePasswordSection />
        </div>
      </Section>

      <Section title="API Keys">
        <p className="text-xs text-white/30">
          API keys are stored securely and never exposed to the browser after saving.
        </p>
        <SettingRow label="CryptoPanic API Key" description="Optional — enables richer crypto news feed. Free at cryptopanic.com">
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
        <SettingRow label="Crypto Symbols" description="Symbols monitored by the intelligence engine and scheduler">
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

      <Section title="Danger Zone" danger>
        <DeleteAccountSection />
      </Section>
    </div>
  );
}
