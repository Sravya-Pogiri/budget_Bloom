import React from "react";
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Utensils } from "lucide-react";
import { analyzeSpending, loadTransactionCSV } from "../services/csvParser";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "budget-card" | "money-tree" | "coupons" | "savings-goals";
  data?: any;
}

export function NewChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI financial assistant. I can help you track your budget, grow your Money Tree, and suggest smart savings goals based on your spending habits. What would you like to know?",
      type: "text",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeSpending> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const tx = await loadTransactionCSV("/final_wallet_transactions_sample.csv");
      if (!mounted) return;
      const a = analyzeSpending(tx);
      setAnalysis(a);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    setShowActions(false);

    setTimeout(() => {
      const lowerMessage = userMessage.toLowerCase();

      // Q&A from CSV: "how much did i spend on <merchant> this month"
      const spendMatch = lowerMessage.match(/how much did i spend on ([a-z0-9 '&-]+)/i);
      if (spendMatch && analysis) {
        const merchantQuery = spendMatch[1].trim();
        const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const total = (analysis.recentTransactions || [])
          .filter((t) => {
            const tMonth = (t.date || "").slice(0, 7);
            return tMonth === thisMonth && t.merchant.toLowerCase().includes(merchantQuery);
          })
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `You spent $${total.toFixed(2)} at ${merchantQuery} this month.`,
            type: "text",
          },
        ]);
        setIsTyping(false);
        setShowActions(true);
        return;
      }

      if (lowerMessage.includes("budget") || lowerMessage.includes("under budget")) {
        const monthlyBudget = Number(import.meta.env.VITE_MONTHLY_BUDGET ?? 3000);
        const spent = analysis?.totalSpent ?? 0;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Excellent! Here's your budget tracking for this month:",
            type: "budget-card",
            data: {
              before: Math.round(spent),
              after: Math.round(spent),
              budget: monthlyBudget,
            },
          },
        ]);
      } else if (lowerMessage.includes("goal") || lowerMessage.includes("save")) {
        const categories = analysis?.categoryBreakdown ?? {};
        const top = Object.entries(categories)
          .map(([title, v]) => ({ title, current: v.total }))
          .sort((a, b) => b.current - a.current)
          .slice(0, 3);
        const goals =
          top.length > 0
            ? top.map((g) => {
                const target = Math.max(0, Math.round(g.current * 0.8));
                const savings = Math.round(g.current - target);
                const description =
                  g.title === "Dining"
                    ? "Cook 2 more meals per week"
                    : g.title === "Transport"
                    ? "Use campus transit more often"
                    : "Trim 20% this month";
                const icon =
                  g.title === "Dining" ? "🍽️" : g.title === "Books" ? "📚" : g.title === "Grocery" ? "🛒" : "💰";
                return {
                  title: g.title,
                  current: Math.round(g.current),
                  target,
                  savings,
                  description,
                  icon,
                };
              })
            : [
                {
                  title: "General Savings",
                  current: 0,
                  target: 0,
                  savings: 0,
                  description: "Spend mindfully this week",
                  icon: "💰",
                },
              ];
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Based on your spending patterns, here are personalized savings goals I recommend for you:",
            type: "savings-goals",
            data: {
              goals,
            },
          },
        ]);
      } else if (lowerMessage.includes("tree") || lowerMessage.includes("money tree")) {
        const monthlyBudget = Number(import.meta.env.VITE_MONTHLY_BUDGET ?? 3000);
        const spent = analysis?.totalSpent ?? 0;
        const progress = Math.max(0, Math.min(100, Math.round((1 - spent / Math.max(1, monthlyBudget)) * 100)));
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Your Money Tree is thriving! 🌳",
            type: "money-tree",
            data: {
              level: 4,
              stage: "Young Sapling",
              emoji: "🌱",
              progress,
              totalSaved: Math.max(0, Math.round(monthlyBudget - spent)),
            },
          },
        ]);
      } else if (
        lowerMessage.includes("coupon") ||
        lowerMessage.includes("campus") ||
        lowerMessage.includes("resources") ||
        lowerMessage.includes("daily insights") ||
        lowerMessage.includes("daily-insights")
      ) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Great choice! Here are personalized savings opportunities for you:",
            type: "coupons",
            data: {
              coupons: [
                {
                  store: "Campus Dining Hall",
                  discount: "Free meal",
                  description: "Use your meal plan credits",
                  category: "Food",
                  savings: 12,
                },
                {
                  store: "University Library",
                  discount: "Free",
                  description: "Textbook rental program",
                  category: "Education",
                  savings: 85,
                },
                {
                  store: "Campus Gym",
                  discount: "Free membership",
                  description: "Included in student fees",
                  category: "Health",
                  savings: 50,
                },
              ],
            },
          },
        ]);
      } else if (lowerMessage.includes("impulse") || lowerMessage.includes("track") || lowerMessage.includes("spending")) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Well done! I'm tracking your progress. You've avoided 3 impulse purchases this week and saved $127! Your spending habits are improving:\n\n✅ Waited 24hrs before purchases\n✅ Used the campus coffee shop\n✅ Packed lunch 4 times\n\nKeep up the great work! 🎉",
            type: "text",
          },
        ]);
      } else if (lowerMessage.includes("free") || lowerMessage.includes("event")) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Awesome! Attending free events is a smart way to have fun without spending. This month you've attended 5 free campus events and saved approximately $75 on entertainment! 🎉\n\nUpcoming free events:\n🎵 Friday concert at 7pm\n🎬 Movie night on Saturday\n🏃 Morning yoga classes",
            type: "text",
          },
        ]);
      } else if (lowerMessage.includes("health")) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Great focus on wellness! Making healthy choices saves money too:\n\n💪 Used campus gym (free)\n🥗 Cooked meals instead of eating out\n🚶 Walked instead of rideshare\n\nYou've saved $180 this month while staying healthy! Your Money Tree loves healthy choices! 🌱",
            type: "text",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "I'm here to help you make smart financial decisions! Try asking about:\n\n💰 Your budget tracking\n🌳 Money Tree progress\n🎯 Personalized savings goals\n🏷️ Campus resources and savings\n\nWhat would you like to explore?",
            type: "text",
          },
        ]);
      }

      setIsTyping(false);
      setShowActions(true);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    simulateAIResponse(inputValue);
  };

  const handleQuickAction = (action: string) => {
    let message = "";
    switch (action) {
      case "stay-under-budget":
        message = "Stay under budget";
        break;
      case "avoid-impulse-buys":
        message = "Avoid impulse buys";
        break;
      case "attended-free-events":
        message = "Attended free events";
        break;
      case "tracked-spendings":
        message = "Tracked spendings";
        break;
      case "healthy-choices":
        message = "Healthy choices";
        break;
      case "daily-insights":
        message = "Daily insights";
        break;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    simulateAIResponse(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            type={message.type}
            data={message.data}
          />
        ))}

        {isTyping && (
          <div className="flex mb-4">
            <div className="bg-gray-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {showActions && (
          <div className="mb-4">
            <QuickActions onActionClick={handleQuickAction} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Manage Meal Plan Button */}
      <div className="p-4 bg-white border-t">
        <Button className="w-full bg-[#FCD535] hover:bg-yellow-400 text-gray-900 h-12 gap-2 rounded-xl shadow-lg">
          <Utensils className="w-5 h-5" />
          Manage Meal Plan
        </Button>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 rounded-2xl bg-gray-50 border-gray-200 h-12"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isTyping || inputValue.trim() === ""}
            className="bg-blue-500 hover:bg-blue-600 rounded-xl w-12 h-12 p-0 shadow-md"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </>
  );
}