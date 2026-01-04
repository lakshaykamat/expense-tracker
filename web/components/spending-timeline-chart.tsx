"use client";

import { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    if (isMobile) {
      // On mobile, show only day number (e.g., "1", "2")
      return date.getDate().toString();
    }
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
              tickMargin={isMobile ? 5 : 10}
              tick={{ fontSize: isMobile ? 11 : 12 }}
              tickFormatter={formatDayLabel}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: isMobile ? 11 : 12 }}
              width={isMobile ? 60 : 80}
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
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
