"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency.utils";

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

export function WeeklyExpensesCard({
  weeklyExpenses,
  selectedMonth,
}: WeeklyExpensesCardProps) {
  // Server now returns all weeks with 0 amounts, so just use the data directly
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
              {expensesWithAllWeeks.map((expense, index) => {
                return (
                  <div
                    key={expense.week}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-foreground">
                        Week {expense.week}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({new Date(expense.startDate).getDate()}{" "}
                        {new Date(expense.startDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                          }
                        )}{" "}
                        - {new Date(expense.endDate).getDate()}{" "}
                        {new Date(expense.endDate).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                        )
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No expenses</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
