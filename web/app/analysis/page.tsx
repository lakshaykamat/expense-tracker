"use client";

import { PageHeader } from "@/components/page-header";
import { PageLayout } from "@/components/page-layout";
import { useAnalysisStats } from "@/hooks/useAnalysisStats";
import { useMonthSelection } from "@/hooks/useMonthSelection";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/error-display";
import { EmptyState } from "@/components/empty-state";
import { BudgetOverviewCard } from "@/components/budget-overview-card";
import { TopCategoriesCard } from "@/components/top-categories-card";
import { TopExpensesCard } from "@/components/top-expenses-card";

export const dynamic = "force-dynamic";

export default function AnalysisPage() {
  const { selectedMonth, setSelectedMonth, availableMonths } =
    useMonthSelection();
  const {
    analysisStats,
    loading: statsLoading,
    error: statsError,
    dailyAverageSpend,
    topCategories,
    topExpenses,
    refetch,
  } = useAnalysisStats(selectedMonth);

  const loading = statsLoading;
  const error = statsError;

  if (loading) {
    return (
      <PageLayout>
        <div
          className="flex items-center justify-center w-full"
          style={{ minHeight: "calc(100vh - 8rem)" }}
        >
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="space-y-8">
          <PageHeader
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            showButton={false}
          />
          <ErrorDisplay
            error={error}
            title="Failed to load analysis data"
            onRetry={() => refetch()}
          />
        </div>
      </PageLayout>
    );
  }

  if (!analysisStats || !analysisStats.budgetExists) {
    return (
      <PageLayout>
        <div className="space-y-8">
          <PageHeader
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            showButton={false}
          />
          <EmptyState
            title="No budget data"
            description="Create a budget to see your analysis"
            icon={
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
        </div>
      </PageLayout>
    );
  }

  const {
    totalExpenses = 0,
    remainingBudget = 0,
    budgetUsedPercentage = 0,
  } = analysisStats;

  return (
    <PageLayout>
      <div className="space-y-8">
        <PageHeader
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          showButton={false}
        />

        <BudgetOverviewCard
          budgetUsedPercentage={budgetUsedPercentage}
          totalExpenses={totalExpenses}
          remainingBudget={remainingBudget}
          dailyAverageSpend={dailyAverageSpend}
        />

        <TopCategoriesCard topCategories={topCategories} />

        <TopExpensesCard topExpenses={topExpenses} />
      </div>
    </PageLayout>
  );
}
