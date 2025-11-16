import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Sprout, TrendingUp, Award, Target } from "lucide-react";

export function MoneyTreeScreen() {
  const achievements = [
    { id: 1, title: "First Save", icon: "💰", unlocked: true },
    { id: 2, title: "Week Streak", icon: "🔥", unlocked: true },
    { id: 3, title: "Budget Master", icon: "🎯", unlocked: true },
    { id: 4, title: "Coupon King", icon: "👑", unlocked: false },
    { id: 5, title: "Savings Pro", icon: "⭐", unlocked: false },
    { id: 6, title: "Money Tree", icon: "🌳", unlocked: false },
  ];

  const milestones = [
    { amount: 500, reached: true },
    { amount: 1000, reached: true },
    { amount: 2000, reached: false },
    { amount: 5000, reached: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-emerald-50 to-green-50">
      {/* Money Tree Progress */}
      <Card className="mb-4 p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            <h2 className="text-emerald-800">Money Tree</h2>
          </div>
          <Badge className="bg-emerald-500">Level 4</Badge>
        </div>

        <div className="text-center mb-6">
          <div className="text-8xl mb-3">🌱</div>
          <h3 className="text-emerald-700 mb-2">Young Sapling</h3>
          <p className="text-sm text-gray-600">Keep saving to grow your tree!</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress to Level 5</span>
            <span className="text-emerald-600">65%</span>
          </div>
          <Progress value={65} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-2xl text-emerald-700">$1,240</span>
            </div>
            <p className="text-xs text-gray-600">Total Saved</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-2xl text-blue-700">$2,000</span>
            </div>
            <p className="text-xs text-gray-600">Next Goal</p>
          </div>
        </div>
      </Card>

      {/* Milestones */}
      <Card className="mb-4 p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3>Savings Milestones</h3>
        </div>
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.amount}
              className={`flex items-center justify-between p-3 rounded-lg ${
                milestone.reached ? "bg-emerald-50" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    milestone.reached ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  {milestone.reached ? (
                    <span className="text-2xl">✓</span>
                  ) : (
                    <span className="text-2xl">🎯</span>
                  )}
                </div>
                <div>
                  <p className={milestone.reached ? "text-emerald-700" : "text-gray-600"}>
                    ${milestone.amount} Milestone
                  </p>
                  <p className="text-xs text-gray-500">
                    {milestone.reached ? "Completed!" : "Keep saving!"}
                  </p>
                </div>
              </div>
              {milestone.reached && (
                <Badge className="bg-emerald-500">✓</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Achievements */}
      <Card className="mb-4 p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-purple-600" />
          <h3>Achievements</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg text-center ${
                achievement.unlocked
                  ? "bg-gradient-to-br from-purple-50 to-pink-50"
                  : "bg-gray-100"
              }`}
            >
              <div className={`text-4xl mb-2 ${achievement.unlocked ? "" : "grayscale opacity-50"}`}>
                {achievement.icon}
              </div>
              <p className={`text-xs ${achievement.unlocked ? "text-purple-700" : "text-gray-500"}`}>
                {achievement.title}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Button */}
      <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 mb-20">
        Water Your Money Tree 💧
      </Button>
    </div>
  );
}
