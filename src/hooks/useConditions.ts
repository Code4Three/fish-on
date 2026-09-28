import { useEffect, useState } from "react";
import { fetchRuntimeConditions } from "../data/runtimeConditions";
import type { ConditionsDay } from "../data/conditions";

export interface RuntimeLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  timezone: string;
  tide?: string;
  datumOffset?: number;
}

export interface UseConditionsResult {
  days: ConditionsDay[];
  loading: boolean;
  error: string | null;
  current: unknown;
  history: unknown[];
  refreshErrors: Record<string, string>;
}

export function useConditions(location: RuntimeLocation): UseConditionsResult {
  const [days, setDays] = useState<ConditionsDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<unknown>(null);
  const [history, setHistory] = useState<unknown[]>([]);
  const [refreshErrors, setRefreshErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const applyRuntimeData = (result: Awaited<ReturnType<typeof fetchRuntimeConditions>>) => {
      if (cancelled) return;
      setDays(result.days);
      setCurrent(result.current);
      setHistory(result.history);
      setRefreshErrors(result.errors);
      if (result.days.length) setLoading(false);
    };

    fetchRuntimeConditions(location, new Date(), applyRuntimeData)
      .then((result) => {
        applyRuntimeData(result);
        if (!result.days.length) {
          setError("No forecast data is available for this location.");
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load conditions",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  return { days, loading, error, current, history, refreshErrors };
}
