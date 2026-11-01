import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, Database, Files, Users, Send } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Stats {
  total_transfers: number;
  total_bytes: number;
  total_downloaded: number;
  active_transfers: number;
  unique_visitors: number;
  total_visits: number;
  visitors_24h: number;
}

const formatBytes = (b: number) => {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), u.length - 1);
  return `${(b / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${u[i]}`;
};

const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

interface TrendPoint { day: string; transfers: number }

export const AnalyticsBar: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [pulse, setPulse] = useState(false);

  const loadTrend = async () => {
    const since = new Date(Date.now() - 6 * 24 * 3600 * 1000);
    since.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("transfer_events")
      .select("created_at")
      .gte("created_at", since.toISOString());
    if (!data) return;
    const counts = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(since.getTime() + i * 24 * 3600 * 1000);
      counts.set(d.toISOString().slice(0, 10), 0);
    }
    for (const row of data as { created_at: string }[]) {
      const key = row.created_at.slice(0, 10);
      if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
    }
    setTrend([...counts.entries()].map(([date, transfers]) => ({
      day: new Date(`${date}T00:00:00`).toLocaleDateString("en", { weekday: "short" }),
      transfers,
    })));
  };

  const load = async () => {
    const { data } = await supabase.rpc("get_site_analytics");
    if (data) {
      setStats(data as unknown as Stats);
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }
  };

  useEffect(() => {
    load();
    loadTrend();
    const iv = setInterval(load, 15000);

    const channel = supabase
      .channel("site-analytics")
      .on("postgres_changes", { event: "*", schema: "public", table: "transfer_events" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_visits" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "pending_transfers" }, load)
      .subscribe();

    return () => {
      clearInterval(iv);
      supabase.removeChannel(channel);
    };
  }, []);

  const items = [
    { label: "Total Transfers", icon: ArrowUpRight, value: stats ? compact(stats.total_transfers) : "—", sub: `${compact(stats?.active_transfers ?? 0)} live` },
    { label: "Data Transferred", icon: Database, value: stats ? formatBytes(stats.total_bytes) : "—", sub: `${compact(stats?.total_downloaded ?? 0)} delivered` },
    { label: "Total Usage", icon: Files, value: stats ? compact(stats.total_transfers + stats.total_visits) : "—", sub: "events + visits" },
    { label: "Visitors", icon: Users, value: stats ? compact(stats.unique_visitors) : "—", sub: `${compact(stats?.visitors_24h ?? 0)} today` },
  ];

  const hasTrend = useMemo(() => trend.some(p => p.transfers > 0), [trend]);

  return (
    <section aria-label="Live site analytics" className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.label} className="glass-card p-4 transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/12 text-primary"><Icon className="w-4 h-4" /></span>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <div className={`font-display text-2xl font-bold text-foreground leading-none transition-transform sm:text-3xl ${pulse ? "scale-[1.03]" : ""}`}>
                {it.value}
              </div>
              <p className="text-[10px] font-medium text-muted-foreground mt-1.5">{it.label}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">{it.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Transfer Trend</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 text-success border border-success/15 px-2.5 py-1 text-[10px] font-semibold">
            <span className={`w-1.5 h-1.5 rounded-full bg-success ${pulse ? "animate-ping" : "animate-pulse"}`} />
            Live
          </span>
        </div>
        {hasTrend ? (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(24, 92%, 56%)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(24, 92%, 56%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--glass-border))", background: "hsl(var(--card))", fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  formatter={(value: number) => [`${value} transfer${value === 1 ? "" : "s"}`, null]}
                />
                <Area type="monotone" dataKey="transfers" stroke="hsl(24, 92%, 52%)" strokeWidth={2.5} fill="url(#trendFill)" dot={{ r: 3, fill: "hsl(24, 92%, 52%)" }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-44 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Send className="w-5 h-5 text-primary/60" />
            <p className="text-xs">Transfers in the last 7 days will chart here.</p>
          </div>
        )}
      </div>
    </section>
  );
};
