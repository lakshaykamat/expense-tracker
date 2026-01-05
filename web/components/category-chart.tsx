"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/utils/currency.utils";
import type { CategoryBreakdown } from "@/types";

interface CategoryChartProps {
  categories: CategoryBreakdown[];
  totalExpenses: number;
}

export function CategoryChart({
  categories,
  totalExpenses,
}: CategoryChartProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const chartData = categories.map((item) => ({
    category: item.category,
    amount: item.amount,
  }));

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              type="category"
              dataKey="category"
              tickFormatter={(value) => {
                if (value.length > 10) {
                  return value.substring(0, 7) + "...";
                }
                return value;
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="amount" fill="var(--color-amount)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
