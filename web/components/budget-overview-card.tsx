"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/currency.utils";
import { getProgressColor } from "@/utils/analysis.utils";

interface BudgetOverviewCardProps {
  budgetUsedPercentage: number;
  totalExpenses: number;
  remainingBudget: number;
  dailyAverageSpend: number;
}

export function BudgetOverviewCard({
  budgetUsedPercentage,
  totalExpenses,
  remainingBudget,
  dailyAverageSpend,
}: BudgetOverviewCardProps) {
  return (
    <Card>
      <CardContent>
        <div>
          <div className="text-center mt-4 mb-4">
            <span className="text-lg font-bold text-foreground">
              {budgetUsedPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="relative mb-6">
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
          <div className="grid grid-cols-1 min-[380px]:grid-cols-3 gap-2 text-center">
            <div className="bg-[oklch(0.88_0.12_45)]/15 rounded-lg p-3 border border-[oklch(0.75_0.12_45)]/25">
              <div className="text-md font-semibold text-foreground">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-xs text-muted-foreground">Spent</div>
            </div>
            <div className="bg-[oklch(0.88_0.12_165)]/15 rounded-lg p-3 border border-[oklch(0.75_0.12_165)]/25">
              <div
                className={`text-md font-semibold ${
                  remainingBudget >= 0 ? "text-foreground" : "text-destructive"
                }`}
              >
                {formatCurrency(Math.abs(remainingBudget))}
              </div>
              <div className="text-xs text-muted-foreground">
                {remainingBudget >= 0 ? "Left" : "Over"}
              </div>
            </div>
            <div className="bg-[oklch(0.88_0.12_300)]/15 rounded-lg p-3 border border-[oklch(0.75_0.12_300)]/25">
              <div className="text-md font-semibold text-foreground">
                {formatCurrency(dailyAverageSpend)}
              </div>
              <div className="text-xs text-muted-foreground">Daily Average</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
