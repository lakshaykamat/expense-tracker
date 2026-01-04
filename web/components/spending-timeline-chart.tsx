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
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  // Format day label as "1 Jan", "2 Jan", etc.
  const formatDayLabel = (day: number) => {
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year, 10), parseInt(monthNum, 10) - 1, day);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Daily Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={formatDayLabel}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    // Get the day from the payload
                    const day = payload?.[0]?.payload?.day;
                    return day ? formatDayLabel(day) : String(value);
                  }}
                />
              }
              cursor={false}
            />
            <Line
              type="monotone"
              dataKey="spending"
              stroke="var(--color-spending)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
