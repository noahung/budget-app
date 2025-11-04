"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Bill } from "@/components/dashboard/balance-view"

interface BalancePieChartProps {
  bills: Bill[]
  balance: number
  income: number
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function BalancePieChart({ bills, balance, income }: BalancePieChartProps) {
  const chartData = React.useMemo(() => {
    const data = bills.map((bill, index) => ({
      name: bill.name,
      value: bill.amount,
      fill: chartColors[index % chartColors.length],
    }))

    if (balance > 0) {
      data.push({
        name: "Remaining",
        value: balance,
        fill: "hsl(var(--accent))",
      })
    }

    return data
  }, [bills, balance])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      remaining: {
        label: "Remaining",
        color: "hsl(var(--accent))",
      },
    }
    bills.forEach((bill, index) => {
      config[bill.name] = {
        label: bill.name,
        color: chartColors[index % chartColors.length],
      }
    })
    return config
  }, [bills])

  return (
    <Card className="shadow-neumorphic border-none flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {income > 0 && chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.fill}
                    className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[250px] text-muted-foreground text-center p-4">
            <p>Enter your income and some bills to see a breakdown of your spending.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
