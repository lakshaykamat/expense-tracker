"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency.utils";
import { budgetsApi } from "@/lib/budgets-api";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyExpense {
  week: number;
  amount: number;
  startDate: string;
  endDate: string;
}

interface WeeklyExpensesCardProps {
  weeklyExpenses: WeeklyExpense[];
  selectedMonth?: string;
}

function formatDateRange(startDate: string, endDate: string) {
  return `${new Date(startDate).getDate()} ${new Date(startDate).toLocaleDateString("en-US", { month: "short" })} - ${new Date(endDate).getDate()} ${new Date(endDate).toLocaleDateString("en-US", { month: "short" })}`;
}

export function WeeklyExpensesCard({
  weeklyExpenses,
}: WeeklyExpensesCardProps) {
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  const expensesWithAllWeeks = weeklyExpenses;

  return (
    <Card>
      <CardContent>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Weekly Expenses
          </h3>
          {expensesWithAllWeeks.length > 0 ? (
            <div className="space-y-3">
              {expensesWithAllWeeks.map((expense, index) => (
                <WeekRow
                  key={`${expense.week}-${expense.startDate}`}
                  expense={expense}
                  index={index}
                  isExpanded={expandedWeek === expense.startDate}
                  onToggle={() =>
                    setExpandedWeek(
                      expandedWeek === expense.startDate ? null : expense.startDate
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No expenses</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WeekRow({
  expense,
  index,
  isExpanded,
  onToggle,
}: {
  expense: WeeklyExpense;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const weekKey = `${expense.startDate}-${expense.endDate}`;
  const { data, isLoading } = useSWR(
    isExpanded ? ["week-details", weekKey] : null,
    () => budgetsApi.getWeekDetails(expense.startDate, expense.endDate)
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-muted-foreground shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {index + 1}.
          </span>
          <span className="text-sm text-foreground">
            Week {expense.week}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            ({formatDateRange(expense.startDate, expense.endDate)})
          </span>
        </div>
        <span className="text-sm font-medium text-foreground shrink-0 ml-4">
          {formatCurrency(expense.amount)}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-2 ml-6">
          {isLoading ? (
            <div className="space-y-2 py-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          ) : data ? (
            <WeekDetails categoryBreakdown={data.categoryBreakdown} />
          ) : (
            <p className="text-sm text-muted-foreground py-1">
              No expenses in this week
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function WeekDetails({
  categoryBreakdown,
}: {
  categoryBreakdown: Array<{ category: string; amount: number }>;
}) {
  if (categoryBreakdown.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-1">
        No expenses in this week
      </p>
    );
  }

  return (
    <div className="space-y-2 py-1">
      {categoryBreakdown.map(({ category, amount }) => (
        <div
          key={category}
          className="flex items-center justify-between text-sm"
        >
          <span className="text-foreground">{category}</span>
          <span className="text-sm font-medium text-foreground">
            {formatCurrency(amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
