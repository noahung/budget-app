"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Label } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Bill } from "@/components/dashboard/balance-view"

interface BalancePieChartProps {
  bills: Bill[] | null
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
    const billList = bills || []
    const total = income
    const data = billList.map((bill, index) => {
      const percentage = total > 0 ? Math.round((bill.amount / total) * 100) : 0
      return {
        name: bill.name,
        value: bill.amount,
        percentage,
        fill: chartColors[index % chartColors.length],
      }
    })

    if (balance > 0) {
      const percentage = total > 0 ? Math.round((balance / total) * 100) : 0
      data.push({
        name: "Remaining",
        value: balance,
        percentage,
        fill: "hsl(var(--accent))",
      })
    }

    return data
  }, [bills, balance, income])

  const chartConfig = React.useMemo(() => {
    const billList = bills || []
    const config: ChartConfig = {
      remaining: {
        label: "Remaining",
        color: "hsl(var(--accent))",
      },
    }
    billList.forEach((bill, index) => {
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
          <div className="space-y-4">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
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
                  label={({ name, percentage }) => `${name} - ${percentage}%`}
                  labelLine={{ stroke: "hsl(var(--foreground))", strokeWidth: 1 }}
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
            
            {/* Custom legend */}
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              {chartData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-xs text-muted-foreground truncate">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[250px] text-muted-foreground text-center p-4">
            <p>Enter your income and some bills to see a breakdown of your spending.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
