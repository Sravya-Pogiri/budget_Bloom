import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Target, Plus, TrendingUp } from "lucide-react";

interface SavingsGoal {
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export function SavingsGoalsScreen() {
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    { name: "New Laptop", targetAmount: 800, currentAmount: 245 },
    { name: "Spring Break Trip", targetAmount: 500, currentAmount: 150 },
    { name: "Emergency Fund", targetAmount: 1000, currentAmount: 400 },
  ]);

  const handleAddGoal = () => {
    if (goalName.trim() && goalTarget.trim()) {
      const newGoal: SavingsGoal = {
        name: goalName,
        targetAmount: parseFloat(goalTarget),
        currentAmount: parseFloat(goalCurrent) || 0,
      };
      setSavingsGoals([newGoal, ...savingsGoals]);
      setGoalName("");
      setGoalTarget("");
      setGoalCurrent("");
    }
  };

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-blue-500 text-white p-6 pb-8 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="mb-2">Savings Goals</h2>
            <p className="text-blue-100 text-sm">Track your progress toward your dreams</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Target className="w-8 h-8" />
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-100">Total Progress</p>
            <p className="text-sm font-medium">{overallProgress.toFixed(0)}%</p>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
            <div
              className="bg-white h-2.5 rounded-full transition-all"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-100">${totalSaved.toFixed(0)} saved</span>
            <span className="text-white font-medium">${totalTarget.toFixed(0)} target</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Add New Goal */}
        <Card className="p-5 bg-[#FEF3C7] border-0 shadow-sm rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Plus className="w-5 h-5 text-gray-900" />
            </div>
            <h3 className="text-gray-900">Add New Goal</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-800 mb-1 block">Goal Name</label>
              <Input
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g., New Laptop"
                className="w-full h-11 bg-white border-0 rounded-xl shadow-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-800 mb-1 block">Target Amount ($)</label>
              <Input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="800.00"
                className="w-full h-11 bg-white border-0 rounded-xl shadow-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-800 mb-1 block">Current Savings ($)</label>
              <Input
                type="number"
                value={goalCurrent}
                onChange={(e) => setGoalCurrent(e.target.value)}
                placeholder="0.00"
                className="w-full h-11 bg-white border-0 rounded-xl shadow-sm"
              />
            </div>
            <Button
              onClick={handleAddGoal}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 h-11 rounded-xl shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Goal
            </Button>
          </div>
        </Card>

        {/* Active Goals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900">Your Goals</h3>
            <p className="text-sm text-gray-500">{savingsGoals.length} active</p>
          </div>

          {savingsGoals.map((goal, index) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            
            return (
              <Card key={index} className="p-5 bg-white border-0 shadow-sm rounded-3xl hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-xl shadow-sm text-white">
                      🎯
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{goal.name}</p>
                      <p className="text-xs text-gray-500">
                        {progress >= 100 ? "Goal reached!" : `$${remaining.toFixed(0)} to go`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-medium">${goal.currentAmount.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">of ${goal.targetAmount.toFixed(0)}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all shadow-sm"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {progress >= 100 ? "🎉 Completed!" : `${progress.toFixed(0)}% complete`}
                  </p>
                  {progress >= 100 && (
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      Achieved
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Tips */}
        <Card className="mb-20 p-5 bg-emerald-50 border-0 shadow-sm rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-gray-900">Savings Tips</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Set specific, measurable goals with realistic timelines</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Automate your savings by setting up recurring transfers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Track your progress weekly to stay motivated</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}