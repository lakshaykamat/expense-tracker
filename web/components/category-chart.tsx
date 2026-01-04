"use client";

import { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!categories || categories.length === 0) {
    return null;
  }

  const chartData = categories.map((item) => ({
    category: item.category,
    amount: item.amount,
    count: item.count,
    percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0,
  }));

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={false}
              width={isMobile ? 60 : 100}
              tick={{ fontSize: isMobile ? 11 : 12 }}
              tickFormatter={(value) => {
                // Truncate labels that would overflow (mobile: ~8-10 chars, desktop: ~12-15 chars)
                if (isMobile) {
                  return value.length > 10
                    ? value.substring(0, 8) + "..."
                    : value;
                }
                return value.length > 14
                  ? value.substring(0, 12) + "..."
                  : value;
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Bar dataKey="amount" radius={4} fill="var(--color-amount)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
