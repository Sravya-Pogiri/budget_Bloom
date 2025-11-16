import React from "react";
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Utensils } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { MealPlanScreen } from "./MealPlanScreen";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { askGeminiWithTransactions } from "../services/geminiDataQA";
import { loadTransactions, TransactionRecord } from "../services/dataContext";

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
      content: "Hi! I'm Blossom, your AI financial assistant. I can help you track your budget, grow your Money Tree, and suggest smart savings goals based on your spending habits. What would you like to know?",
      type: "text",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [geminiReady, setGeminiReady] = useState(false);
  const genAIRef = useRef<GoogleGenerativeAI | null>(null);
  const modelRef = useRef<ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null>(null);
  const transactionsCacheRef = useRef<TransactionRecord[] | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Gemini once
  useEffect(() => {
    const apiKey =
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      (import.meta as any).env?.VITE_MODEL_API_KEY;
    try {
      if (apiKey) {
        genAIRef.current = new GoogleGenerativeAI(apiKey);
        modelRef.current = genAIRef.current.getGenerativeModel({
          model: (import.meta as any).env?.VITE_GEMINI_MODEL || "gemini-1.5-flash",
        });
        setGeminiReady(true);
      } else {
        setGeminiReady(false);
      }
    } catch {
      setGeminiReady(false);
    }
  }, []);

  // Load and cache CSV transactions (for offline merchant Q&A)
  const loadTransactionsIfNeeded = async () => {
    if (transactionsCacheRef.current) return transactionsCacheRef.current;
    const rows = await loadTransactions();
    transactionsCacheRef.current = rows;
    return rows;
  };

  const getReferenceDate = (rows: TransactionRecord[]) => {
    let latest = 0;
    rows.forEach((row) => {
      const time = new Date(row.date).getTime();
      if (!isNaN(time)) {
        latest = Math.max(latest, time);
      }
    });
    if (!latest) return new Date();
    const now = Date.now();
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
    if (Math.abs(now - latest) > THIRTY_DAYS) {
      return new Date(latest);
    }
    return new Date();
  };

  const formatWeekLabel = (start: Date, end: Date) => {
    const endInclusive = new Date(end);
    endInclusive.setDate(endInclusive.getDate() - 1);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString(undefined, opts)}-${endInclusive.toLocaleDateString(undefined, opts)}`;
  };

  const getThisWeekRange = (referenceDate?: Date) => {
    const now = referenceDate ? new Date(referenceDate) : new Date();
    const day = now.getDay(); // 0 = Sunday
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return { start, end };
  };

  // Detect: "how much did I spend on {merchant} this month"
  const tryMerchantSpendAnswer = async (userMessage: string) => {
    const lower = userMessage.toLowerCase();
    const match = lower
      .toLowerCase()
      .match(/how\s+much\s+did\s+i\s+spend\s+on\s+(.+?)\s+(this|in\s+the)\s+(week|month)/);
    if (!match) return null;
    const merchantQuery = match[1].trim();
    const period = match[3]; // 'week' | 'month'
    const rows = await loadTransactionsIfNeeded();
    const referenceDate = getReferenceDate(rows);
    let filtered: TransactionRecord[] = [];
    let label = "";
    if (period === "week") {
      const { start, end } = getThisWeekRange(referenceDate);
      filtered = rows.filter((r) => {
        const d = new Date(r.date);
        return (
          d >= start &&
          d < end &&
          String(r.merchant).toLowerCase() === merchantQuery.toLowerCase()
        );
      });
      label = `during the week of ${formatWeekLabel(start, end)}`;
    } else {
      const month = referenceDate.getMonth();
      const year = referenceDate.getFullYear();
      filtered = rows.filter((r) => {
        const d = new Date(r.date);
        return (
          d.getMonth() === month &&
          d.getFullYear() === year &&
          String(r.merchant).toLowerCase() === merchantQuery.toLowerCase()
        );
      });
      label = `in ${referenceDate.toLocaleString(undefined, { month: "long", year: "numeric" })}`;
    }
    if (filtered.length === 0) return null;
    const total = filtered.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    return {
      merchant: filtered[0]?.merchant || merchantQuery,
      total,
      count: filtered.length,
      label,
    };
  };

  const askGemini = async (userMessage: string) => {
    setIsTyping(true);
    setShowActions(false);
    const systemPreamble =
      "You are Budget Bloom, a concise, helpful Rutgers student financial assistant. Answer clearly in under 150 words unless asked for more.";
    const prompt = `${systemPreamble}\n\nUser: ${userMessage}`;

    try {
      try {
        // First try CSV-backed answer for merchant-spend queries
        const csvAnswer = await tryMerchantSpendAnswer(userMessage);
        if (csvAnswer) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `You spent $${csvAnswer.total.toFixed(2)} at ${csvAnswer.merchant} ${csvAnswer.label} across ${csvAnswer.count} transaction(s), based on your CSV.`,
              type: "text",
            },
          ]);
          // Also ask Gemini with full transaction context for a richer explanation if configured
          if (geminiReady) {
            try {
              const ai = await askGeminiWithTransactions(userMessage);
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  role: "assistant",
                  content: ai,
                  type: "text",
                },
              ]);
            } catch (ctxErr) {
              console.warn("Gemini context call failed", ctxErr);
            }
          }
          return;
        }
      } catch (csvError) {
        console.warn("CSV intent failed", csvError);
      }

      if (!geminiReady || !modelRef.current) {
        // Fallback when no API key
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content:
              "AI is unavailable because no Gemini API key is configured. Add VITE_GEMINI_API_KEY to your .env and restart.",
            type: "text",
          },
        ]);
        return;
      }
      // Prefer Gemini with transaction context
      try {
        const ai = await askGeminiWithTransactions(userMessage);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: ai,
            type: "text",
          },
        ]);
        return;
      } catch {
        // If context call fails, fall back to plain model
      }
      const result = await modelRef.current.generateContent(prompt);
      // SDK returns a response object; text() produces final text
      // @ts-ignore
      const text = await result.response.text();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: text || "I couldn't find an answer. Try rephrasing your question.",
          type: "text",
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "I had trouble contacting Gemini. Please check your network and VITE_GEMINI_API_KEY, then try again.",
          type: "text",
        },
      ]);
    } finally {
      setIsTyping(false);
      setShowActions(true);
    }
  };

  // For now, route every request to Gemini
  const simulateAIResponse = (userMessage: string) => {
    askGemini(userMessage);
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
        message = "How can I stay under budget this month? Give concrete steps.";
        break;
      case "avoid-impulse-buys":
        message = "Help me avoid impulse buys. Give tactics I can apply today.";
        break;
      case "attended-free-events":
        message = "Suggest free campus events ideas and ways to have fun for $0.";
        break;
      case "tracked-spendings":
        message = "What are good ways to track my spending as a Rutgers student?";
        break;
      case "healthy-choices":
        message = "How can I make healthy choices that also save money?";
        break;
      case "daily-insights":
        message = "Give me daily financial insights tailored to a Rutgers student.";
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
        <Button
          className="w-full bg-[#FCD535] hover:bg-yellow-400 text-gray-900 h-12 gap-2 rounded-xl shadow-lg"
          onClick={() => setShowMealPlan(true)}
        >
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
      {/* Meal Plan Modal */}
      <Dialog open={showMealPlan} onOpenChange={setShowMealPlan}>
        <DialogContent className="bg-white p-0 max-w-[420px] w-full">
          <MealPlanScreen onClose={() => setShowMealPlan(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
