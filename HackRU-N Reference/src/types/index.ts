export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  paymentMethod: string;
  location: string;
  date: string;
  description?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  current: number;
  period: 'weekly' | 'monthly';
}

export interface TreeState {
  level: number;
  fruits: Fruit[];
  leaves: number;
  health: number; // 0-100
  lastGrowth: string;
}

export interface Fruit {
  id: string;
  type: 'savings' | 'coupon' | 'streak' | 'goal' | 'milestone';
  value: number;
  date: string;
  description: string;
}

export interface HoneyCoupon {
  id: string;
  merchant: string;
  discount: string;
  category: string;
  expiryDate?: string;
  applicable: boolean;
  savings?: number;
}

export interface AIInsight {
  type: 'prediction' | 'recommendation' | 'alert' | 'summary' | 'reward' | 'suggestion';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionItems?: string[];
  predictedSavings?: number;
}

export interface SpendingPrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  reasoning: string;
  suggestions: string[];
}

export interface User {
  id: string;
  name: string;
  major: string;
  classYear: string;
  residenceType: string;
  interests: string[];
}

export interface CampusEvent {
  id: string;
  name: string;
  category: string;
  location: string;
  startTime: string;
  tags: string[];
  cost: number;
}

export interface MealPlanBalance {
  mealSwipes: number;
  diningDollars: number;
  ruExpress: number;
  lastUpdated: string;
  planType?: string;
  semester?: string;
}

export interface MealSwipeTransaction {
  id: string;
  date: string;
  location: string;
  type: 'meal_swipe' | 'dining_dollars' | 'ru_express';
  amount?: number;
  description: string;
}

