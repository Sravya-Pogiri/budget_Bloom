import { useEffect, useState } from 'react';
import { Wallet, RefreshCw } from 'lucide-react';
import { loadTransactionCSV, convertToAppTransactions } from '../services/csvParser';
import type { Transaction } from '../types';
import { format } from 'date-fns';

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const parsed = await loadTransactionCSV('/wallet_transactions_sample.csv');
      const converted = convertToAppTransactions(parsed);
      // Sort by date, newest first
      converted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(converted);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Wallet className="w-12 h-12 text-green-600 animate-pulse mb-4" />
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-green-600" />
            Transactions
          </h2>
          <p className="text-sm text-gray-600 mt-1">{transactions.length} total transactions</p>
        </div>
        <button
          onClick={loadTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-800">{transaction.merchant}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {transaction.category}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                    <span>{transaction.location}</span>
                    <span>•</span>
                    <span>{transaction.paymentMethod}</span>
                    <span>•</span>
                    <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">
                    ${transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

