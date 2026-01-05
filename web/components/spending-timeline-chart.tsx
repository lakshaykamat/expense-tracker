"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/utils/currency.utils";

interface TimelineData {
  day: number;
  spending: number;
}

interface SpendingTimelineChartProps {
  data: TimelineData[];
  month: string; // Format: "YYYY-MM"
}

export function SpendingTimelineChart({
  data,
  month,
}: SpendingTimelineChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map((item) => ({
    day: item.day,
    spending: item.spending,
  }));

  const chartConfig = {
    spending: {
      label: "Amount",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const formatDayLabel = (day: number) => {
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year, 10), parseInt(monthNum, 10) - 1, day);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickFormatter={formatDayLabel} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    const day = payload?.[0]?.payload?.day;
                    return day ? formatDayLabel(day) : String(value);
                  }}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="spending"
              stroke="var(--chart-2)"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
