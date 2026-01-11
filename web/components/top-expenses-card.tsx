"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency.utils";

interface TopExpense {
  title: string;
  amount: number;
}

interface TopExpensesCardProps {
  topExpenses: TopExpense[];
}

export function TopExpensesCard({ topExpenses }: TopExpensesCardProps) {
  return (
    <Card>
      <CardContent>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Top Expenses
          </h3>
          {topExpenses.length > 0 ? (
            <div className="space-y-3">
              {topExpenses.map((expense, index) => (
                <div
                  key={`${expense.title}-${index}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {index + 1}.
                    </span>
                    <span className="text-sm text-foreground truncate">
                      {expense.title}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground flex-shrink-0 ml-4">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
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

