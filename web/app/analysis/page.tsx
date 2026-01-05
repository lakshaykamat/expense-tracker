"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { PageLayout } from "@/components/page-layout";
import { useAnalysisStats } from "@/hooks/useAnalysisStats";
import { useMonthSelection } from "@/hooks/useMonthSelection";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/error-display";
import { CategoryChart } from "@/components/category-chart";
import { SpendingTimelineChart } from "@/components/spending-timeline-chart";
import { formatCurrency } from "@/utils/currency.utils";
import { getProgressColor } from "@/utils/analysis.utils";
import { EmptyState } from "@/components/empty-state";

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
  } = useAnalysisStats(selectedMonth);

  const loading = statsLoading;
  const error = statsError;

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center w-full min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <PageHeader
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            showButton={false}
          />
          <ErrorDisplay
            error={error}
            title="Failed to load analysis data"
            onRetry={() => window.location.reload()}
          />
        </div>
      </PageLayout>
    );
  }

  if (!analysisStats || !analysisStats.budgetExists) {
    return (
      <PageLayout>
        <div className="space-y-6">
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
    totalBudget = 0,
    totalExpenses = 0,
    remainingBudget = 0,
    budgetUsedPercentage = 0,
    categoryBreakdown = [],
    dailySpending = [],
  } = analysisStats;

  return (
    <PageLayout>
      <div className="space-y-6">
        <PageHeader
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          showButton={false}
        />

        <Card>
          <CardContent>
            <div className="space-y-6">
              <div className="text-left">
                <span className="text-xl font-bold text-foreground">
                  {budgetUsedPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={Math.min(budgetUsedPercentage, 100)}
                  className="h-2 [&>div]:bg-transparent"
                />
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${getProgressColor(
                    budgetUsedPercentage
                  )}`}
                  style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-lg font-semibold text-foreground">
                    {formatCurrency(totalExpenses)}
                  </div>
                  <div className="text-xs text-muted-foreground">Spent</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div
                    className={`text-lg font-semibold ${
                      remainingBudget >= 0
                        ? "text-foreground"
                        : "text-destructive"
                    }`}
                  >
                    {formatCurrency(Math.abs(remainingBudget))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {remainingBudget >= 0 ? "Left" : "Over"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Average Spend */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Daily Average Spend
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(dailyAverageSpend)}
                  </span>
                  <span className="text-sm text-muted-foreground">per day</span>
                </div>
              </div>
              {/* Top Spending Categories */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Top Spending Categories
                </h3>
                {topCategories.length > 0 ? (
                  <div className="space-y-3">
                    {topCategories.map((category, index) => (
                      <div
                        key={category.category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {index + 1}.
                          </span>
                          <span className="text-sm text-foreground">
                            {category.category}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(category.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No spending categories
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {categoryBreakdown && categoryBreakdown.length > 0 && (
          <CategoryChart
            categories={categoryBreakdown}
            totalExpenses={totalExpenses}
          />
        )}

        {dailySpending && dailySpending.length > 0 && (
          <SpendingTimelineChart data={dailySpending} month={selectedMonth} />
        )}
      </div>
    </PageLayout>
  );
}
