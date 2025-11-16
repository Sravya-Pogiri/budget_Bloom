import React from "react";
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Utensils } from "lucide-react";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    setShowActions(false);

    setTimeout(() => {
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes("budget") || lowerMessage.includes("under budget")) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Excellent! Here's your budget tracking for this month:",
            type: "budget-card",
            data: {
              before: 2850,
              after: 2150,
              budget: 3000,
            },
          },
        ]);
      } else if (lowerMessage.includes("goal") || lowerMessage.includes("save")) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Based on your spending patterns, here are personalized savings goals I recommend for you:",
            type: "savings-goals",
            data: {
              goals: [
                {
                  title: "Reduce Dining Out",
                  current: 680,
                  target: 500,
                  savings: 180,
                  description: "Cook 2 more meals per week",
                  icon: "🍽️",
                },
                {
                  title: "Coffee Savings",
                  current: 120,
                  target: 60,
                  savings: 60,
                  description: "Bring coffee from home 3x/week",
                  icon: "☕",
                },
                {
                  title: "Emergency Fund",
                  current: 340,
                  target: 500,
                  savings: 160,
                  description: "Save $40/week for 4 weeks",
                  icon: "💰",
                },
              ],
            },
          },
        ]);
      } else if (lowerMessage.includes("tree") || lowerMessage.includes("money tree")) {
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
              progress: 65,
              totalSaved: 1240,
            },
          },
        ]);
      } else if (lowerMessage.includes("coupon") || lowerMessage.includes("campus") || lowerMessage.includes("resources")) {
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
      case "used-campus-resources":
        message = "Used campus resources";
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