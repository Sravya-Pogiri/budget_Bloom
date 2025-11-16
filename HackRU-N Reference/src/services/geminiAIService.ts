/**
 * Gemini AI Service for BudgetBloom
 * Uses Google Gemini for advanced financial analysis and predictions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ParsedTransaction, SpendingAnalysis } from './csvParser';
import type { AIInsight, SpendingPrediction } from '../types';

export interface GeminiAnalysisRequest {
  transactions: ParsedTransaction[];
  analysis: SpendingAnalysis;
  currentWeek?: number;
  isExamWeek?: boolean;
  upcomingEvents?: string[];
  mealPlanBalance?: {
    mealSwipes: number;
    diningDollars: number;
    ruExpress: number;
  };
}

export interface GeminiAnalysisResponse {
  predictions: SpendingPrediction[];
  insights: AIInsight[];
  summary: string;
  habitStory?: string;
  futureSimulation?: {
    semesterTotal: number;
    mealPointsExhaustionDate?: string;
    riskAreas: string[];
    projectedSavings: number;
  };
  campusRecommendations?: Array<{
    event: string;
    reason: string;
    savings: number;
  }>;
}

/**
 * Initialize Gemini AI
 */
function getGeminiModel() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ VITE_GEMINI_API_KEY not found. Using mock responses.');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.0-flash (latest model) as specified
    // Falls back gracefully if model not available
    try {
      return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    } catch {
      // Fallback to stable version if 2.0 not available
      console.warn('gemini-2.0-flash not available, using gemini-1.5-flash');
      return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  } catch (error) {
    console.error('Error initializing Gemini:', error);
    return null;
  }
}

/**
 * Get comprehensive AI analysis using Gemini
 */
export async function getGeminiAnalysis(
  request: GeminiAnalysisRequest
): Promise<GeminiAnalysisResponse> {
  const model = getGeminiModel();

  if (!model) {
    return getMockAnalysis(request);
  }

  try {
    const prompt = buildGeminiPrompt(request);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return parseGeminiResponse(text, request);
  } catch (error) {
    console.error('Gemini AI error:', error);
    return getMockAnalysis(request);
  }
}

/**
 * Build comprehensive prompt for Gemini
 */
function buildGeminiPrompt(request: GeminiAnalysisRequest): string {
  const { transactions, analysis, currentWeek, isExamWeek, upcomingEvents, mealPlanBalance } = request;
  
  // Use day of week patterns from analysis
  const dayPatterns = analysis.spendingPatterns.dayOfWeekPatterns || {};
  
  // Find specific day/merchant patterns (e.g., "Starbucks on Thursdays")
  const dayMerchantPatterns: Array<{ day: string; merchant: string; count: number; avgAmount: number }> = [];
  Object.entries(dayPatterns).forEach(([day, data]) => {
    Object.entries(data.merchants).forEach(([merchant, count]) => {
      if (count >= 2) { // At least 2 times on this day
        const merchantTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          const tDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][tDate.getDay()];
          return tDay === day && t.merchant === merchant;
        });
        const avgAmount = merchantTransactions.reduce((sum, t) => sum + t.amount, 0) / merchantTransactions.length;
        dayMerchantPatterns.push({ day, merchant, count, avgAmount });
      }
    });
  });

  const frequentMerchants = analysis.topMerchants
    .filter(m => m.count >= 3)
    .map(m => `${m.merchant}: ${m.count}x/week, $${(m.total / m.count).toFixed(2)} avg`);

  const recentTransactions = transactions.slice(-20);
  const totalSpent = analysis.totalSpent;
  const topCategories = Object.entries(analysis.categoryBreakdown)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5)
    .map(([cat, data]) => `${cat}: $${data.total.toFixed(2)} (${data.count}x, $${data.avg.toFixed(2)} avg)`);

  // Calculate meal swipe usage rate
  const diningTransactions = transactions.filter(t => 
    t.category === 'Dining' && (t.payment_method === 'Meal Plan' || t.payment_method === 'Dining Dollars')
  );
  const offCampusDining = transactions.filter(t => 
    t.category === 'Dining' && t.payment_method !== 'Meal Plan' && t.payment_method !== 'Dining Dollars'
  );

  // Identify necessary expenses (books, rent, supplies) vs discretionary
  const necessaryCategories = ['Books', 'Supplies', 'Pharmacy'];
  const necessarySpent = transactions
    .filter(t => necessaryCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);
  const discretionarySpent = transactions
    .filter(t => !necessaryCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  return `You are a supportive, understanding financial coach for Rutgers students. Be POSITIVE and ENCOURAGING. Never shame them for necessary expenses.

SPENDING DATA:
Total: $${totalSpent.toFixed(2)} across ${transactions.length} transactions
- Necessary expenses (Books, Supplies, Pharmacy): $${necessarySpent.toFixed(2)} ✅ Good job managing essentials!
- Discretionary spending: $${discretionarySpent.toFixed(2)}

Top Categories:
${topCategories.join('\n')}

Frequent Habits (3+ times):
${frequentMerchants.length > 0 ? frequentMerchants.join('\n') : 'None detected'}

Day-Specific Patterns:
${dayMerchantPatterns.length > 0 
  ? dayMerchantPatterns.map(p => `${p.merchant} on ${p.day}: ${p.count}x, $${p.avgAmount.toFixed(2)} avg`).join('\n')
  : 'None detected'}

Recent Transactions:
${recentTransactions.slice(-10).map(t => {
  const date = new Date(t.date);
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  const isNecessary = necessaryCategories.includes(t.category);
  return `${day} ${t.date.split('T')[0]}: $${t.amount.toFixed(2)} at ${t.merchant} (${t.location}) ${isNecessary ? '✅' : ''}`;
}).join('\n')}

MEAL PLAN STATUS:
${mealPlanBalance ? `
- Meal Swipes: ${mealPlanBalance.mealSwipes} remaining
- Dining Dollars: $${mealPlanBalance.diningDollars.toFixed(2)}
- RU Express: $${mealPlanBalance.ruExpress.toFixed(2)}
- On-campus dining: ${diningTransactions.length} transactions ✅
- Off-campus dining: ${offCampusDining.length} transactions ($${offCampusDining.reduce((sum, t) => sum + t.amount, 0).toFixed(2)})
` : 'Not available'}

YOUR TONE:
- ✅ POSITIVE and SUPPORTIVE (like a friend, not a judge)
- ✅ REWARD good behaviors (using meal swipes, paying rent, buying books)
- ✅ SUGGEST alternatives for discretionary spending (not shame necessary expenses)
- ✅ UNDERSTANDING: Books, rent, supplies are necessary - suggest used books, but don't make them feel bad

EXAMPLES OF GOOD INSIGHTS:

Example 1 (Discretionary): "You visit Starbucks on Thursdays 3×. Campus Café has $3 drinks today - save $2.75 by trying it once this week!"

Example 2 (Necessary - Positive): "Great job managing your book expenses! 💚 Consider checking the Rutgers bookstore for used copies next time - could save $10-15 per book."

Example 3 (Reward): "You're using meal swipes well! 🎉 You have ${mealPlanBalance?.mealSwipes || 0} left. Keep it up!"

Example 4 (Understanding): "You spent $42 on books - totally necessary! 📚 Next semester, the bookstore's used section could save you $15-20."

Return JSON ONLY:
{
  "insights": [
    {
      "type": "recommendation" | "reward" | "suggestion",
      "title": "Short positive title (max 6 words)",
      "message": "ONE encouraging sentence with exact numbers. Be supportive, not judgmental. Max 2 sentences.",
      "priority": "high" | "medium" | "low",
      "predictedSavings": number (only if applicable),
      "actionItems": ["One friendly action"]
    }
  ],
  "summary": "ONE positive sentence celebrating their financial awareness",
  "habitStory": "ONE encouraging sentence about their habits",
  "futureSimulation": {
    "semesterTotal": number,
    "mealPointsExhaustionDate": "MM/DD/YYYY or null",
    "riskAreas": ["risk 1", "risk 2"],
    "projectedSavings": number
  },
  "campusRecommendations": [
    {
      "event": "Specific campus alternative",
      "reason": "Why this helps (one sentence)",
      "savings": number
    }
  ]
}

RULES:
- MAX 3-4 insights
- REWARD necessary expenses (books, rent) - celebrate them!
- SUGGEST alternatives for discretionary spending (Starbucks, DoorDash)
- NEVER shame or judge
- Be understanding: "Books are necessary, but here's a tip..."
- Use positive emojis/celebrations for good behaviors
- Focus on opportunities, not problems

Return ONLY JSON.`;
}

/**
 * Parse Gemini response
 */
function parseGeminiResponse(text: string, request: GeminiAnalysisRequest): GeminiAnalysisResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        predictions: parsed.predictions || [],
        insights: parsed.insights || [],
        summary: parsed.summary || '',
        habitStory: parsed.habitStory,
        futureSimulation: parsed.futureSimulation,
        campusRecommendations: parsed.campusRecommendations,
      };
    }
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
  }

  // Fallback to mock
  return getMockAnalysis(request);
}

/**
 * Mock analysis for when Gemini is not available
 */
function getMockAnalysis(request: GeminiAnalysisRequest): GeminiAnalysisResponse {
  const { analysis, transactions, mealPlanBalance } = request;
  
  // Find most frequent merchant
  const topMerchant = analysis.topMerchants[0];
  const frequentMerchant = topMerchant && topMerchant.count >= 3 ? topMerchant : null;
  
  // Calculate off-campus dining vs on-campus
  const offCampusDining = transactions.filter(t => 
    t.category === 'Dining' && t.payment_method !== 'Meal Plan' && t.payment_method !== 'Dining Dollars'
  );
  const offCampusTotal = offCampusDining.reduce((sum, t) => sum + t.amount, 0);
  const avgOffCampus = offCampusDining.length > 0 ? offCampusTotal / offCampusDining.length : 0;
  
  // Calculate meal swipe exhaustion
  const avgMealSwipeUsage = transactions.filter(t => t.payment_method === 'Meal Plan').length;
  const daysWithData = Math.max(Object.keys(analysis.dailySpending).length, 1);
  const dailyMealSwipeRate = avgMealSwipeUsage / daysWithData;
  const mealSwipeDaysRemaining = mealPlanBalance && dailyMealSwipeRate > 0
    ? Math.floor(mealPlanBalance.mealSwipes / dailyMealSwipeRate)
    : null;
  const exhaustionDate = mealSwipeDaysRemaining && mealSwipeDaysRemaining < 120
    ? new Date(Date.now() + mealSwipeDaysRemaining * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : null;

  const insights: AIInsight[] = [];
  
  // Identify necessary vs discretionary spending
  const necessaryCategories = ['Books', 'Supplies', 'Pharmacy'];
  const bookSpending = transactions.filter(t => t.category === 'Books');
  const bookTotal = bookSpending.reduce((sum, t) => sum + t.amount, 0);
  
  // Insight 1: Reward necessary expenses (Books, Supplies)
  if (bookTotal > 0) {
    const avgBookPrice = bookTotal / bookSpending.length;
    insights.push({
      type: 'reward',
      title: 'Managing Essentials Well',
      message: `You spent $${bookTotal.toFixed(2)} on books - totally necessary! 📚 Next semester, check the Rutgers bookstore's used section to save $${(avgBookPrice * 0.3).toFixed(2)} per book.`,
      priority: 'low',
      predictedSavings: avgBookPrice * 0.3 * bookSpending.length,
      actionItems: ['Check bookstore used section next time'],
    });
  }

  // Insight 2: Frequent discretionary merchant (only if not necessary)
  if (frequentMerchant && !necessaryCategories.some(cat => frequentMerchant.merchant.includes(cat))) {
    const avgAmount = frequentMerchant.total / frequentMerchant.count;
    const weeklyCost = avgAmount * frequentMerchant.count;
    const savings = avgAmount * 0.4; // Campus alternative saves 40%
    
    insights.push({
      type: 'suggestion',
      title: 'Smart Substitution Opportunity',
      message: `You visit ${frequentMerchant.merchant} ${frequentMerchant.count}× per week ($${weeklyCost.toFixed(2)}). Campus dining has great options - try it once this week and save $${savings.toFixed(2)}!`,
      priority: 'medium',
      predictedSavings: savings,
      actionItems: ['Try campus dining hall this week'],
    });
  }

  // Insight 3: Reward meal swipe usage
  const mealSwipeTransactions = transactions.filter(t => t.payment_method === 'Meal Plan');
  if (mealSwipeTransactions.length > 0 && mealPlanBalance && mealPlanBalance.mealSwipes > 50) {
    insights.push({
      type: 'reward',
      title: 'Great Meal Swipe Usage',
      message: `You're using meal swipes well! 🎉 You have ${mealPlanBalance.mealSwipes} left. Keep using them to maximize your meal plan value.`,
      priority: 'low',
      actionItems: ['Continue using meal swipes'],
    });
  }

  // Insight 4: Off-campus dining suggestion (only if they have meal swipes)
  if (offCampusTotal > 0 && mealPlanBalance && mealPlanBalance.mealSwipes > 10) {
    insights.push({
      type: 'suggestion',
      title: 'Campus Dining Alternative',
      message: `You spent $${offCampusTotal.toFixed(2)} on off-campus dining. You have ${mealPlanBalance.mealSwipes} meal swipes - using them saves $${avgOffCampus.toFixed(2)} per meal!`,
      priority: 'medium',
      predictedSavings: avgOffCampus,
      actionItems: ['Use meal swipes for your next meal'],
    });
  }

  // Insight 5: Meal swipe exhaustion (only if critical)
  if (mealPlanBalance && mealSwipeDaysRemaining && mealSwipeDaysRemaining < 20) {
    insights.push({
      type: 'alert',
      title: 'Meal Swipes Running Low',
      message: `You have ${mealPlanBalance.mealSwipes} meal swipes left (about ${mealSwipeDaysRemaining} days). Use them while you can to avoid spending dining dollars!`,
      priority: 'high',
      actionItems: ['Prioritize meal swipes this week'],
    });
  }

  const totalSpent = analysis.totalSpent;
  const avgDaily = totalSpent / daysWithData;
  const projectedSemester = avgDaily * 120; // ~4 months
  const totalSavings = insights.reduce((sum, i) => sum + (i.predictedSavings || 0), 0);

  return {
    predictions: [],
    insights: insights.slice(0, 4), // Max 4 insights
    summary: `You've spent $${totalSpent.toFixed(2)}. With smart substitutions, save $${totalSavings.toFixed(2)} this week.`,
    habitStory: `Your strongest habit: ${frequentMerchant ? `${frequentMerchant.merchant} (${frequentMerchant.count}×/week)` : analysis.spendingPatterns.mostExpensiveCategory}. Weak spot: ${offCampusDining.length > 0 ? 'off-campus dining' : 'weekend spending'}.`,
    futureSimulation: {
      semesterTotal: projectedSemester,
      mealPointsExhaustionDate: exhaustionDate || undefined,
      riskAreas: [analysis.spendingPatterns.mostExpensiveCategory],
      projectedSavings: totalSavings * 4, // Monthly projection
    },
    campusRecommendations: [
      {
        event: 'Campus Dining Hall',
        reason: `Use your ${mealPlanBalance?.mealSwipes || 0} meal swipes instead of off-campus dining`,
        savings: avgOffCampus || 10,
      },
    ],
  };
}

/**
 * Get "Future You" simulation
 */
export async function getFutureSimulation(
  transactions: ParsedTransaction[],
  analysis: SpendingAnalysis
): Promise<{
  semesterTotal: number;
  mealPointsExhaustionDate?: string;
  riskAreas: string[];
  projectedSavings: number;
}> {
  const model = getGeminiModel();

  if (!model) {
    const avgDaily = analysis.totalSpent / Math.max(Object.keys(analysis.dailySpending).length, 1);
    return {
      semesterTotal: avgDaily * 120,
      riskAreas: [analysis.spendingPatterns.mostExpensiveCategory],
      projectedSavings: 75,
    };
  }

  try {
    const prompt = `Based on this spending data, simulate what happens if patterns continue:

Total spent: $${analysis.totalSpent}
Average daily: $${(analysis.totalSpent / Math.max(Object.keys(analysis.dailySpending).length, 1)).toFixed(2)}
Top category: ${analysis.spendingPatterns.mostExpensiveCategory}

Project:
1. Semester total (120 days)
2. Risk areas
3. Projected savings if they follow recommendations

Return JSON: {"semesterTotal": number, "riskAreas": ["..."], "projectedSavings": number}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Future simulation error:', error);
  }

  // Fallback
  const avgDaily = analysis.totalSpent / Math.max(Object.keys(analysis.dailySpending).length, 1);
  return {
    semesterTotal: avgDaily * 120,
    riskAreas: [analysis.spendingPatterns.mostExpensiveCategory],
    projectedSavings: 75,
  };
}

