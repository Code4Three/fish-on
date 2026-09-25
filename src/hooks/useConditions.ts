import { useEffect, useState } from "react";
import { fetchConditionsDays } from "../data/conditions";
import type { ConditionsDay } from "../data/conditions";

export interface UseConditionsResult {
  days: ConditionsDay[];
  loading: boolean;
  error: string | null;
}

// Loads the generated /conditions.json once and exposes loading/error state (AC3).
export function useConditions(): UseConditionsResult {
  const [days, setDays] = useState<ConditionsDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Guard against setting state after the component unmounts or effect re-runs
    fetchConditionsDays()
      .then(result => {
        if (!cancelled) setDays(result);
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load conditions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { days, loading, error };
}
