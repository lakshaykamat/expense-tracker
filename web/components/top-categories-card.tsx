"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency.utils";
import type { CategoryBreakdown } from "@/types";

interface TopCategoriesCardProps {
  topCategories: CategoryBreakdown[];
}

export function TopCategoriesCard({ topCategories }: TopCategoriesCardProps) {
  return (
    <Card>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

