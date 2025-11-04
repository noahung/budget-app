"use client"

import * as React from 'react'
import { Plus, Receipt, Trash2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { Bill } from './balance-view'
import { formatCurrency } from '@/lib/utils'

interface BillsListProps {
  bills: Bill[] | null
  addBill: (name: string, amount: number) => void
  deleteBill: (id: string) => void
}

export function BillsList({ bills, addBill, deleteBill }: BillsListProps) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const billList = bills || [];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('billName') as string
    const amount = parseFloat(formData.get('billAmount') as string)
    addBill(name, amount)
    formRef.current?.reset()
  }

  return (
    <Card className="shadow-neumorphic border-none">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Receipt className="w-8 h-8 text-primary" />
          <div>
            <CardTitle>Monthly Bills</CardTitle>
            <CardDescription>Add or remove your recurring bills.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
          <Input
            name="billName"
            placeholder="Bill name (e.g., Internet)"
            required
            className="shadow-neumorphic-inset border-none focus-visible:ring-primary"
          />
          <Input
            name="billAmount"
            type="number"
            placeholder="Amount"
            required
            min="0.01"
            step="0.01"
            className="shadow-neumorphic-inset border-none focus-visible:ring-primary"
          />
          <Button type="submit" className="shadow-neumorphic active:shadow-neumorphic-inset">
            <Plus className="mr-2 h-4 w-4" /> Add Bill
          </Button>
        </form>

        <Separator className="my-4 bg-border/60" />

        <div className="space-y-4">
          {billList.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No bills added yet.</p>
          ) : (
            billList.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div>
                  <p className="font-medium">{bill.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-mono text-foreground">
                    {formatCurrency(bill.amount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBill(bill.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                    aria-label={`Delete ${bill.name} bill`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
