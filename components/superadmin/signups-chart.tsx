"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Inscriptions",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function SignupsChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <AreaChart data={data} margin={{ left: 0, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) =>
            new Date(value).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })
          }
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={32}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value: string) =>
                new Date(value).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              }
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="count"
          type="monotone"
          fill="var(--color-count)"
          fillOpacity={0.15}
          stroke="var(--color-count)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
