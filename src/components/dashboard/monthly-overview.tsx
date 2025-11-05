"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFirebase, useMemoFirebase } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import { useCollection } from '@/firebase'
import { format } from "date-fns"
import { TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MonthData {
  id: string
  monthlyIncome?: number
}

interface MonthlyOverviewProps {
  onMonthSelect?: (monthKey: string) => void
}

export function MonthlyOverview({ onMonthSelect }: MonthlyOverviewProps) {
  const { firestore, user } = useFirebase();

  const monthsCollectionRef = useMemoFirebase(() => 
    user ? query(
      collection(firestore, 'users', user.uid, 'months'),
      orderBy('__name__', 'desc')
    ) : null, 
    [firestore, user]
  );
  
  const { data: months } = useCollection<MonthData>(monthsCollectionRef);

  if (!months || months.length === 0) {
    return (
      <Card className="shadow-neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No monthly data yet. Start by adding your income and bills for this month.
          </p>
        </CardContent>
      </Card>
    )
  }

  const parseMonthKey = (key: string) => {
    const [year, month] = key.split('-')
    return new Date(parseInt(year), parseInt(month) - 1, 1)
  }

  return (
    <Card className="shadow-neumorphic">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Monthly Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {months.map((month) => {
            const monthDate = parseMonthKey(month.id)
            const income = month.monthlyIncome ?? 0
            
            return (
              <Button
                key={month.id}
                variant="ghost"
                className="w-full justify-between h-auto p-4 shadow-neumorphic hover:shadow-neumorphic-inset"
                onClick={() => onMonthSelect?.(month.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="font-semibold">
                      {format(monthDate, 'MMMM yyyy')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Income: ${income.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {income > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
