import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { TrendingDown, TrendingUp, DollarSign, ShoppingCart, Coffee, Car, Smartphone } from "lucide-react";

export function BudgetScreen() {
  const budgetData = {
    total: 3000,
    spent: 2150,
    remaining: 850,
  };

  const categories = [
    {
      name: "Dining",
      icon: Coffee,
      spent: 680,
      budget: 800,
      color: "orange",
    },
    {
      name: "Groceries",
      icon: ShoppingCart,
      spent: 520,
      budget: 600,
      color: "green",
    },
    {
      name: "Transportation",
      icon: Car,
      spent: 340,
      budget: 500,
      color: "blue",
    },
    {
      name: "Shopping",
      icon: Smartphone,
      spent: 285,
      budget: 400,
      color: "purple",
    },
  ];

  const transactions = [
    { name: "Starbucks", amount: -5.75, date: "Today", category: "Dining" },
    { name: "Target", amount: -42.30, date: "Yesterday", category: "Shopping" },
    { name: "Uber", amount: -12.50, date: "Nov 13", category: "Transportation" },
    { name: "Whole Foods", amount: -68.20, date: "Nov 12", category: "Groceries" },
    { name: "Amazon", amount: -28.99, date: "Nov 11", category: "Shopping" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {/* Budget Overview */}
      <Card className="mb-4 p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between mb-2">
          <p className="text-blue-100">Monthly Budget</p>
          <Badge className="bg-white/20 text-white">November</Badge>
        </div>
        <div className="mb-4">
          <h2 className="text-4xl mb-1">${budgetData.remaining.toLocaleString()}</h2>
          <p className="text-blue-100">Remaining of ${budgetData.total.toLocaleString()}</p>
        </div>
        <Progress value={(budgetData.spent / budgetData.total) * 100} className="h-2 bg-blue-400" />
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            <span>Spent: ${budgetData.spent.toLocaleString()}</span>
          </div>
          <span>{Math.round((budgetData.spent / budgetData.total) * 100)}% used</span>
        </div>
      </Card>

      {/* Before vs After */}
      <Card className="mb-4 p-4 bg-white">
        <h3 className="mb-4">Budget Tracking</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Before Budget</span>
              <span className="text-red-500">$2,850</span>
            </div>
            <Progress value={95} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">After Budget</span>
              <span className="text-emerald-500">$2,150</span>
            </div>
            <Progress value={72} className="h-2" />
          </div>
          <div className="pt-3 border-t flex items-center justify-center gap-2 bg-emerald-50 rounded-lg p-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <p className="text-emerald-700">
              You saved <span>$700</span> this month! 🎉
            </p>
          </div>
        </div>
      </Card>

      {/* Categories */}
      <Card className="mb-4 p-4 bg-white">
        <h3 className="mb-4">Spending by Category</h3>
        <div className="space-y-4">
          {categories.map((category) => {
            const percentage = (category.spent / category.budget) * 100;
            const Icon = category.icon;
            const colorClasses = {
              orange: "text-orange-600 bg-orange-100",
              green: "text-green-600 bg-green-100",
              blue: "text-blue-600 bg-blue-100",
              purple: "text-purple-600 bg-purple-100",
            };

            return (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p>{category.name}</p>
                      <p className="text-xs text-gray-500">
                        ${category.spent} of ${category.budget}
                      </p>
                    </div>
                  </div>
                  <span className={percentage > 90 ? "text-red-500" : "text-gray-600"}>
                    {Math.round(percentage)}%
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="mb-20 p-4 bg-white">
        <h3 className="mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p>{transaction.name}</p>
                  <p className="text-xs text-gray-500">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <span className="text-red-500">{transaction.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
