"use client"

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useCurrency } from '@/hooks/use-currency'
import { Sparkles, Loader2 } from 'lucide-react'
import { useFirebase, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'
import { useDoc } from '@/firebase'

interface SummaryCardProps {
  income: number
  totalBills: number
  balance: number
  bills?: Array<{ name: string; amount: number; recurring?: boolean }>
}

interface ProfileData {
  householdSize?: number;
  location?: string;
  occupation?: string;
  currency?: string;
}

interface AIRecommendation {
  summary: string;
  recommendations: string[];
  insights?: string;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono font-medium text-lg text-foreground">{value}</p>
    </div>
  )
}

export function SummaryCard({ income, totalBills, balance, bills }: SummaryCardProps) {
  const isNegative = balance < 0;
  const { firestore, user } = useFirebase();
  const currency = useCurrency();
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const profileDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid, 'profile', 'data') : null),
    [firestore, user]
  );

  const { data: profileData } = useDoc<ProfileData>(profileDocRef);

  const getAIRecommendations = async () => {
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income,
          totalBills,
          balance,
          householdSize: profileData?.householdSize,
          location: profileData?.location,
          occupation: profileData?.occupation,
          currency: currency,
          bills: bills?.map(b => ({ name: b.name, amount: b.amount, recurring: b.recurring })),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiRecommendation(data);
        setShowAI(true);
      }
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

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

        <Separator className="bg-border/60" />

        <div className="space-y-3">
          {!showAI ? (
            <Button
              onClick={getAIRecommendations}
              disabled={isLoadingAI}
              variant="outline"
              className="w-full shadow-neumorphic active:shadow-neumorphic-inset"
            >
              {isLoadingAI ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting AI insights...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          ) : aiRecommendation && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Insights
                </h4>
                <Button
                  onClick={() => setShowAI(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                >
                  Hide
                </Button>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground italic">
                  {aiRecommendation.summary}
                </p>
                
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-foreground">Recommendations:</p>
                  <ul className="space-y-1.5">
                    {aiRecommendation.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {aiRecommendation.insights && (
                  <div className="pt-2 mt-2 border-t border-border/40">
                    <p className="text-xs text-muted-foreground">{aiRecommendation.insights}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
