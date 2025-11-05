import { ai } from './genkit';
import { z } from 'zod';

const RecommendationInputSchema = z.object({
  income: z.number(),
  totalBills: z.number(),
  balance: z.number(),
  householdSize: z.number().optional(),
  location: z.string().optional(),
  occupation: z.string().optional(),
  currency: z.string().optional(),
  bills: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    recurring: z.boolean().optional(),
  })).optional(),
});

const RecommendationOutputSchema = z.object({
  summary: z.string().describe('A brief financial summary of the current month'),
  recommendations: z.array(z.string()).describe('2-3 specific, actionable financial recommendations'),
  insights: z.string().optional().describe('Additional insights based on location, occupation, and household size'),
});

export const financialRecommendationFlow = ai.defineFlow(
  {
    name: 'financialRecommendation',
    inputSchema: RecommendationInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {
    const currency = input.currency || 'USD';
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
    
    const profileContext = input.householdSize || input.location || input.occupation
      ? `\n\nUser Profile:
- Household size: ${input.householdSize || 'Not specified'}
- Location: ${input.location || 'Not specified'}
- Occupation: ${input.occupation || 'Not specified'}`
      : '';

    const billsContext = input.bills && input.bills.length > 0
      ? `\n\nBills breakdown:
${input.bills.map(b => `- ${b.name}: ${currencySymbol}${b.amount.toFixed(2)}${b.recurring ? ' (recurring)' : ''}`).join('\n')}`
      : '';

    const prompt = `You are a helpful personal finance advisor. Analyze the following monthly budget and provide a brief summary and personalized recommendations. Use ${currency} currency and ${currencySymbol} symbol in your response.

Monthly Income: ${currencySymbol}${input.income.toFixed(2)}
Total Bills: ${currencySymbol}${input.totalBills.toFixed(2)}
Remaining Balance: ${currencySymbol}${input.balance.toFixed(2)}${profileContext}${billsContext}

Provide:
1. A brief 1-2 sentence summary of their financial situation
2. 2-3 specific, actionable recommendations to improve their finances (use ${currencySymbol} when mentioning amounts)
3. If profile information is available, include location-specific or occupation-specific insights

Keep recommendations practical, encouraging, and specific to their situation.`;

    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      output: {
        schema: RecommendationOutputSchema,
      },
    });

    return result.output!;
  }
);
