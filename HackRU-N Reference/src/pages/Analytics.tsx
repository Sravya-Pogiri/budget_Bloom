import { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, DollarSign, ShoppingBag, Calendar } from 'lucide-react';
import { loadTransactionCSV, analyzeSpending } from '../services/csvParser';
import type { SpendingAnalysis } from '../services/csvParser';

export function Analytics() {
  const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const transactions = await loadTransactionCSV('/wallet_transactions_sample.csv');
      const spendingAnalysis = analyzeSpending(transactions);
      setAnalysis(spendingAnalysis);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <TrendingUp className="w-12 h-12 text-green-600 animate-pulse mb-4" />
        <p className="text-gray-600">Analyzing spending data...</p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const topCategories = Object.entries(analysis.categoryBreakdown)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Analytics
          </h2>
          <p className="text-sm text-gray-600 mt-1">Spending patterns and insights</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h3 className="text-sm font-medium text-gray-600">Total Spent</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            ${analysis.totalSpent.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-600">Avg Transaction</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            ${analysis.spendingPatterns.avgTransactionAmount.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h3 className="text-sm font-medium text-gray-600">Top Category</h3>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {analysis.spendingPatterns.mostExpensiveCategory}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {topCategories.map(([category, data]) => {
            const percentage = (data.total / analysis.totalSpent) * 100;
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">{category}</span>
                    <span className="text-sm text-gray-500">
                      {data.count} transactions
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">${data.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">avg ${data.avg.toFixed(2)}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Merchants */}
      {analysis.topMerchants.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top Merchants</h3>
          <div className="space-y-3">
            {analysis.topMerchants.slice(0, 5).map((merchant, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-800">{merchant.merchant}</p>
                  <p className="text-sm text-gray-500">{merchant.count} purchases</p>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  ${merchant.total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

