import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ParsedTransaction, SpendingAnalysis } from './csvParser';

export interface GeminiAnalysisRequest {
  transactions: ParsedTransaction[];
  analysis: SpendingAnalysis;
  mealPlanBalance?: {
    mealSwipes: number;
    diningDollars: number;
    ruExpress: number;
  };
}

export interface GeminiAnalysisResponse {
  insights: Array<{
    type: 'recommendation' | 'reward' | 'suggestion' | 'alert';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    predictedSavings?: number;
    actionItems?: string[];
  }>;
  summary: string;
  habitStory?: string;
}

function getGeminiModel() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
      return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    } catch {
      return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  } catch {
    return null;
  }
}

export async function getGeminiAnalysis(
  request: GeminiAnalysisRequest
): Promise<GeminiAnalysisResponse> {
  const model = getGeminiModel();
  if (!model) {
    return {
      insights: [],
      summary: 'Insights unavailable (no API key).',
    };
  }
  const { transactions, analysis, mealPlanBalance } = request;
  const prompt = `Provide positive, supportive financial insights for a Rutgers student.
Total spent: $${analysis.totalSpent.toFixed(2)}
Top merchants: ${analysis.topMerchants.slice(0, 3).map(m => `${m.merchant} (${m.count})`).join(', ')}
Top categories: ${Object.entries(analysis.categoryBreakdown).slice(0,3).map(([c, d]) => `${c}: $${d.total.toFixed(2)}`).join(', ')}
Meal swipes: ${mealPlanBalance ? mealPlanBalance.mealSwipes : 'unknown'}

Return JSON only with fields: insights[], summary, habitStory.`;
  const result = await model.generateContent(prompt);
  const text = (await result.response).text();
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return { insights: [], summary: 'Unable to parse model response.' };
}


