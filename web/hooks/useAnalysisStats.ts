import { useState, useEffect, useCallback } from "react";
import { budgetsApi } from "@/lib/budgets-api";
import { AnalysisStats } from "@/types";
import { isValidMonthFormat } from "@/utils/validation.utils";
import {
  extractErrorMessage,
  createInitialLoadingState,
  retryWithBackoff,
} from "@/helpers/api.helpers";

export function useAnalysisStats(month: string) {
  const [analysisStats, setAnalysisStats] = useState<AnalysisStats | null>(
    null
  );
  const [loading, setLoading] = useState(() =>
    createInitialLoadingState(month, isValidMonthFormat)
  );
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (monthToFetch: string) => {
    if (!monthToFetch || !isValidMonthFormat(monthToFetch)) {
      setError("Invalid month format");
      setAnalysisStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const stats = await retryWithBackoff(() =>
        budgetsApi.getAnalysisStats(monthToFetch)
      );
      if (stats && typeof stats === "object") {
        setAnalysisStats(stats);
      } else {
        setAnalysisStats(null);
      }
    } catch (err: any) {
      setError(extractErrorMessage(err, "Failed to fetch analysis data"));
      setAnalysisStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (month && isValidMonthFormat(month)) {
      fetchStats(month);
    } else {
      setAnalysisStats(null);
      setLoading(false);
    }
  }, [month, fetchStats]);

  return {
    analysisStats,
    loading,
    error,
    refetch: () => fetchStats(month),
    dailyAverageSpend: analysisStats?.dailyAverageSpend ?? 0,
    topCategories: analysisStats?.topCategories ?? [],
  };
}
