import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Sprout, TrendingUp, Award, Brain } from "lucide-react";
import { TreeLogo } from "./TreeLogo";

interface HomeScreenProps {
  onGetStarted: () => void;
}

export function HomeScreen({ onGetStarted }: HomeScreenProps) {
  const features = [
    {
      icon: Brain,
      title: "AI Money Assistant",
      description: "Get personalized advice to save smarter",
      color: "bg-blue-500",
    },
    {
      icon: Sprout,
      title: "Grow Your Money Tree",
      description: "Watch it grow with every good decision",
      color: "bg-emerald-500",
    },
    {
      icon: Award,
      title: "Earn Rewards",
      description: "Unlock leaves, branches, and flowers",
      color: "bg-[#FCD535]",
    },
    {
      icon: TrendingUp,
      title: "Track Your Budget",
      description: "See your progress in real-time",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Hero Section */}
      <div className="px-6 pt-8 pb-12 text-center">
        <div className="w-36 h-36 mx-auto mb-6 rounded-[36px] flex items-center justify-center shadow-2xl">
          <TreeLogo size={144} />
        </div>
        <h1 className="text-4xl text-gray-900 mb-3">Welcome to BudgetBloom</h1>
        <p className="text-lg text-gray-600 mb-8 px-4">
          Build smart habits, hit your budget goals, and grow your Money Tree to unlock rewards.
        </p>
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-3xl">🍃</span>
          <span className="text-3xl">🌿</span>
          <span className="text-3xl">🌸</span>
          <span className="text-3xl">✨</span>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 pb-24">
        <h2 className="text-2xl text-gray-900 mb-6 text-center">
          Everything you need to succeed
        </h2>
        <div className="space-y-3 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-5 bg-gray-50 border-0 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button
            onClick={onGetStarted}
            className="w-full bg-[#FCD535] hover:bg-yellow-400 text-gray-900 h-14 text-lg rounded-xl shadow-xl"
          >
            Get Started
          </Button>
      </div>
    </div>
  );
}