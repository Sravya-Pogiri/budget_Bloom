import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  analyzeTransactions,
  buildTransactionContextSnippet,
  loadTransactions,
  SpendingAnalysis,
  TransactionRecord,
} from "./dataContext";

export async function askGeminiWithTransactions(question: string): Promise<string> {
  const apiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_MODEL_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: (import.meta as any).env?.VITE_GEMINI_MODEL || "gemini-1.5-flash",
  });

  const transactions = await loadTransactions();
  const analysis = analyzeTransactions(transactions);
  const context = buildTransactionContextSnippet(transactions, 200);
  const summary = buildAnalysisSummary(analysis);
  const categories = formatCategoryBreakdown(analysis);
  const merchants = formatMerchantInsights(analysis);
  const dayPatterns = formatDayPatterns(analysis);
  const recent = formatRecentTransactions(analysis.recentTransactions);

  const prompt = `You are Budget Bloom, a positive Rutgers student financial coach.
Use the spending dataset below to answer like a supportive money mentor.

DATA SNAPSHOT:
${summary}

CATEGORY HOTSPOTS:
${categories}

MERCHANT HABITS:
${merchants}

DAY & PATTERN SIGNALS:
${dayPatterns}

RECENT TRANSACTIONS:
${recent}

RAW TRANSACTION SAMPLE (JSON):
${context}

USER QUESTION: ${question}

RESPONSE RULES:
- Reference real numbers (amounts, merchants, days) from the data. Show currency as $X.XX.
- Explain what pattern you see, then recommend an actionable next step (cheaper option, timing tip, etc.).
- If data is missing for the question, say so and guide the user to collect it.
- Stay under 150 words. Tone = encouraging, never shaming necessary expenses.`;

  const result = await model.generateContent(prompt);
  // @ts-ignore
  return await result.response.text();
}

function buildAnalysisSummary(analysis: SpendingAnalysis) {
  const ratios = [] as string[];
  ratios.push(
    `Total spent $${analysis.totalSpent.toFixed(2)} across ${analysis.transactionCount} transactions (avg $${analysis.averageTransaction.toFixed(2)}).`
  );
  ratios.push(
    `Necessary vs discretionary: $${analysis.necessaryTotal.toFixed(2)} vs $${analysis.discretionaryTotal.toFixed(2)}.`
  );
  if (analysis.campusDiningTotal + analysis.offCampusDiningTotal > 0) {
    ratios.push(
      `Dining on campus vs off: $${analysis.campusDiningTotal.toFixed(2)} vs $${analysis.offCampusDiningTotal.toFixed(2)}.`
    );
  }
  const busiestDay = Object.entries(analysis.dailySpending)
    .sort(([, a], [, b]) => b - a)[0];
  if (busiestDay) {
    ratios.push(`Highest single-day spend $${busiestDay[1].toFixed(2)} on ${busiestDay[0]}.`);
  }
  return ratios.join("\n");
}

function formatCategoryBreakdown(analysis: SpendingAnalysis) {
  return Object.entries(analysis.categoryBreakdown)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5)
    .map(
      ([category, data]) =>
        `${category}: $${data.total.toFixed(2)} (${data.count}x, avg $${data.avg.toFixed(2)})`
    )
    .join("\n") || "Not enough category data.";
}

function formatMerchantInsights(analysis: SpendingAnalysis) {
  if (!analysis.topMerchants.length) return "No repeating merchants detected.";
  return analysis.topMerchants
    .map(
      (merchant) =>
        `${merchant.merchant}: $${merchant.total.toFixed(2)} (${merchant.count} purchases)`
    )
    .join("\n");
}

function formatDayPatterns(analysis: SpendingAnalysis) {
  const entries = Object.entries(analysis.dayOfWeekPatterns)
    .map(([day, data]) => ({ day, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
  if (!entries.length) return "No day-of-week signal detected.";
  return entries
    .map((entry) => {
      const topMerchant = Object.entries(entry.merchants)
        .sort(([, a], [, b]) => b - a)[0];
      const merchantSummary = topMerchant
        ? `${topMerchant[0]} ${topMerchant[1]}x`
        : "mixed merchants";
      return `${entry.day}: $${entry.total.toFixed(2)} (${entry.count} txns, ${merchantSummary})`;
    })
    .join("\n");
}

function formatRecentTransactions(transactions: TransactionRecord[]) {
  if (!transactions.length) return "No recent transactions available.";
  return transactions
    .slice(0, 8)
    .map((txn) => {
      const date = new Date(txn.date);
      const day = isNaN(date.getTime())
        ? txn.date
        : `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]} ${txn.date}`;
      return `${day}: $${Number(txn.amount).toFixed(2)} at ${txn.merchant} (${txn.category})`;
    })
    .join("\n");
}

