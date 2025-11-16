import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchMealPlanBalance, fetchMealSwipeHistory, MealPlanTracker as MealPlanTrackerService } from '../services/rutgersApiService';
import { UtensilsCrossed, DollarSign, CreditCard, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function MealPlanTracker() {
  const { mealPlanBalance, mealSwipeHistory, setMealPlanBalance, setMealSwipeHistory } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [, setTracker] = useState<MealPlanTrackerService | null>(null);

  useEffect(() => {
    // Initial load
    loadMealPlanData();

    // Set up auto-refresh (every 5 minutes)
    // This ensures data stays fresh without being too aggressive
    const mealTracker = new MealPlanTrackerService((balance) => {
      console.log('🔄 Auto-refresh: Updated meal plan balance', balance);
      setMealPlanBalance(balance);
      setIsConnected(true);
    });
    
    mealTracker.start(300000); // 5 minutes (300000ms)
    setTracker(mealTracker);

    return () => {
      mealTracker.stop();
    };
  }, []);

  const loadMealPlanData = async () => {
    setIsLoading(true);
    try {
      const [balance, history] = await Promise.all([
        fetchMealPlanBalance(),
        fetchMealSwipeHistory(),
      ]);

      if (balance) {
        setMealPlanBalance(balance);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }

      if (history) {
        setMealSwipeHistory(history);
      }
    } catch (error) {
      console.error('Error loading meal plan data:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadMealPlanData();
  };

  if (!mealPlanBalance && !isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-4">No meal plan data available</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Load Data
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !mealPlanBalance) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-300 animate-spin" />
          <p className="text-gray-600">Loading meal plan data...</p>
        </div>
      </div>
    );
  }

  // Safely calculate percentage
  const swipePercentage = mealPlanBalance?.planType === 'Unlimited' 
    ? 100 // Unlimited plans don't have a percentage
    : (mealPlanBalance?.mealSwipes || 0) > 0 
      ? Math.min(100, ((mealPlanBalance.mealSwipes || 0) / 150) * 100) // 150 meal plan
      : 0;
  
  // Safely get values with defaults
  const mealSwipes = mealPlanBalance?.mealSwipes || 0;
  const diningDollars = mealPlanBalance?.diningDollars || 0;
  const ruExpress = mealPlanBalance?.ruExpress || 0;
  const planType = mealPlanBalance?.planType || 'Standard Plan';
  const semester = mealPlanBalance?.semester || 'Fall 2025';
  const lastUpdated = mealPlanBalance?.lastUpdated || new Date().toISOString();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-green-600" />
            Meal Plan Balance
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {planType} • {semester}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-gray-400" />
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Meal Swipes */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-800">Meal Swipes</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {mealSwipes}
            </div>
            {planType !== 'Unlimited' && (
              <div className="text-xs text-gray-600">
                {swipePercentage.toFixed(0)}% remaining
              </div>
            )}
          </div>
        </div>
        {planType !== 'Unlimited' && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${swipePercentage}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Dining Dollars & RU Express */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Dining Dollars</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            ${diningDollars.toFixed(2)}
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">RU Express</span>
          </div>
          <div className="text-xl font-bold text-purple-600">
            ${ruExpress.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {mealSwipeHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mealSwipeHistory.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{transaction.location}</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(transaction.date), 'MMM d, h:mm a')}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded ${
                    transaction.type === 'meal_swipe' 
                      ? 'bg-green-100 text-green-700'
                      : transaction.type === 'dining_dollars'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {transaction.type === 'meal_swipe' ? 'Swipe' :
                     transaction.type === 'dining_dollars' ? 'Dining $' : 'RU Express'}
                  </span>
                  {transaction.amount && (
                    <div className="text-xs text-gray-600 mt-1">
                      ${transaction.amount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2">
          {isConnected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live data"></div>
              <p className="text-xs text-gray-500">
                Live data • Last updated: {(() => {
                  try {
                    const date = new Date(lastUpdated);
                    if (isNaN(date.getTime())) {
                      return 'just now';
                    }
                    return formatDistanceToNow(date, { addSuffix: true });
                  } catch {
                    return 'just now';
                  }
                })()}
              </p>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full" title="Demo data"></div>
              <p className="text-xs text-gray-500">
                Demo data • Auto-refresh every 5 minutes
              </p>
            </>
          )}
        </div>
        {isConnected && (
          <p className="text-xs text-green-600 text-center mt-1 font-semibold">
            ✓ Connected to Rutgers RU Express
          </p>
        )}
      </div>
    </div>
  );
}

