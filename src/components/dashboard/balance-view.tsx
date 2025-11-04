"use client"

import { useState, useMemo, useEffect } from 'react'
import { IncomeCard } from './income-card'
import { BillsList } from './bills-list'
import { SummaryCard } from './summary-card'
import { BalancePieChart } from './balance-pie-chart'
import { useFirebase } from '@/firebase'
import { collection, doc } from 'firebase/firestore'
import { useCollection, useDoc } from '@/firebase'
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login'
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates'

export interface Bill {
  id: string
  name: string
  amount: number,
  userId?: string
}

export function BalanceView() {
  const { auth, firestore, user, isUserLoading } = useFirebase();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const userRef = useMemo(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userData } = useDoc(userRef);
  const income = userData?.monthlyIncome ?? 0;

  const billsCollectionRef = useMemo(() => user ? collection(firestore, 'users', user.uid, 'bills') : null, [firestore, user]);
  const { data: bills = [] } = useCollection<Omit<Bill, 'id'>>(billsCollectionRef);

  const totalBills = useMemo(() => {
    return (bills || []).reduce((acc, bill) => acc + bill.amount, 0)
  }, [bills])

  const balance = useMemo(() => {
    return income - totalBills
  }, [income, totalBills])

  const handleSetIncome = (newIncome: number) => {
    if (userRef) {
      const incomeValue = isNaN(newIncome) || newIncome < 0 ? 0 : newIncome;
      setDocumentNonBlocking(userRef, { monthlyIncome: incomeValue }, { merge: true });
    }
  };
  
  const addBill = (name: string, amount: number) => {
    if (!name || isNaN(amount) || amount <= 0 || !billsCollectionRef) return
    const newBill = {
      name,
      amount,
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
