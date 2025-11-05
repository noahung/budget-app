"use client"

import * as React from 'react'
import { Plus, Receipt, Trash2, Repeat, Wallet } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Bill } from './balance-view'
import { formatCurrency } from '@/lib/utils'
import { add, format } from 'date-fns'

interface BillsListProps {
  bills: Bill[] | null
  addBill: (name: string, amount: number, paymentDate: number, recurring?: boolean, paymentAccount?: string) => void
  deleteBill: (id: string) => void
}

function getOrdinal(day: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = day % 100;
  return day + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function BillsList({ bills, addBill, deleteBill }: BillsListProps) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const [isRecurring, setIsRecurring] = React.useState(true)
  const [paymentAccount, setPaymentAccount] = React.useState<string>('')
  const [newAccountName, setNewAccountName] = React.useState('')
  const [showNewAccountInput, setShowNewAccountInput] = React.useState(false)
  const billList = bills || [];

  // Get unique payment accounts from existing bills
  const existingAccounts = React.useMemo(() => {
    const accounts = new Set<string>()
    billList.forEach(bill => {
      if (bill.paymentAccount) {
        accounts.add(bill.paymentAccount)
      }
    })
    return Array.from(accounts).sort()
  }, [billList])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('billName') as string
    const amount = parseFloat(formData.get('billAmount') as string)
    const paymentDate = parseInt(formData.get('paymentDate') as string, 10);
    
    const accountToUse = showNewAccountInput && newAccountName ? newAccountName : paymentAccount
    
    addBill(name, amount, paymentDate, isRecurring, accountToUse || undefined)
    formRef.current?.reset()
    setIsRecurring(true)
    setPaymentAccount('')
    setNewAccountName('')
    setShowNewAccountInput(false)
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
        <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
            <Input
              name="paymentDate"
              type="number"
              placeholder="Payment day (1-31)"
              required
              min="1"
              max="31"
              step="1"
              className="shadow-neumorphic-inset border-none focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-account" className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payment Account (Optional)
            </Label>
            {!showNewAccountInput ? (
              <div className="flex gap-2">
                <Select value={paymentAccount} onValueChange={setPaymentAccount}>
                  <SelectTrigger className="shadow-neumorphic-inset border-none">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingAccounts.map((account) => (
                      <SelectItem key={account} value={account}>
                        {account}
                      </SelectItem>
                    ))}
                    <SelectItem value="__new__">+ Create new account</SelectItem>
                  </SelectContent>
                </Select>
                {paymentAccount === '__new__' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNewAccountInput(true)
                      setPaymentAccount('')
                    }}
                  >
                    Add New
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="New account name (e.g., Chase Checking)"
                  className="shadow-neumorphic-inset border-none focus-visible:ring-primary"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewAccountInput(false)
                    setNewAccountName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="recurring" 
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked === true)}
            />
            <Label 
              htmlFor="recurring" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <Repeat className="h-4 w-4" />
              Recurring bill (appears every month)
            </Label>
          </div>

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
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{bill.name}</p>
                    {bill.recurring && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/90 text-white shadow-sm">
                        <Repeat className="h-3 w-3" />
                        Recurring
                      </span>
                    )}
                    {bill.paymentAccount && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                        <Wallet className="h-3 w-3" />
                        {bill.paymentAccount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Due on the {getOrdinal(bill.paymentDate)}</p>
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
