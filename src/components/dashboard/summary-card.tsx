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
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY;
      
      if (!apiKey) {
        console.error('Gemini API key not found');
        return;
      }

      const currencySymbol = currency === 'USD' ? '$' : 
                            currency === 'EUR' ? '€' : 
                            currency === 'GBP' ? '£' : 
                            currency === 'JPY' ? '¥' : 
                            currency === 'CNY' ? '¥' : 
                            currency === 'INR' ? '₹' : 
                            currency === 'KRW' ? '₩' : 
                            currency === 'THB' ? '฿' : 
                            currency === 'VND' ? '₫' : 
                            currency === 'IDR' ? 'Rp' : 
                            currency === 'PHP' ? '₱' : 
                            currency === 'MMK' ? 'K' : 
                            currency;

      const profileContext = profileData?.householdSize || profileData?.location || profileData?.occupation
        ? `\n\nUser Profile:
- Household size: ${profileData.householdSize || 'Not specified'}
- Location: ${profileData.location || 'Not specified'}
- Occupation: ${profileData.occupation || 'Not specified'}`
        : '';

      const billsContext = bills && bills.length > 0
        ? `\n\nBills breakdown:
${bills.map(b => `- ${b.name}: ${currencySymbol}${b.amount.toFixed(2)}${b.recurring ? ' (recurring)' : ''}`).join('\n')}`
        : '';

      const prompt = `You are a helpful personal finance advisor. Analyze the following monthly budget and provide a brief summary and personalized recommendations. Use ${currency} currency and ${currencySymbol} symbol in your response.

Monthly Income: ${currencySymbol}${income.toFixed(2)}
Total Bills: ${currencySymbol}${totalBills.toFixed(2)}
Remaining Balance: ${currencySymbol}${balance.toFixed(2)}${profileContext}${billsContext}

Provide your response in JSON format with this exact structure:
{
  "summary": "A brief 1-2 sentence summary of their financial situation",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "insights": "If profile information is available, include location-specific or occupation-specific insights"
}

Keep recommendations practical, encouraging, and specific to their situation. Use ${currencySymbol} when mentioning amounts.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Extract JSON from markdown code blocks if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;
        
        const aiData = JSON.parse(jsonText);
        setAiRecommendation(aiData);
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
