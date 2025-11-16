import Papa from "papaparse";
import csvStatic from "../../final_wallet_transactions_sample.csv?raw";

export interface TransactionRecord {
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
  transactionCount: number;
  averageTransaction: number;
  categoryBreakdown: Record<string, { total: number; count: number; avg: number }>;
  topMerchants: Array<{ merchant: string; total: number; count: number }>;
  dayOfWeekPatterns: Record<string, { count: number; total: number; merchants: Record<string, number> }>;
  dailySpending: Record<string, number>;
  weeklySpending: Record<string, number>;
  recentTransactions: TransactionRecord[];
  necessaryTotal: number;
  discretionaryTotal: number;
  campusDiningTotal: number;
  offCampusDiningTotal: number;
}

let cachedTransactions: TransactionRecord[] | null = null;

const csvAssetUrl = new URL("../../final_wallet_transactions_sample.csv", import.meta.url).href;

async function readCsvText(): Promise<string> {
  const sources = [csvAssetUrl, "/final_wallet_transactions_sample.csv"];
  const errors: string[] = [];
  for (const source of sources) {
    try {
      const resp = await fetch(source);
      if (!resp.ok) {
        errors.push(`${source} (${resp.status})`);
        continue;
      }
      return await resp.text();
    } catch (err: any) {
      errors.push(`${source} (${err?.message || "network error"})`);
    }
  }
  if (csvStatic && csvStatic.length) {
    console.warn(`Falling back to embedded CSV data because fetch failed: ${errors.join(", ")}`);
    return csvStatic;
  }
  throw new Error(`Failed to load transaction CSV: ${errors.join(", ")}`);
}

export async function loadTransactions(): Promise<TransactionRecord[]> {
  if (cachedTransactions) return cachedTransactions;
  const csvText = await readCsvText();
  const parsed = Papa.parse(csvText, { header: true, dynamicTyping: true, skipEmptyLines: true });
  const rows = (parsed.data as any[])
    .filter((r) => r && r.date && r.merchant)
    .map((r) => ({
      transaction_id: String(r.transaction_id || ""),
      user_id: String(r.user_id || ""),
      merchant: String(r.merchant || ""),
      category: String(r.category || "Other"),
      amount: typeof r.amount === "number" ? r.amount : Number(r.amount) || 0,
      payment_method: String(r.payment_method || ""),
      location: String(r.location || ""),
      date: String(r.date || ""),
    }))
    .filter((r) => r.transaction_id && r.merchant);
  cachedTransactions = rows;
  return rows;
}

export function analyzeTransactions(rows: TransactionRecord[]): SpendingAnalysis {
  if (!rows.length) {
    return {
      totalSpent: 0,
      transactionCount: 0,
      averageTransaction: 0,
      categoryBreakdown: {},
      topMerchants: [],
      dayOfWeekPatterns: {},
      dailySpending: {},
      weeklySpending: {},
      recentTransactions: [],
      necessaryTotal: 0,
      discretionaryTotal: 0,
      campusDiningTotal: 0,
      offCampusDiningTotal: 0,
    };
  }

  const totalSpent = rows.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const categoryBreakdown: Record<string, { total: number; count: number; avg: number }> = {};
  const merchantMap: Record<string, { total: number; count: number }> = {};
  const dayOfWeekPatterns: Record<
    string,
    { count: number; total: number; merchants: Record<string, number> }
  > = {};
  const dailySpending: Record<string, number> = {};
  const weeklySpending: Record<string, number> = {};
  const necessaryCategories = new Set(["Books", "Supplies", "Pharmacy", "Rent"]);
  let necessaryTotal = 0;
  let discretionaryTotal = 0;
  let campusDiningTotal = 0;
  let offCampusDiningTotal = 0;

  rows.forEach((txn) => {
    const amount = Number(txn.amount) || 0;

    if (!categoryBreakdown[txn.category]) {
      categoryBreakdown[txn.category] = { total: 0, count: 0, avg: 0 };
    }
    categoryBreakdown[txn.category].total += amount;
    categoryBreakdown[txn.category].count += 1;

    if (!merchantMap[txn.merchant]) {
      merchantMap[txn.merchant] = { total: 0, count: 0 };
    }
    merchantMap[txn.merchant].total += amount;
    merchantMap[txn.merchant].count += 1;

    const date = new Date(txn.date);
    const dayKey = !isNaN(date.getTime()) ? txn.date.split("T")[0] : txn.date;
    dailySpending[dayKey] = (dailySpending[dayKey] || 0) + amount;

    if (!isNaN(date.getTime())) {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().split("T")[0];
      weeklySpending[weekKey] = (weeklySpending[weekKey] || 0) + amount;

      const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
        date.getDay()
      ];
      if (!dayOfWeekPatterns[dayName]) {
        dayOfWeekPatterns[dayName] = { count: 0, total: 0, merchants: {} };
      }
      dayOfWeekPatterns[dayName].count += 1;
      dayOfWeekPatterns[dayName].total += amount;
      dayOfWeekPatterns[dayName].merchants[txn.merchant] =
        (dayOfWeekPatterns[dayName].merchants[txn.merchant] || 0) + 1;
    }

    if (necessaryCategories.has(txn.category)) {
      necessaryTotal += amount;
    } else {
      discretionaryTotal += amount;
    }

    const isCampusDining =
      txn.category === "Dining" &&
      ["Meal Plan", "Dining Dollars", "Campus Card"].includes(txn.payment_method);
    if (isCampusDining) {
      campusDiningTotal += amount;
    } else if (txn.category === "Dining") {
      offCampusDiningTotal += amount;
    }
  });

  Object.values(categoryBreakdown).forEach((entry) => {
    entry.avg = entry.total / entry.count;
  });

  const topMerchants = Object.entries(merchantMap)
    .map(([merchant, stats]) => ({ merchant, ...stats }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const recentTransactions = [...rows]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return {
    totalSpent,
    transactionCount: rows.length,
    averageTransaction: totalSpent / rows.length,
    categoryBreakdown,
    topMerchants,
    dayOfWeekPatterns,
    dailySpending,
    weeklySpending,
    recentTransactions,
    necessaryTotal,
    discretionaryTotal,
    campusDiningTotal,
    offCampusDiningTotal,
  };
}

export function getThisWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

export function buildTransactionContextSnippet(rows: TransactionRecord[], limit = 120): string {
  // Keep only needed fields and cap length to stay within prompt limits
  const compact = rows.slice(0, limit).map((r) => ({
    transaction_id: r.transaction_id,
    merchant: r.merchant,
    category: r.category,
    amount: Number(r.amount),
    payment_method: r.payment_method,
    location: r.location,
    date: r.date,
  }));
  return JSON.stringify(compact);
}
