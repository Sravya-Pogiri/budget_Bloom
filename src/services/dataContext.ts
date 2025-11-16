import Papa from "papaparse";

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

let cachedTransactions: TransactionRecord[] | null = null;

// Load and normalize the CSV so it can be reused across dashboard/chat.
export async function loadTransactions(): Promise<TransactionRecord[]> {
  if (cachedTransactions) return cachedTransactions;

  const response = await fetch("/final_wallet_transactions_sample.csv");
  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${response.status}`);
  }
  const csvText = await response.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const rows = (parsed.data as any[])
    .filter((r) => r && r.date && r.merchant)
    .map((r) => ({
      transaction_id: String(r.transaction_id || ""),
      user_id: String(r.user_id || ""),
      merchant: String(r.merchant || ""),
      category: String(r.category || "Other"),
      amount:
        typeof r.amount === "number" ? r.amount : Number(r.amount) || 0,
      payment_method: String(r.payment_method || ""),
      location: String(r.location || ""),
      date: String(r.date || ""),
    }))
    .filter((r) => r.transaction_id && r.merchant);

  cachedTransactions = rows;
  return rows;
}

export function getThisWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

export function buildTransactionContextSnippet(
  rows: TransactionRecord[],
  limit = 200
): string {
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


