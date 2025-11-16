/**
 * CSV Parser Service for Transaction Data
 * Parses wallet_transactions_sample.csv and provides analysis
 */

import Papa from 'papaparse';
import type { Transaction } from '../types';

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
  weeklySpending: Record<string, number>;
  topMerchants: Array<{ merchant: string; total: number; count: number }>;
  spendingPatterns: {
    mostExpensiveDay: string;
    mostExpensiveCategory: string;
    avgTransactionAmount: number;
    dayOfWeekPatterns?: Record<string, { count: number; total: number; merchants: Record<string, number> }>;
  };
  recentTransactions: ParsedTransaction[];
}

/**
 * Parse CSV file and return transactions
 */
export async function parseTransactionCSV(csvContent: string): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string, field: string) => {
        if (field === 'amount') {
          return parseFloat(value) || 0;
        }
        return value.trim();
      },
      complete: (results) => {
        const transactions = results.data as ParsedTransaction[];
        resolve(transactions.filter(t => t.transaction_id && t.amount > 0));
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Load and parse CSV from file
 */
export async function loadTransactionCSV(filePath: string = '/wallet_transactions_sample.csv'): Promise<ParsedTransaction[]> {
  try {
    const response = await fetch(filePath);
    const csvContent = await response.text();
    return await parseTransactionCSV(csvContent);
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
}

/**
 * Analyze spending patterns from transactions
 */
export function analyzeSpending(transactions: ParsedTransaction[]): SpendingAnalysis {
  if (transactions.length === 0) {
    return {
      totalSpent: 0,
      categoryBreakdown: {},
      dailySpending: {},
      weeklySpending: {},
      topMerchants: [],
      spendingPatterns: {
        mostExpensiveDay: '',
        mostExpensiveCategory: '',
        avgTransactionAmount: 0,
      },
      recentTransactions: [],
    };
  }

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Category breakdown
  const categoryBreakdown: Record<string, { total: number; count: number; avg: number }> = {};
  transactions.forEach(t => {
    if (!categoryBreakdown[t.category]) {
      categoryBreakdown[t.category] = { total: 0, count: 0, avg: 0 };
    }
    categoryBreakdown[t.category].total += t.amount;
    categoryBreakdown[t.category].count += 1;
  });
  Object.keys(categoryBreakdown).forEach(cat => {
    categoryBreakdown[cat].avg = categoryBreakdown[cat].total / categoryBreakdown[cat].count;
  });

  // Daily spending
  const dailySpending: Record<string, number> = {};
  transactions.forEach(t => {
    const date = t.date.split('T')[0];
    dailySpending[date] = (dailySpending[date] || 0) + t.amount;
  });

  // Weekly spending (group by week)
  const weeklySpending: Record<string, number> = {};
  transactions.forEach(t => {
    const date = new Date(t.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];
    weeklySpending[weekKey] = (weeklySpending[weekKey] || 0) + t.amount;
  });

  // Top merchants
  const merchantMap: Record<string, { total: number; count: number }> = {};
  transactions.forEach(t => {
    if (!merchantMap[t.merchant]) {
      merchantMap[t.merchant] = { total: 0, count: 0 };
    }
    merchantMap[t.merchant].total += t.amount;
    merchantMap[t.merchant].count += 1;
  });
  const topMerchants = Object.entries(merchantMap)
    .map(([merchant, data]) => ({ merchant, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Day of week patterns
  const dayOfWeekPatterns: Record<string, { count: number; total: number; merchants: Record<string, number> }> = {};
  transactions.forEach(t => {
    const date = new Date(t.date);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    if (!dayOfWeekPatterns[dayOfWeek]) {
      dayOfWeekPatterns[dayOfWeek] = { count: 0, total: 0, merchants: {} };
    }
    dayOfWeekPatterns[dayOfWeek].count++;
    dayOfWeekPatterns[dayOfWeek].total += t.amount;
    dayOfWeekPatterns[dayOfWeek].merchants[t.merchant] = (dayOfWeekPatterns[dayOfWeek].merchants[t.merchant] || 0) + 1;
  });

  // Spending patterns
  const mostExpensiveDay = Object.entries(dailySpending)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '';
  
  const mostExpensiveCategory = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b.total - a.total)[0]?.[0] || '';

  const avgTransactionAmount = totalSpent / transactions.length;

  // Recent transactions (last 20)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return {
    totalSpent,
    categoryBreakdown,
    dailySpending,
    weeklySpending,
    topMerchants,
    spendingPatterns: {
      mostExpensiveDay,
      mostExpensiveCategory,
      avgTransactionAmount,
      dayOfWeekPatterns,
    },
    recentTransactions,
  };
}

/**
 * Convert parsed transactions to app Transaction format
 */
export function convertToAppTransactions(parsed: ParsedTransaction[]): Transaction[] {
  return parsed.map(t => ({
    id: t.transaction_id,
    merchant: t.merchant,
    category: t.category,
    amount: t.amount,
    paymentMethod: t.payment_method,
    location: t.location,
    date: t.date,
    description: `${t.merchant} - ${t.category}`,
  }));
}

