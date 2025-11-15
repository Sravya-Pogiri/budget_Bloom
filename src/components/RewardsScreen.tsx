import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Sprout, Award, Sparkles, CheckCircle2 } from "lucide-react";

export function RewardsScreen() {
  const treeLevel = {
    level: 4,
    stage: "Young Sapling",
    progress: 65,
    totalSaved: 1240,
  };

  const rewards = [
    {
      type: "Leaves",
      title: "Budget Champion",
      icon: "🍃",
      count: 24,
      description: "Earned for staying under budget",
      details: "You've stayed under budget 24 times! Keep it up!",
      earned: true,
      color: "emerald",
    },
    {
      type: "Leaves",
      title: "Perfect Week Streak",
      icon: "🍃",
      count: 8,
      description: "Awarded for perfect streak week",
      details: "Completed 8 weeks with perfect budgeting streaks",
      earned: true,
      color: "emerald",
    },
    {
      type: "Branches",
      title: "Growth Milestone",
      icon: "🌿",
      count: 6,
      description: "Unlocked at Level 3",
      details: "Your tree is growing stronger with new branches!",
      earned: true,
      color: "amber",
    },
    {
      type: "Flowers",
      title: "Goal Achiever",
      icon: "🌸",
      count: 3,
      description: "Earned from hitting savings goals",
      details: "Completed 3 major savings goals successfully",
      earned: true,
      color: "pink",
    },
    {
      type: "Flowers",
      title: "Event Participant",
      icon: "🌺",
      count: 2,
      description: "Attended campus wellness events",
      details: "Participated in 2 campus financial wellness events",
      earned: true,
      color: "pink",
    },
    {
      type: "Gold Vines",
      title: "Legendary Saver",
      icon: "✨",
      count: 1,
      description: "Unlock at Level 5",
      details: "Reach Level 5 to unlock this prestigious reward",
      earned: false,
      color: "yellow",
    },
  ];

  const recentAchievements = [
    { title: "Stayed under budget", date: "Today", icon: "✅", color: "emerald" },
    { title: "7-day streak!", date: "Yesterday", icon: "🔥", color: "orange" },
    { title: "Attended campus event", date: "Nov 13", icon: "🎉", color: "blue" },
    { title: "Healthy meal choice", date: "Nov 12", icon: "🥗", color: "green" },
  ];

  const colorClasses = {
    emerald: "from-emerald-400 to-emerald-600",
    amber: "from-amber-400 to-amber-600",
    pink: "from-pink-400 to-pink-600",
    yellow: "from-[#FCD535] to-yellow-600",
    orange: "from-orange-400 to-orange-600",
    blue: "from-blue-400 to-blue-600",
    green: "from-green-400 to-green-600",
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-emerald-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
        <h2 className="mb-2">Grow Your Money Tree</h2>
        <p className="text-blue-100 text-sm">
          Build smart habits, hit your budget goals, and grow your Money Tree to unlock rewards.
        </p>
      </div>

      <div className="p-4">
        {/* Money Tree */}
        <Card className="mb-4 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-600" />
              <h3 className="text-emerald-800">Your Money Tree</h3>
            </div>
            <Badge className="bg-emerald-500">Level {treeLevel.level}</Badge>
          </div>

          <div className="text-center mb-6">
            <div className="text-8xl mb-3">🌳</div>
            <h3 className="text-emerald-700 mb-1">{treeLevel.stage}</h3>
            <p className="text-sm text-gray-600">Every good decision makes it grow!</p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress to Level 5</span>
              <span className="text-emerald-600">{treeLevel.progress}%</span>
            </div>
            <Progress value={treeLevel.progress} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl text-emerald-700 mb-1">${treeLevel.totalSaved}</p>
              <p className="text-xs text-gray-600">Total Saved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#FCD535] mb-1">42</p>
              <p className="text-xs text-gray-600">Total Rewards</p>
            </div>
          </div>
        </Card>

        {/* Rewards Earned */}
        <Card className="mb-4 p-4 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-[#FCD535]" />
            <h3>Your Rewards</h3>
          </div>
          <div className="space-y-3">
            {rewards.map((reward, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  reward.earned ? "bg-gradient-to-r opacity-100" : "bg-gray-100 opacity-50"
                } ${reward.earned ? colorClasses[reward.color as keyof typeof colorClasses] : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{reward.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={reward.earned ? "text-white" : "text-gray-600"}>
                          {reward.type}
                        </p>
                        {reward.earned && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <p className={`text-sm ${reward.earned ? "text-white/80" : "text-gray-500"}`}>
                        {reward.description}
                      </p>
                      <p className={`text-xs ${reward.earned ? "text-white/80" : "text-gray-500"}`}>
                        {reward.details}
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl ${reward.earned ? "text-white" : "text-gray-600"}`}>
                    ×{reward.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* How to Earn */}
        <Card className="mb-4 p-4 bg-gradient-to-br from-[#FCD535] to-yellow-400">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-gray-900" />
            <h3 className="text-gray-900">How to Earn Rewards</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-800">
            <li className="flex items-start gap-2">
              <span>🍃</span>
              <span>Stay under budget and maintain perfect streaks</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🌿</span>
              <span>Level up your Money Tree by saving consistently</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🌸</span>
              <span>Complete savings goals and attend campus events</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✨</span>
              <span>Unlock rare rewards at higher levels</span>
            </li>
          </ul>
        </Card>

        {/* Recent Achievements */}
        <Card className="mb-20 p-4 bg-white">
          <h3 className="mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <p>{achievement.title}</p>
                  <p className="text-xs text-gray-500">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}