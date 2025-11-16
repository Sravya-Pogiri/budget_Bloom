import { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Sparkles, RefreshCw } from 'lucide-react';
import { loadTransactionCSV, analyzeSpending } from '../services/csvParser';
import { getGeminiAnalysis, type GeminiAnalysisResponse } from '../services/geminiAIService';
import { useStore } from '../store/useStore';

const CACHE_KEY = 'budgetbloom_ai_insights_cache';
const CACHE_TIMESTAMP_KEY = 'budgetbloom_ai_insights_timestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function AIInsights() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<GeminiAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { mealPlanBalance } = useStore();

  const loadAnalysis = async (forceRefresh = false) => {
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
        
        if (cached && timestamp) {
          const age = Date.now() - parseInt(timestamp, 10);
          if (age < CACHE_DURATION) {
            // Use cached data
            setAnalysis(JSON.parse(cached));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Error reading cache:', err);
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      // Load and parse CSV
      const transactions = await loadTransactionCSV('/wallet_transactions_sample.csv');
      
      if (transactions.length === 0) {
        setError('No transaction data found. Please ensure wallet_transactions_sample.csv is available.');
        setLoading(false);
        return;
      }

      // Analyze spending
      const spendingAnalysis = analyzeSpending(transactions);

      // Get AI analysis from Gemini
      const aiAnalysis = await getGeminiAnalysis({
        transactions,
        analysis: spendingAnalysis,
        currentWeek: 8, // Example: mid-semester
        isExamWeek: false,
        mealPlanBalance: mealPlanBalance ? {
          mealSwipes: mealPlanBalance.mealSwipes,
          diningDollars: mealPlanBalance.diningDollars,
          ruExpress: mealPlanBalance.ruExpress,
        } : undefined,
      });

      // Cache the result
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(aiAnalysis));
        sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      } catch (err) {
        console.warn('Error caching insights:', err);
      }

      setAnalysis(aiAnalysis);
    } catch (err) {
      console.error('Error loading analysis:', err);
      setError('Failed to load AI insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Brain className="w-12 h-12 text-green-600 animate-pulse mb-4" />
        <p className="text-gray-600">Analyzing your spending patterns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadAnalysis}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'recommendation':
      case 'suggestion':
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
      case 'reward':
        return <Sparkles className="w-5 h-5 text-green-600" />;
      case 'prediction':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Brain className="w-5 h-5 text-green-600" />;
    }
  };

  const getPriorityColor = (type: string, priority: string) => {
    // Rewards get special green styling
    if (type === 'reward') {
      return 'border-green-300 bg-green-50';
    }
    
    switch (priority) {
      case 'high':
        return 'border-orange-300 bg-orange-50';
      case 'medium':
        return 'border-blue-300 bg-blue-50';
      case 'low':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="w-6 h-6 text-green-600" />
            AI Insights
          </h2>
          <p className="text-sm text-gray-600 mt-1">Your Future Financial Self</p>
        </div>
        <button
          onClick={() => loadAnalysis(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Financial Summary</h3>
              <p className="text-gray-700">{analysis.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Habit Story */}
      {analysis.habitStory && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Your Spending Story
          </h3>
          <p className="text-gray-700 leading-relaxed">{analysis.habitStory}</p>
        </div>
      )}

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Key Insights</h3>
          <div className="space-y-4">
            {analysis.insights.map((insight, index) => (
              <div
                key={index}
                className={`border rounded-lg p-5 ${getPriorityColor(insight.type, insight.priority)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                      {insight.predictedSavings && (
                        <span className="text-sm font-bold text-green-600">
                          Save ${insight.predictedSavings}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{insight.message}</p>
                    {insight.actionItems && insight.actionItems.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Action Items:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {insight.actionItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future Simulation */}
      {analysis.futureSimulation && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Future You Simulation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Projected Semester Total</p>
              <p className="text-2xl font-bold text-gray-800">
                ${analysis.futureSimulation.semesterTotal.toFixed(2)}
              </p>
            </div>
            {analysis.futureSimulation.projectedSavings > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${analysis.futureSimulation.projectedSavings.toFixed(2)}
                </p>
              </div>
            )}
          </div>
          {analysis.futureSimulation.riskAreas.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Risk Areas:</p>
              <div className="flex flex-wrap gap-2">
                {analysis.futureSimulation.riskAreas.map((risk, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Campus Recommendations */}
      {analysis.campusRecommendations && analysis.campusRecommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Campus Recommendations</h3>
          <div className="space-y-3">
            {analysis.campusRecommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{rec.event}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    Save ${rec.savings}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

