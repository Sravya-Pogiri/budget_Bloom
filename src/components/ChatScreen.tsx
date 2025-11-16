import React from "react";
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Coins } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { askGeminiWithTransactions } from "../services/geminiDataQA";
import { loadTransactions, TransactionRecord } from "../services/dataContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "budget-card" | "money-tree" | "coupons";
  data?: any;
}

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Welcome back! Ready to grow your savings and make smart decisions today? Select an action below or ask me anything! 💡",
      type: "text",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Load and cache CSV transactions
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
    start.setDate(now.getDate() - day); // Start of week (Sunday)
    const end = new Date(start);
    end.setDate(start.getDate() + 7); // exclusive end
    return { start, end };
  };

  // Simple NL intent: "how much did I spend on {merchant} this month"
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
    // CSV-backed intent first
    try {
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
        // Also ask Gemini with transaction context for richer explanation
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
          } catch {
            // ignore
          }
        }
        return;
      }
    } catch {
      // ignore CSV errors and fall through to Gemini
    }

    const systemPreamble =
      "You are Budget Bloom, a concise, helpful Rutgers student financial assistant. Answer clearly in under 150 words unless asked for more.";
    const prompt = `${systemPreamble}\n\nUser: ${userMessage}`;
    try {
      if (!geminiReady || !modelRef.current) {
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
      // Prefer Gemini with transaction context first
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
        // fallback to plain model
      }
      const result = await modelRef.current.generateContent(prompt);
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

  // Route all messages through Gemini flow (with CSV intent)
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
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
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

      {/* Reward Buttons */}
      <div className="p-3 bg-white border-t flex gap-2">
        <Button className="flex-1 bg-[#FCD535] hover:bg-[#FCD535]/90 text-gray-900 rounded-lg h-12 gap-2">
          <Coins className="w-5 h-5" />
          SAVE $10 ON NEXT BUY
        </Button>
        <Button className="flex-1 bg-[#FCD535] hover:bg-[#FCD535]/90 text-gray-900 rounded-lg h-12 gap-2">
          <Coins className="w-5 h-5" />
          SAVE $10 ON NEXT BUY
        </Button>
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 rounded-full"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isTyping || inputValue.trim() === ""}
            className="bg-blue-500 hover:bg-blue-600 rounded-full w-12 h-12 p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </>
  );
}
