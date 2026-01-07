import useSWR from "swr";
import { budgetsApi } from "@/lib/budgets-api";
import { AnalysisStats } from "@/types";
import { isValidMonthFormat } from "@/utils/validation.utils";
import { extractErrorMessage } from "@/helpers/api.helpers";
import { swrKeys } from "@/lib/swr-config";
import { swrFetcher } from "@/lib/swr-fetcher";

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
  };
}
