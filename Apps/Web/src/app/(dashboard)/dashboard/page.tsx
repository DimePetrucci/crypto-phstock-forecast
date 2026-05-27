import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-assisted investment intelligence — probability-based analysis
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Portfolio Value", value: "—", sub: "Connect portfolio to track" },
          { label: "Today's P&L", value: "—", sub: "No trades recorded yet" },
          { label: "Win Rate", value: "—", sub: "Based on trade history" },
          { label: "Active Alerts", value: "0", sub: "No active signals" },
        ].map(({ label, value, sub }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Platform Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Phase 1 foundation active. Market data engine, technical analysis, and AI reasoning
            modules are being built in subsequent phases.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
