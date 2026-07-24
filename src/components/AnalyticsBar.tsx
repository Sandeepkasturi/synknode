import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database, Files, TrendingUp, Zap } from "lucide-react";

interface Stats {
  total_transfers: number;
  total_bytes: number;
  total_downloaded: number;
  unique_visitors: number;
  total_visits: number;
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

  const load = async () => {
    // Query analytics from 2025-01-01 to 2026-12-31 (1 year+ period)
    const startDate = new Date("2025-01-01T00:00:00Z").toISOString();
    const endDate = new Date("2026-12-31T23:59:59Z").toISOString();
    
    const { data } = await supabase.rpc("get_analytics_by_date_range", {
      start_date: startDate,
      end_date: endDate,
    });
    
    if (data) {
      setStats(data as unknown as Stats);
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);

    const channel = supabase
      .channel("site-analytics")
      .on("postgres_changes", { event: "*", schema: "public", table: "transfer_events" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_visits" }, load)
      .subscribe();

    return () => {
      clearInterval(iv);
      supabase.removeChannel(channel);
    };
  }, []);

  const items = [
    { label: "Files Transferred", icon: TrendingUp, value: compact(stats?.total_transfers ?? 0) },
    { label: "Total Data Moved", icon: Database, value: formatBytes(stats?.total_bytes ?? 0) },
    { label: "Unique Visitors", icon: Files, value: compact(stats?.unique_visitors ?? 0) },
    { label: "Downloaded", icon: Zap, value: compact(stats?.total_downloaded ?? 0) },
  ];

  return (
    <section aria-label="Site analytics" className="w-full space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] uppercase tracking-widest font-medium text-primary/80">Performance Report</span>
        <span className="text-[9px] text-muted-foreground/70">Jan 2025 - Dec 2026</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className={`group relative rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm p-3 hover:border-primary/30 hover:bg-card/60 transition-all`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground flex-1 leading-tight">{it.label}</span>
                <Icon className="w-3 h-3 text-primary/60 flex-shrink-0 mt-0.5" />
              </div>
              <div className="font-display text-xl md:text-2xl font-bold text-foreground leading-none">
                {it.value}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
