import { create } from 'zustand';
import type { Transaction, Budget, TreeState, Fruit, HoneyCoupon, AIInsight, SpendingPrediction, MealPlanBalance, MealSwipeTransaction } from '../types';

interface AppState {
  // Data
  transactions: Transaction[];
  budgets: Budget[];
  treeState: TreeState;
  honeyCoupons: HoneyCoupon[];
  aiInsights: AIInsight[];
  predictions: SpendingPrediction[];
  usedCoupons: string[];
  mealPlanBalance: MealPlanBalance | null;
  mealSwipeHistory: MealSwipeTransaction[];

  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateBudget: (budgetId: string, amount: number) => void;
  addFruit: (fruit: Fruit) => void;
  updateTreeHealth: (health: number) => void;
  setHoneyCoupons: (coupons: HoneyCoupon[]) => void;
  useCoupon: (couponId: string) => void;
  setAIInsights: (insights: AIInsight[]) => void;
  setPredictions: (predictions: SpendingPrediction[]) => void;
  setMealPlanBalance: (balance: MealPlanBalance) => void;
  setMealSwipeHistory: (history: MealSwipeTransaction[]) => void;
  loadSampleData: () => void;
}

const initialTreeState: TreeState = {
  level: 1,
  fruits: [],
  leaves: 10,
  health: 75,
  lastGrowth: new Date().toISOString(),
};

export const useStore = create<AppState>((set, get) => ({
  transactions: [],
  budgets: [
    { id: 'b1', category: 'Dining', limit: 200, current: 0, period: 'weekly' },
    { id: 'b2', category: 'Entertainment', limit: 100, current: 0, period: 'weekly' },
    { id: 'b3', category: 'Shopping', limit: 150, current: 0, period: 'weekly' },
    { id: 'b4', category: 'Transportation', limit: 50, current: 0, period: 'weekly' },
  ],
  treeState: initialTreeState,
  honeyCoupons: [],
  aiInsights: [],
  predictions: [],
  usedCoupons: [],
  mealPlanBalance: null,
  mealSwipeHistory: [],

  addTransaction: (transaction) => {
    set((state) => {
      const newTransactions = [...state.transactions, transaction];
      
      // Update budget
      const updatedBudgets = state.budgets.map(budget => {
        if (budget.category === transaction.category) {
          return { ...budget, current: budget.current + transaction.amount };
        }
        return budget;
      });

      // Calculate tree growth
      const totalSpent = newTransactions.reduce((sum, t) => sum + t.amount, 0);
      const budgetTotal = updatedBudgets.reduce((sum, b) => sum + b.current, 0);
      const budgetLimit = updatedBudgets.reduce((sum, b) => sum + b.limit, 0);
      const budgetRatio = budgetLimit > 0 ? budgetTotal / budgetLimit : 0;
      
      // Tree health based on staying under budget
      const health = Math.max(0, Math.min(100, 100 - (budgetRatio * 50)));
      
      // Add fruit for milestones
      const newFruits = [...state.treeState.fruits];
      const savings = state.budgets.find(b => b.category === transaction.category)?.limit || 0;
      const remaining = savings - (updatedBudgets.find(b => b.category === transaction.category)?.current || 0);
      
      if (remaining > savings * 0.5 && !newFruits.some(f => f.type === 'savings' && f.value === remaining)) {
        newFruits.push({
          id: `fruit-${Date.now()}`,
          type: 'savings',
          value: remaining,
          date: new Date().toISOString(),
          description: `Saved $${remaining.toFixed(2)} in ${transaction.category}`,
        });
      }

      return {
        transactions: newTransactions,
        budgets: updatedBudgets,
        treeState: {
          ...state.treeState,
          health,
          fruits: newFruits,
          leaves: Math.floor(10 + (health / 10)),
        },
      };
    });
  },

  updateBudget: (budgetId, amount) => {
    set((state) => ({
      budgets: state.budgets.map(b => 
        b.id === budgetId ? { ...b, current: amount } : b
      ),
    }));
  },

  addFruit: (fruit) => {
    set((state) => ({
      treeState: {
        ...state.treeState,
        fruits: [...state.treeState.fruits, fruit],
      },
    }));
  },

  updateTreeHealth: (health) => {
    set((state) => ({
      treeState: {
        ...state.treeState,
        health: Math.max(0, Math.min(100, health)),
        leaves: Math.floor(10 + (health / 10)),
      },
    }));
  },

  setHoneyCoupons: (coupons) => {
    set({ honeyCoupons: coupons });
  },

  useCoupon: (couponId) => {
    set((state) => {
      if (state.usedCoupons.includes(couponId)) {
        return state;
      }
      
      // Add fruit for coupon usage
      const coupon = state.honeyCoupons.find(c => c.id === couponId);
      const newFruit: Fruit = {
        id: `fruit-coupon-${Date.now()}`,
        type: 'coupon',
        value: coupon?.savings || 0,
        date: new Date().toISOString(),
        description: `Used coupon: ${coupon?.merchant} - Saved $${coupon?.savings || 0}`,
      };

      return {
        usedCoupons: [...state.usedCoupons, couponId],
        treeState: {
          ...state.treeState,
          fruits: [...state.treeState.fruits, newFruit],
          health: Math.min(100, state.treeState.health + 2),
        },
      };
    });
  },

  setAIInsights: (insights) => {
    set({ aiInsights: insights });
  },

  setPredictions: (predictions) => {
    set({ predictions });
  },

  setMealPlanBalance: (balance) => {
    set((state) => {
      const previousBalance = state.mealPlanBalance;
      
      // If meal swipes increased (unlikely but possible), add a fruit
      if (previousBalance && balance.mealSwipes > previousBalance.mealSwipes) {
        // This shouldn't normally happen, but if it does, celebrate!
      }
      
      // If dining dollars are being used wisely, improve tree health
      // Using meal swipes instead of dining dollars is good!
      const diningDollarUsage = previousBalance 
        ? previousBalance.diningDollars - balance.diningDollars
        : 0;
      
      // If they're using meal swipes (balance decreased), that's good for budget
      const swipeUsage = previousBalance
        ? previousBalance.mealSwipes - balance.mealSwipes
        : 0;
      
      let newHealth = state.treeState.health;
      if (swipeUsage > 0) {
        // Using meal swipes is good - they're using their plan!
        newHealth = Math.min(100, newHealth + 1);
      }
      
      // Update tree if health changed
      const newTreeState = newHealth !== state.treeState.health
        ? {
            ...state.treeState,
            health: newHealth,
            leaves: Math.floor(10 + (newHealth / 10)),
          }
        : state.treeState;
      
      return {
        mealPlanBalance: balance,
        treeState: newTreeState,
      };
    });
  },

  setMealSwipeHistory: (history) => {
    set({ mealSwipeHistory: history });
  },

  loadSampleData: () => {
    // Sample transactions
    const sampleTransactions: Transaction[] = [
      {
        id: 't1',
        merchant: 'Starbucks',
        category: 'Coffee',
        amount: 5.75,
        paymentMethod: 'Card',
        location: 'Campus',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 't2',
        merchant: 'DoorDash',
        category: 'Food Delivery',
        amount: 24.50,
        paymentMethod: 'Card',
        location: 'Off-Campus',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 't3',
        merchant: 'Campus Bookstore',
        category: 'Books',
        amount: 89.99,
        paymentMethod: 'Card',
        location: 'Campus',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 't4',
        merchant: 'Uber',
        category: 'Transportation',
        amount: 12.30,
        paymentMethod: 'Card',
        location: 'Off-Campus',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 't5',
        merchant: 'Starbucks',
        category: 'Coffee',
        amount: 6.25,
        paymentMethod: 'Card',
        location: 'Campus',
        date: new Date().toISOString(),
      },
    ];

    set((state) => {
      let newState = { ...state, transactions: sampleTransactions };
      
      // Update budgets based on sample transactions
      sampleTransactions.forEach(t => {
        const budget = newState.budgets.find(b => 
          b.category === t.category || 
          (t.category === 'Coffee' && b.category === 'Dining') ||
          (t.category === 'Food Delivery' && b.category === 'Dining')
        );
        if (budget) {
          newState.budgets = newState.budgets.map(b =>
            b.id === budget.id ? { ...b, current: b.current + t.amount } : b
          );
        }
      });

      return newState;
    });
  },
}));

