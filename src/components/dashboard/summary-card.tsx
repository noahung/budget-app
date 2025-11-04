"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'

interface SummaryCardProps {
  income: number
  totalBills: number
  balance: number
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono font-medium text-lg text-foreground">{value}</p>
    </div>
  )
}

export function SummaryCard({ income, totalBills, balance }: SummaryCardProps) {
  const isNegative = balance < 0;

  return (
    <Card className="shadow-neumorphic border-none">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>Your financial overview for the month.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <SummaryRow label="Total Income" value={formatCurrency(income)} />
          <SummaryRow label="Total Bills" value={formatCurrency(totalBills)} />
        </div>
        <Separator className="bg-border/60" />
        <div className="flex justify-between items-center py-2 rounded-lg">
          <p className="text-lg font-bold">Remaining Balance</p>
          <p className={`text-2xl font-bold font-mono ${isNegative ? 'text-destructive' : 'text-accent-foreground'}`} style={!isNegative ? {color: 'hsl(var(--accent))'} : {}}>
            {formatCurrency(balance)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
