import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Award, CheckCircle2, Lock } from "lucide-react";

export function NewRewardsScreen() {
  const rewards = [
    {
      type: "Leaves",
      icon: "🍃",
      count: 24,
      description: "Earned for staying under budget",
      earned: true,
      color: "emerald",
    },
    {
      type: "Leaves",
      icon: "🍃",
      count: 8,
      description: "Awarded for perfect streak week",
      earned: true,
      color: "emerald",
    },
    {
      type: "Branches",
      icon: "🌿",
      count: 6,
      description: "Unlocked at Level 3",
      earned: true,
      color: "amber",
    },
    {
      type: "Flowers",
      icon: "🌸",
      count: 3,
      description: "Earned from hitting savings goals",
      earned: true,
      color: "pink",
    },
    {
      type: "Gold Vines",
      icon: "✨",
      count: 0,
      description: "Unlock at Level 5 - Keep going!",
      earned: false,
      color: "yellow",
    },
  ];

  const recentAchievements = [
    { title: "Stayed under budget", date: "Today", icon: "✅", color: "emerald" },
    { title: "7-day streak!", date: "Yesterday", icon: "🔥", color: "orange" },
    { title: "Attended campus event", date: "Nov 13", icon: "🎉", color: "blue" },
    { title: "Healthy meal choice", date: "Nov 12", icon: "🥗", color: "green" },
    { title: "Used campus resources", date: "Nov 11", icon: "🎓", color: "purple" },
  ];

  const colorClasses = {
    green: "bg-emerald-500",
    blue: "bg-blue-500",
    pink: "bg-pink-500",
    purple: "bg-purple-500",
    yellow: "bg-[#FCD535]",
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-[#FCD535] text-gray-900 p-6 rounded-b-3xl shadow-sm">
        <h2 className="mb-2">Your Rewards</h2>
        <p className="text-gray-700 text-sm">
          Every good decision counts — from staying under budget to attending campus events.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Rewards Summary */}
        <Card className="p-6 bg-white border-0 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Total Rewards Earned</h3>
            <Badge className="bg-[#FCD535] text-gray-900 text-lg px-4 py-1.5 rounded-xl shadow-sm">41</Badge>
          </div>
          <div className="flex items-center justify-center gap-4 text-5xl">
            <span>🍃</span>
            <span>🌿</span>
            <span>🌸</span>
            <span className="opacity-40">✨</span>
          </div>
        </Card>

        {/* Rewards Collection */}
        <Card className="p-5 bg-white border-0 shadow-sm rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-[#FCD535]" />
            <h3>Reward Collection</h3>
          </div>
          <div className="space-y-3">
            {rewards.map((reward, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl relative overflow-hidden transition-all ${
                  reward.earned 
                    ? `${colorClasses[reward.color as keyof typeof colorClasses]} shadow-sm` 
                    : "bg-gray-50 border-2 border-dashed border-gray-300"
                }`}
              >
                {!reward.earned && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl ${!reward.earned ? "grayscale opacity-30" : ""}`}>
                      {reward.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className={reward.earned ? "text-white" : "text-gray-600"}>
                          {reward.type}
                        </p>
                        {reward.earned && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <p className={`text-sm ${reward.earned ? "text-white/90" : "text-gray-500"}`}>
                        {reward.description}
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl ${reward.earned ? "text-white" : "text-gray-400"}`}>
                    ×{reward.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* How to Earn More */}
        <Card className="p-5 bg-white border-0 shadow-sm rounded-3xl">
          <h3 className="mb-3">How to Earn Rewards</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
              <span className="text-2xl">🍃</span>
              <div>
                <p className="font-medium text-emerald-800">Leaves</p>
                <p className="text-emerald-700">Stay under budget & maintain streaks</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
              <span className="text-2xl">🌿</span>
              <div>
                <p className="font-medium text-amber-800">Branches</p>
                <p className="text-amber-700">Level up by consistent saving</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-xl">
              <span className="text-2xl">🌸</span>
              <div>
                <p className="font-medium text-pink-800">Flowers</p>
                <p className="text-pink-700">Complete goals & attend events</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-medium text-yellow-800">Gold Vines</p>
                <p className="text-yellow-700">Rare rewards at Level 5+</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Achievements */}
        <Card className="mb-20 p-5 bg-white border-0 shadow-sm rounded-3xl">
          <h3 className="mb-4">Recent Achievements</h3>
          <div className="space-y-2">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <p>{achievement.title}</p>
                  <p className="text-xs text-gray-500">{achievement.date}</p>
                </div>
                <span className="text-emerald-600 text-sm">+1 🍃</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}