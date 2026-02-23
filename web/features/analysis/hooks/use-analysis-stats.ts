import useSWR from "swr";
import { budgetsApi } from "@/lib/api";
import { AnalysisStats } from "@/types";
import { isValidMonthFormat } from "@/utils/validation.utils";
import { extractErrorMessage } from "@/helpers/api.helpers";
import { swrKeys, swrFetcher } from "@/lib/swr";

export function useAnalysisStats(month: string) {
  const cacheKey =
    month && isValidMonthFormat(month) ? swrKeys.analysis.stats(month) : null;

  const {
    data: analysisStats,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<AnalysisStats>(
    cacheKey,
    month ? () => swrFetcher.analysis.getStats(month) : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    analysisStats: analysisStats || null,
    loading: isLoading,
    error: error
      ? extractErrorMessage(error, "Failed to fetch analysis data")
      : null,
    refetch: () => refetch(),
    dailyAverageSpend: analysisStats?.dailyAverageSpend ?? 0,
    topCategories: analysisStats?.topCategories ?? [],
    topExpenses: analysisStats?.topExpenses ?? [],
    weeklyExpenses: analysisStats?.weeklyExpenses ?? [],
  };
}
