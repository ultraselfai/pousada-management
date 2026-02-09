"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export interface FinancialChartProps {
  title: string
  description?: string
  data: {
    date: string
    actual: number
    projected?: number
  }[]
  config: ChartConfig
  height?: number
}

export function FinancialChart({
  title,
  description,
  data,
  config,
  height = 300
}: FinancialChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={`w-full aspect-auto h-[${height}px]`}>
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 5)} // Ex: 01/01
            />
            <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
                width={80}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="projected"
              type="natural"
              fill="var(--color-projected)"
              fillOpacity={0.4}
              stroke="var(--color-projected)"
              stackId="a"
            />
            <Area
              dataKey="actual"
              type="natural"
              fill="var(--color-actual)"
              fillOpacity={0.4}
              stroke="var(--color-actual)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
