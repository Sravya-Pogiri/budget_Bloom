import React from "react";
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Plus, TrendingDown, TrendingUp, DollarSign, Calendar, Target, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function DashboardScreen() {
  const [dateRange, setDateRange] = useState<"week" | "month" | "custom">("week");
  const [totalBudget, setTotalBudget] = useState(350.00);
  const [newBudgetValue, setNewBudgetValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const budgetData = {
    currentBalance: 245.60,
    totalBudget: totalBudget,
    spent: 104.40,
    percentUsed: Math.round((104.40 / totalBudget) * 100),
  };

  const recentExpenses = [
    { name: "Coffee", amount: 5.75, date: "Today", category: "Dining", icon: "☕" },
    { name: "Textbook", amount: 45.00, date: "Yesterday", category: "Education", icon: "📚" },
    { name: "Lunch", amount: 12.50, date: "Nov 13", category: "Dining", icon: "🍽️" },
    { name: "Bus Pass", amount: 15.00, date: "Nov 12", category: "Transport", icon: "🚌" },
    { name: "Snacks", amount: 8.50, date: "Nov 11", category: "Food", icon: "🍿" },
  ];

  const goals = [
    { name: "Emergency Fund", current: 340, target: 500, color: "blue" },
    { name: "Spring Break", current: 180, target: 400, color: "yellow" },
  ];

  const getProgressColor = (percent: number) => {
    if (percent < 50) return "bg-emerald-500";
    if (percent < 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressEmoji = (percent: number) => {
    if (percent < 50) return "🟩";
    if (percent < 75) return "🟨";
    return "🟥";
  };

  const handleSaveBudget = () => {
    const budgetAmount = parseFloat(newBudgetValue);
    if (budgetAmount && budgetAmount > 0) {
      setTotalBudget(budgetAmount);
      setIsDialogOpen(false);
      setNewBudgetValue("");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header / Summary Bar */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 pb-8">
        <div className="mb-4">
          <p className="text-blue-100 text-sm mb-1">Current Balance</p>
          <h1 className="text-4xl mb-2">${budgetData.currentBalance.toFixed(2)}</h1>
          <div className="flex items-center gap-2">
            <p className="text-blue-100 text-sm">of ${budgetData.totalBudget.toFixed(2)} budget</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={() => {
                    setNewBudgetValue(budgetData.totalBudget.toString());
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] bg-white">
                <DialogHeader>
                  <DialogTitle>Change Budget</DialogTitle>
                  <DialogDescription>
                    Set your new budget amount for this period.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="budget">Budget Amount</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl text-gray-600">$</span>
                      <Input
                        id="budget"
                        type="number"
                        step="0.01"
                        placeholder="350.00"
                        value={newBudgetValue}
                        onChange={(e) => setNewBudgetValue(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setNewBudgetValue("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#FCD535] hover:bg-[#FCD535]/90 text-gray-900"
                    onClick={handleSaveBudget}
                  >
                    Save Budget
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-100">Budget Used</p>
            <p className="text-sm">
              {getProgressEmoji(budgetData.percentUsed)} {budgetData.percentUsed}%
            </p>
          </div>
          <div className="w-full bg-blue-400/30 rounded-full h-3">
            <div
              className={`${getProgressColor(budgetData.percentUsed)} h-3 rounded-full transition-all`}
              style={{ width: `${budgetData.percentUsed}%` }}
            />
          </div>
          <p className="text-xs text-blue-100 mt-1">
            ${budgetData.spent.toFixed(2)} spent this {dateRange}
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setDateRange("week")}
            className={`flex-1 h-9 ${
              dateRange === "week"
                ? "bg-white text-blue-600"
                : "bg-blue-500/30 text-white border border-white/30"
            }`}
          >
            This Week
          </Button>
          <Button
            onClick={() => setDateRange("month")}
            className={`flex-1 h-9 ${
              dateRange === "month"
                ? "bg-white text-blue-600"
                : "bg-blue-500/30 text-white border border-white/30"
            }`}
          >
            This Month
          </Button>
          <Button
            onClick={() => setDateRange("custom")}
            className={`h-9 px-4 ${
              dateRange === "custom"
                ? "bg-white text-blue-600"
                : "bg-blue-500/30 text-white border border-white/30"
            }`}
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button className="bg-[#FCD535] hover:bg-[#FCD535]/90 text-gray-900 h-11 gap-2">
            <Plus className="w-5 h-5" />
            New Expense
          </Button>
          <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-11 gap-2">
            <Target className="w-5 h-5" />
            New Goal
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-sm text-gray-600">Saved</p>
            </div>
            <p className="text-2xl text-emerald-600">$245</p>
            <p className="text-xs text-gray-500">This month</p>
          </Card>
          <Card className="p-4 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-sm text-gray-600">Spent</p>
            </div>
            <p className="text-2xl text-red-600">$104</p>
            <p className="text-xs text-gray-500">This {dateRange}</p>
          </Card>
        </div>

        {/* Goals Progress */}
        <Card className="mb-4 p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3>Savings Goals</h3>
            <Button size="sm" variant="ghost" className="text-blue-600 h-8">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {goals.map((goal) => {
              const percentage = (goal.current / goal.target) * 100;
              return (
                <div key={goal.name}>
                  <div className="flex items-center justify-between mb-2">
                    <p>{goal.name}</p>
                    <p className="text-sm text-gray-600">
                      ${goal.current} / ${goal.target}
                    </p>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{Math.round(percentage)}% complete</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Expenses */}
        <Card className="mb-20 p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3>Recent Expenses</h3>
            <Button size="sm" variant="ghost" className="text-blue-600 h-8">
              See All
            </Button>
          </div>
          <div className="space-y-3">
            {recentExpenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                    {expense.icon}
                  </div>
                  <div>
                    <p>{expense.name}</p>
                    <p className="text-xs text-gray-500">
                      {expense.category} • {expense.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-600">-${expense.amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}