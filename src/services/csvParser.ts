import Papa from "papaparse";

export interface ParsedTransaction {
  transaction_id: string;
  user_id: string;
  merchant: string;
  category: string;
  amount: number;
  payment_method: string;
  location: string;
  date: string;
}

export interface SpendingAnalysis {
  totalSpent: number;
  categoryBreakdown: Record<string, { total: number; count: number; avg: number }>;
  dailySpending: Record<string, number>;
  topMerchants: Array<{ merchant: string; total: number; count: number }>;
  recentTransactions: ParsedTransaction[];
}

export async function parseTransactionCSV(csvContent: string): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string, field: string) => {
        if (field === "amount") {
          return parseFloat(value) || 0;
        }
        return typeof value === "string" ? value.trim() : value;
      },
      complete: (results) => {
        const transactions = results.data as ParsedTransaction[];
        resolve(transactions.filter((t) => t.transaction_id && t.amount > 0));
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export async function loadTransactionCSV(filePath: string = "/final_wallet_transactions_sample.csv"): Promise<ParsedTransaction[]> {
  try {
    const response = await fetch(filePath);
    const csvContent = await response.text();
    return await parseTransactionCSV(csvContent);
  } catch (error) {
    console.error("Error loading CSV:", error);
    return [];
  }
}

export function analyzeSpending(transactions: ParsedTransaction[]): SpendingAnalysis {
  if (transactions.length === 0) {
    return {
      totalSpent: 0,
      categoryBreakdown: {},
      dailySpending: {},
      topMerchants: [],
      recentTransactions: [],
    };
  }

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown: Record<string, { total: number; count: number; avg: number }> = {};
  for (const t of transactions) {
    if (!categoryBreakdown[t.category]) {
      categoryBreakdown[t.category] = { total: 0, count: 0, avg: 0 };
    }
    categoryBreakdown[t.category].total += t.amount;
    categoryBreakdown[t.category].count += 1;
  }
  Object.keys(categoryBreakdown).forEach((cat) => {
    const entry = categoryBreakdown[cat];
    entry.avg = entry.total / Math.max(1, entry.count);
  });

  const dailySpending: Record<string, number> = {};
  for (const t of transactions) {
    const d = t.date.split("T")[0];
    dailySpending[d] = (dailySpending[d] || 0) + t.amount;
  }

  const merchantMap: Record<string, { total: number; count: number }> = {};
  for (const t of transactions) {
    if (!merchantMap[t.merchant]) {
      merchantMap[t.merchant] = { total: 0, count: 0 };
    }
    merchantMap[t.merchant].total += t.amount;
    merchantMap[t.merchant].count += 1;
  }
  const topMerchants = Object.entries(merchantMap)
    .map(([merchant, data]) => ({ merchant, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return { totalSpent, categoryBreakdown, dailySpending, topMerchants, recentTransactions };
}


