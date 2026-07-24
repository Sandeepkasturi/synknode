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
  pending_files: number;
  pending_bytes: number;
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
    // Query enhanced analytics from Nov 2024 to now (also includes all-time totals + pending queue)
    const startDate = new Date("2024-11-01T00:00:00Z").toISOString();
    const endDate = new Date().toISOString();
    
    const { data, error } = await supabase.rpc("get_analytics_enhanced", {
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
      .on("postgres_changes", { event: "*", schema: "public", table: "pending_transfers" }, load)
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
    { label: "In Queue", icon: Zap, value: compact(stats?.pending_files ?? 0), sub: `${formatBytes(stats?.pending_bytes ?? 0)} live`, highlight: true },
  ];

  return (
    <section aria-label="Site analytics" className="w-full space-y-1.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[9px] uppercase tracking-widest font-medium text-primary/70">Analytics</span>
        <span className="text-[8px] text-muted-foreground/60">All-time + Nov 2024 - Today</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {items.map((it: any) => {
          const Icon = it.icon;
          const isHighlight = it.highlight;
          return (
            <div
              key={it.label}
              className={`group relative rounded-md border backdrop-blur-sm p-2 hover:border-primary/25 transition-all ${
                isHighlight
                  ? 'border-primary/50 bg-primary/10 hover:bg-primary/15'
                  : 'border-border/40 bg-card/30 hover:bg-card/50'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-1">
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground/80 flex-1 leading-tight">{it.label}</span>
                <Icon className={`w-2.5 h-2.5 flex-shrink-0 mt-0.5 ${isHighlight ? 'text-primary' : 'text-primary/50'}`} />
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
