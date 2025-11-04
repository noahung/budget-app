"use client"

import { useState, useMemo } from 'react'
import { IncomeCard } from './income-card'
import { BillsList } from './bills-list'
import { SummaryCard } from './summary-card'
import { BalancePieChart } from './balance-pie-chart'

export interface Bill {
  id: string
  name: string
  amount: number
}

export function BalanceView() {
  const [income, setIncome] = useState<number>(0)
  const [bills, setBills] = useState<Bill[]>([
    { id: '1', name: 'Mortgage/Rent', amount: 1200 },
    { id: '2', name: 'Electricity', amount: 75 },
    { id: '3', name: 'Groceries', amount: 400 },
  ])

  const totalBills = useMemo(() => {
    return bills.reduce((acc, bill) => acc + bill.amount, 0)
  }, [bills])

  const balance = useMemo(() => {
    return income - totalBills
  }, [income, totalBills])

  const handleSetIncome = (newIncome: number) => {
    setIncome(isNaN(newIncome) || newIncome < 0 ? 0 : newIncome);
  };
  
  const addBill = (name: string, amount: number) => {
    if (!name || isNaN(amount) || amount <= 0) return
    const newBill: Bill = {
      id: crypto.randomUUID(),
      name,
      amount,
    }
    setBills([...bills, newBill])
  }

  const deleteBill = (id: string) => {
    setBills(bills.filter((bill) => bill.id !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 flex flex-col gap-8">
        <IncomeCard income={income} setIncome={handleSetIncome} />
        <BillsList bills={bills} addBill={addBill} deleteBill={deleteBill} />
      </div>
      <div className="lg:col-span-2 flex flex-col gap-8">
        <SummaryCard income={income} totalBills={totalBills} balance={balance} />
        <BalancePieChart income={income} bills={bills} balance={balance} />
      </div>
    </div>
  )
}
