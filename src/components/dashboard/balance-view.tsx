"use client"

import { useMemo, useState } from 'react'
import { IncomeCard } from './income-card'
import { BillsList } from './bills-list'
import { SummaryCard } from './summary-card'
import { BalancePieChart } from './balance-pie-chart'
import { MonthlyTrendChart } from './monthly-trend-chart'
import { MonthSelector } from './month-selector'
import { useFirebase, useMemoFirebase } from '@/firebase'
import { collection, doc } from 'firebase/firestore'
import { useCollection, useDoc } from '@/firebase'
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates'

export interface Bill {
  id: string
  name: string
  amount: number,
  paymentDate: number,
  userId?: string
  recurring?: boolean  // If true, bill appears in all future months
  paymentAccount?: string // Bank account used to pay this bill
}

// Helper to get month key in format "YYYY-MM"
function getMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function BalanceView() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const monthKey = getMonthKey(selectedMonth)

  // Get monthly data for selected month
  const monthDataRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid, 'months', monthKey) : null, 
    [firestore, user, monthKey]
  );
  const { data: monthData } = useDoc(monthDataRef);
  const income = monthData?.monthlyIncome ?? 0;

  const billsCollectionRef = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'months', monthKey, 'bills') : null, 
    [firestore, user, monthKey]
  );
  const { data: bills } = useCollection<Omit<Bill, 'id'>>(billsCollectionRef);

  const totalBills = useMemo(() => {
    return (bills || []).reduce((acc, bill) => acc + bill.amount, 0)
  }, [bills])

  const balance = useMemo(() => {
    return income - totalBills
  }, [income, totalBills])

  const handleSetIncome = (newIncome: number) => {
    if (monthDataRef) {
      const incomeValue = isNaN(newIncome) || newIncome < 0 ? 0 : newIncome;
      setDocumentNonBlocking(monthDataRef, { monthlyIncome: incomeValue }, { merge: true });
    }
  };
  
  const addBill = (name: string, amount: number, paymentDate: number, recurring: boolean = false, paymentAccount?: string) => {
    if (!name || isNaN(amount) || amount <= 0 || !billsCollectionRef || isNaN(paymentDate)) return
    const newBill = {
      name,
      amount,
      paymentDate,
      recurring,
      paymentAccount: paymentAccount || undefined
    }
    addDocumentNonBlocking(billsCollectionRef, newBill)
  }

  const deleteBill = (id: string) => {
    if (billsCollectionRef) {
      deleteDocumentNonBlocking(doc(billsCollectionRef, id));
    }
  }

  if (isUserLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 flex flex-col gap-8">
          <IncomeCard income={income} setIncome={handleSetIncome} />
          <BillsList bills={bills} addBill={addBill} deleteBill={deleteBill} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
          <SummaryCard income={income} totalBills={totalBills} balance={balance} bills={bills || []} />
          <BalancePieChart income={income} bills={bills} balance={balance} />
          <MonthlyTrendChart />
        </div>
      </div>
    </div>
  )
}
