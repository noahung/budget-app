"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFirebase, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy, limit } from 'firebase/firestore'
import { useCollection } from '@/firebase'
import { useCurrency } from '@/hooks/use-currency'
import { CURRENCY_SYMBOLS } from '@/lib/currency'
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface MonthData {
  id: string
  monthlyIncome?: number
}

interface Bill {
  amount: number
}

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  bills: {
    label: "Bills",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function MonthlyTrendChart() {
  const { firestore, user } = useFirebase();
  const currency = useCurrency();
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  const monthsCollectionRef = useMemoFirebase(() => 
    user ? query(
      collection(firestore, 'users', user.uid, 'months'),
      orderBy('__name__', 'desc'),
      limit(6)
    ) : null, 
    [firestore, user]
  );
  
  const { data: months, isLoading } = useCollection<MonthData>(monthsCollectionRef);

  // Format data for the chart
  const chartData = months
    ? [...months].reverse().map((month) => {
        const monthKey = month.id
        const [year, monthNum] = monthKey.split('-')
        const monthDate = new Date(parseInt(year), parseInt(monthNum) - 1)
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })
        
        return {
          month: monthName,
          income: month.monthlyIncome || 0,
          bills: 0, // We'll need to fetch bills separately in a future enhancement
        }
      })
    : []

  if (isLoading) {
    return (
      <Card className="shadow-neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!chartData.length) {
    return (
      <Card className="shadow-neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No data yet. Income and bills will appear here over time.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-neumorphic">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Monthly Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${currencySymbol}${value}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillBills" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-bills)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-bills)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              fillOpacity={0.4}
              stroke="var(--color-income)"
              stackId="a"
            />
            <Area
              dataKey="bills"
              type="natural"
              fill="url(#fillBills)"
              fillOpacity={0.4}
              stroke="var(--color-bills)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
