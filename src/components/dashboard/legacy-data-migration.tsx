"use client"

import { useEffect, useState } from 'react'
import { useFirebase, useMemoFirebase } from '@/firebase'
import { collection, doc, getDocs, getDoc, writeBatch } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export function LegacyDataMigration() {
  const { firestore, user } = useFirebase()
  const [hasLegacyData, setHasLegacyData] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationComplete, setMigrationComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkLegacyData = async () => {
      if (!user) return

      try {
        const legacyBillsRef = collection(firestore, 'users', user.uid, 'bills')
        const snapshot = await getDocs(legacyBillsRef)
        setHasLegacyData(!snapshot.empty)
      } catch (err) {
        console.log('No legacy data found or error checking:', err)
      }
    }

    checkLegacyData()
  }, [user, firestore])

  const migrateLegacyData = async () => {
    if (!user) return

    setIsMigrating(true)
    setError(null)

    try {
      const batch = writeBatch(firestore)
      
      // Get current month key (YYYY-MM)
      const now = new Date()
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      // Get legacy bills
      const legacyBillsRef = collection(firestore, 'users', user.uid, 'bills')
      const billsSnapshot = await getDocs(legacyBillsRef)

      // Get legacy user data
      const userDocRef = doc(firestore, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)

      // Migrate income to current month
      if (userDocSnap.exists() && userDocSnap.data()?.monthlyIncome) {
        const monthDocRef = doc(firestore, 'users', user.uid, 'months', monthKey)
        batch.set(monthDocRef, { monthlyIncome: userDocSnap.data()?.monthlyIncome }, { merge: true })
      }

      // Migrate bills to current month as recurring bills
      billsSnapshot.docs.forEach((billDoc) => {
        const billData = billDoc.data()
        const newBillRef = doc(collection(firestore, 'users', user.uid, 'months', monthKey, 'bills'))
        batch.set(newBillRef, {
          ...billData,
          recurring: true // Mark as recurring so it appears in all months
        })
      })

      await batch.commit()
      setMigrationComplete(true)
      setHasLegacyData(false)
      
      // Refresh the page after successful migration
      setTimeout(() => window.location.reload(), 2000)
    } catch (err) {
      console.error('Migration error:', err)
      setError(err instanceof Error ? err.message : 'Migration failed')
    } finally {
      setIsMigrating(false)
    }
  }

  if (!hasLegacyData || migrationComplete) {
    return null
  }

  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Old Data Detected</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          We found your previous income and bills. Would you like to migrate them to the new monthly system?
          Your bills will be marked as recurring and will appear in all future months.
        </p>
        {error && (
          <p className="text-red-600 text-sm mb-2">Error: {error}</p>
        )}
        <Button 
          onClick={migrateLegacyData} 
          disabled={isMigrating}
          size="sm"
        >
          {isMigrating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrating...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Migrate My Data
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
