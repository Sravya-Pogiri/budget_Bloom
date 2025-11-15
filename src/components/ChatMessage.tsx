import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Sprout, TrendingUp, Tag } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "budget-card" | "money-tree" | "coupons" | "savings-goals";
  data?: any;
}

export function ChatMessage({ role, content, type = "text", data }: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div className={`flex mb-4 ${isAssistant ? "" : "justify-end"}`}>
      <div className={`max-w-[75%] ${isAssistant ? "" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAssistant
              ? "bg-gray-200 text-gray-900"
              : "bg-blue-500 text-white"
          }`}
        >
          {type === "text" && <p className="whitespace-pre-wrap">{content}</p>}

          {type === "budget-card" && data && (
            <div className="space-y-3">
              <p className="mb-3">{content}</p>
              <Card className="p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Before Budget</span>
                  <span className="text-red-500">${data.before}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-red-400 h-2 rounded-full"
                    style={{ width: `${(data.before / data.budget) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">After Budget</span>
                  <span className="text-emerald-500">${data.after}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${(data.after / data.budget) * 100}%` }}
                  />
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-gray-600">Budget Limit</span>
                  <span className="text-gray-900">${data.budget}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600">
                    You saved ${data.before - data.after}!
                  </span>
                </div>
              </Card>
            </div>
          )}

          {type === "money-tree" && data && (
            <div className="space-y-3">
              <p className="mb-3">{content}</p>
              <Card className="p-5 bg-emerald-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-emerald-800">Money Tree Progress</h3>
                  </div>
                  <Badge className="bg-emerald-500">Level {data.level}</Badge>
                </div>
                <div className="text-center mb-3">
                  <div className="text-5xl mb-2">{data.emoji}</div>
                  <p className="text-emerald-700">{data.stage}</p>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-3">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${data.progress}%` }}
                  />
                </div>
                <p className="text-center mt-2 text-sm text-emerald-600">
                  {data.progress}% to next level
                </p>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-emerald-700">
                    💰 Total saved: ${data.totalSaved}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {type === "coupons" && data && (
            <div className="space-y-3">
              <p className="mb-3">{content}</p>
              <div className="space-y-2">
                {data.coupons.map((coupon: any, index: number) => (
                  <Card key={index} className="p-4 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-gray-900">{coupon.store}</h4>
                          <Badge className="bg-purple-500">{coupon.discount}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Category: {coupon.category}</span>
                          <span className="text-xs text-emerald-600">Save ~${coupon.savings}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {type === "savings-goals" && data && (
            <div className="space-y-3">
              <p className="mb-3">{content}</p>
              <div className="space-y-2">
                {data.goals.map((goal: any, index: number) => (
                  <Card key={index} className="p-4 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#FCD535] flex items-center justify-center text-2xl">
                        {goal.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-gray-900">{goal.title}</h4>
                          <Badge className="bg-emerald-500">Save ${goal.savings}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Current: ${goal.current}</span>
                          <span>Target: ${goal.target}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}