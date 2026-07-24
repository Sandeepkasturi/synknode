import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database, Files, TrendingUp, Zap, HardDrive, Download } from "lucide-react";

interface Stats {
  total_transfers: number;
  total_bytes: number;
  total_downloaded: number;
  unique_visitors: number;
  total_visits: number;
  all_time_files: number;
  all_time_bytes: number;
  all_time_downloaded: number;
  all_time_visitors: number;
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
    // Query enhanced analytics from Nov 2024 to now (also includes all-time totals)
    const startDate = new Date("2024-11-01T00:00:00Z").toISOString();
    const endDate = new Date().toISOString();
    
    const { data } = await supabase.rpc("get_analytics_enhanced", {
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
    { label: "Files Stored", icon: HardDrive, value: compact(stats?.all_time_files ?? 0), sub: `${compact(stats?.total_transfers ?? 0)} this period` },
    { label: "Data Moved", icon: Database, value: formatBytes(stats?.all_time_bytes ?? 0), sub: `${formatBytes(stats?.total_bytes ?? 0)} this period` },
    { label: "Downloaded", icon: Download, value: compact(stats?.all_time_downloaded ?? 0), sub: `${compact(stats?.total_downloaded ?? 0)} this period` },
    { label: "Visitors", icon: Files, value: compact(stats?.all_time_visitors ?? 0), sub: `${compact(stats?.unique_visitors ?? 0)} this period` },
  ];

  return (
    <section aria-label="Site analytics" className="w-full space-y-1.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[9px] uppercase tracking-widest font-medium text-primary/70">Analytics</span>
        <span className="text-[8px] text-muted-foreground/60">All-time + Nov 2024 - Today</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className="group relative rounded-md border border-border/40 bg-card/30 backdrop-blur-sm p-2 hover:border-primary/25 hover:bg-card/50 transition-all"
            >
              <div className="flex items-start justify-between gap-1.5 mb-1">
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground/80 flex-1 leading-tight">{it.label}</span>
                <Icon className="w-2.5 h-2.5 text-primary/50 flex-shrink-0 mt-0.5" />
              </div>
              <div className="font-display text-lg md:text-xl font-bold text-foreground leading-none">
                {it.value}
              </div>
              {it.sub && (
                <div className="text-[7px] text-muted-foreground/60 mt-0.5 leading-tight">
                  {it.sub}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
