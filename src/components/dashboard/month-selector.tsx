"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"

interface MonthSelectorProps {
  selectedMonth: Date
  onMonthChange: (date: Date) => void
}

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    onMonthChange(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    onMonthChange(newDate)
  }

  const goToCurrentMonth = () => {
    onMonthChange(new Date())
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return selectedMonth.getMonth() === now.getMonth() && 
           selectedMonth.getFullYear() === now.getFullYear()
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-card shadow-neumorphic">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPreviousMonth}
        className="h-10 w-10"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex flex-col items-center gap-1">
        <h2 className="text-2xl font-bold">
          {format(selectedMonth, 'MMMM yyyy')}
        </h2>
        {!isCurrentMonth() && (
          <Button
            variant="link"
            size="sm"
            onClick={goToCurrentMonth}
            className="text-xs text-muted-foreground"
          >
            Go to current month
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextMonth}
        className="h-10 w-10"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
