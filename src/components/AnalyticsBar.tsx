import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database, Files, TrendingUp, Zap } from "lucide-react";

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

export const AnalyticsBar: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pulse, setPulse] = useState(false);

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
    { label: "Total Transfers", icon: TrendingUp, value: compact(stats?.total_transfers ?? 0) },
    { label: "Data Transferred", icon: Database, value: formatBytes(stats?.total_bytes ?? 0) },
    { label: "Total Users", icon: Files, value: compact(stats?.unique_visitors ?? 0) },
    { label: "Active Now", icon: Zap, value: compact(stats?.active_transfers ?? 0) },
  ];

  return (
    <section aria-label="Live site analytics" className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className={`group relative rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm p-3 hover:border-primary/30 hover:bg-card/60 transition-all ${pulse ? "shadow-sm shadow-primary/20" : ""}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground flex-1 leading-tight">{it.label}</span>
                <Icon className="w-3 h-3 text-primary/60 flex-shrink-0 mt-0.5" />
              </div>
              <div className={`font-display text-xl md:text-2xl font-bold text-foreground leading-none transition-transform ${pulse ? "scale-[1.02]" : ""}`}>
                {it.value}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center mt-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-1 h-1 rounded-full bg-primary ${pulse ? "animate-ping" : "animate-pulse"}`} />
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground/70">Live Data</span>
        </div>
      </div>
    </section>
  );
};
