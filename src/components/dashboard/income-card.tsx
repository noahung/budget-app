"use client"

import { Wallet } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface IncomeCardProps {
  income: number
  setIncome: (income: number) => void
}

export function IncomeCard({ income, setIncome }: IncomeCardProps) {
  return (
    <Card className="shadow-neumorphic border-none">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Wallet className="w-8 h-8 text-primary" />
          <div>
            <CardTitle>Monthly Income</CardTitle>
            <CardDescription>Enter your total monthly income after tax.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Label htmlFor="income" className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">£</Label>
          <Input
            id="income"
            type="number"
            value={income || ''}
            onChange={(e) => setIncome(parseFloat(e.target.value))}
            placeholder="2500"
            className="shadow-neumorphic-inset border-none text-2xl font-bold h-16 pl-10 focus-visible:ring-primary"
            aria-label="Monthly income input"
          />
        </div>
      </CardContent>
    </Card>
  )
}
