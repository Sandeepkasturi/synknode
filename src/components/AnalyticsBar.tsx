import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, Database, Files, Users, Activity } from "lucide-react";

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
    { label: "Total Transfers", icon: ArrowUpRight, value: stats ? compact(stats.total_transfers) : "—", sub: `${compact(stats?.active_transfers ?? 0)} live` },
    { label: "Data Transferred", icon: Database, value: stats ? formatBytes(stats.total_bytes) : "—", sub: `${compact(stats?.total_downloaded ?? 0)} delivered` },
    { label: "Total Usage", icon: Files, value: stats ? compact(stats.total_transfers + stats.total_visits) : "—", sub: "events + visits" },
    { label: "Visitors", icon: Users, value: stats ? compact(stats.unique_visitors) : "—", sub: `${compact(stats?.visitors_24h ?? 0)} today` },
  ];

  return (
    <section aria-label="Live site analytics" className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px]  text-muted-foreground">
          <span className={`w-1.5 h-1.5 rounded-full bg-primary ${pulse ? "animate-ping" : "animate-pulse"}`} />
          Live Analytics
        </div>
        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className="group relative min-h-32 rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px]  text-muted-foreground">{it.label}</span>
                <Icon className="w-3.5 h-3.5 text-primary/70" />
              </div>
               <div className={`font-display text-2xl font-bold text-foreground leading-none transition-transform sm:text-3xl ${pulse ? "scale-[1.03]" : ""}`}>
                {it.value}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">{it.sub}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
