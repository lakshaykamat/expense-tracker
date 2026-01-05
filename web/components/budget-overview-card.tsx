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
          <BudgetProgress percentage={budgetUsedPercentage} />
          <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2 text-center">
            <BugdetOverviewCardStats
              amount={totalExpenses}
              label="Spent"
              variant="spent"
            />
            <BugdetOverviewCardStats
              amount={remainingBudget}
              label="Left"
              variant="left"
            />
            <BugdetOverviewCardStats
              amount={dailyAverageSpend}
              label="Daily Average"
              variant="average"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
const BudgetProgress = ({ percentage }: { percentage: number }) => {
  return (
    <>
      <div className="text-center mt-4 mb-4">
        <span className="text-lg font-bold text-foreground">
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="relative mb-6">
        <Progress
          value={Math.min(percentage, 100)}
          className="h-2 [&>div]:bg-transparent"
        />
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${getProgressColor(
            percentage
          )}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </>
  );
};

const BugdetOverviewCardStats = ({
  amount,
  label,
  variant,
}: {
  amount: number;
  label: string;
  variant: "spent" | "left" | "average";
}) => {
  const getColorClasses = () => {
    switch (variant) {
      case "spent":
        return "bg-[oklch(0.88_0.12_45)]/15 border-[oklch(0.75_0.12_45)]/25";
      case "left":
        return "bg-[oklch(0.88_0.12_165)]/15 border-[oklch(0.75_0.12_165)]/25";
      case "average":
        return "bg-[oklch(0.88_0.12_300)]/15 border-[oklch(0.75_0.12_300)]/25";
    }
  };

  const isLeftVariant = variant === "left";
  const displayAmount = isLeftVariant ? Math.abs(amount) : amount;
  const displayLabel = isLeftVariant && amount < 0 ? "Over" : label;
  const textColor =
    isLeftVariant && amount < 0 ? "text-destructive" : "text-foreground";

  return (
    <div className={`${getColorClasses()} rounded-lg p-3 border text-center`}>
      <div className={`text-md font-semibold ${textColor}`}>
        {formatCurrency(displayAmount)}
      </div>
      <div className="text-xs text-muted-foreground">{displayLabel}</div>
    </div>
  );
};
