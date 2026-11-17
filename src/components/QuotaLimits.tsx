import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock3, HardDrive, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrCreateVisitorId } from "@/lib/analytics";
import { getVisitorQuota, formatQuotaBytes } from "@/lib/transferQuota";

const formatCountdown = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export function QuotaLimits() {
  const visitorId = useMemo(() => getOrCreateVisitorId(), []);
  const [now, setNow] = useState(() => Date.now());
  const quotaQuery = useQuery({
    queryKey: ["visitor-transfer-quota", visitorId],
    queryFn: () => getVisitorQuota(visitorId),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const quota = quotaQuery.data;
  const usedPercent = quota ? Math.min(100, (quota.used_bytes / quota.limit_bytes) * 100) : 0;
  const timeUntilReset = quota?.next_reset_at ? new Date(quota.next_reset_at).getTime() - now : null;

  return (
    <Card role="region" aria-labelledby="quota-limits-title" className="glass-card rounded-2xl">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 p-5 pb-0">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="size-4 text-primary" aria-hidden="true" />
            <CardTitle id="quota-limits-title" className="text-base">Quota and limits</CardTitle>
          </div>
          <CardDescription className="mt-1">Successful transfers count toward your rolling 24-hour allowance.</CardDescription>
        </div>
        <Badge variant="secondary">5 GiB · 24 hours</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-5">
        {quotaQuery.isPending && <Skeleton className="h-16 rounded-xl" aria-label="Loading quota" />}

      {quotaQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>Quota details unavailable</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>We couldn&apos;t load your current usage. Transfers remain subject to the server-side 5 GiB limit.</span>
            <Button type="button" variant="outline" size="sm" onClick={() => quotaQuery.refetch()} disabled={quotaQuery.isFetching}>
              <RefreshCw data-icon="inline-start" className={quotaQuery.isFetching ? "animate-spin" : undefined} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {quota && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-card/70 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Capacity used</p>
              <p className="mt-1 text-xl font-semibold">{formatQuotaBytes(quota.used_bytes)}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/70 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remaining capacity</p>
              <p className="mt-1 text-xl font-semibold">{formatQuotaBytes(quota.remaining_bytes)}</p>
            </div>
          </div>
          <Progress value={usedPercent} className="h-2" aria-label={`${usedPercent.toFixed(0)} percent of transfer quota used`} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>{formatQuotaBytes(quota.limit_bytes)} total rolling capacity</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4" aria-hidden="true" />
              {timeUntilReset === null
                ? "No recent usage is waiting to expire"
                : timeUntilReset <= 0
                  ? "Capacity is refreshing"
                  : `Next capacity release in ${formatCountdown(timeUntilReset)}`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Usage is associated with this browser on this device. Clearing site data or switching browsers creates a new visitor identity.</p>
        </>
      )}
      </CardContent>
    </Card>
  );
}
