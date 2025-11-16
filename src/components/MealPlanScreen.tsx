import React, { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Utensils, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

type MealPlanScreenProps = {
  onClose?: () => void;
};

export function MealPlanScreen({ onClose }: MealPlanScreenProps) {
  const proxy = import.meta.env.VITE_RUTGERS_PROXY;
  const skey = import.meta.env.VITE_RUTGERS_SKEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealSwipes, setMealSwipes] = useState<number | null>(null);
  const [diningDollars, setDiningDollars] = useState<number | null>(null);
  const [ruExpress, setRuExpress] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!proxy || !skey) return;
      setLoading(true);
      setError(null);
      try {
        // Prefer statement detail page (richer data)
        const statementUrl = `https://services.jsatech.com/statementdetail.php?skey=${encodeURIComponent(
          skey
        )}&cid=52&acct=15&startdate=2025-05-01&enddate=2025-12-31`;
        const endpoint = `${proxy}/api/rutgers-balance?skey=${encodeURIComponent(skey)}&url=${encodeURIComponent(
          statementUrl
        )}`;
        const resp = await fetch(endpoint, { headers: { Accept: "text/html" } });
        if (!resp.ok) throw new Error(`Upstream ${resp.status}`);
        const html = await resp.text();
        // Parse via DOMParser
        const doc = new DOMParser().parseFromString(html, "text/html");
        // Try to find tables with class 'jsa_transactions' and "Current Balance"
        const tables = Array.from(doc.querySelectorAll("table.jsa_transactions"));
        let ms: number | null = null;
        let dd: number | null = null;
        let re: number | null = null;
        for (const table of tables) {
          const heading = table.previousElementSibling?.textContent?.toLowerCase() || "";
          const balanceRow = Array.from(table.querySelectorAll("tr")).find((row) => {
            const desc = row.querySelector("td.jsa_desc")?.textContent || "";
            return /current balance/i.test(desc);
          });
          const amountCell = balanceRow?.querySelector("td.jsa_amount.pos");
          const num = amountCell?.textContent?.match(/(\d+\.?\d*)/)?.[1];
          const value = num ? parseFloat(num) : null;
          if (value !== null) {
            if (heading.includes("meal")) ms = value;
            else if (heading.includes("dining")) dd = value;
            else if (heading.includes("express")) re = value;
          }
        }
        // Fallback simple regex if DOM approach fails
        if (ms === null) {
          const m = html.match(/meal[^<]*current balance[^<]*?(\d+\.?\d*)/i);
          if (m) ms = parseFloat(m[1]);
        }
        setMealSwipes(ms);
        setDiningDollars(dd);
        setRuExpress(re);
        setLastUpdated(new Date().toISOString());
      } catch (e: any) {
        setError(e?.message || "Failed to load meal plan data");
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [proxy, skey]);

  const model = useMemo(() => {
    if (!geminiKey) return null;
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      try {
        return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      } catch {
        return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      }
    } catch {
      return null;
    }
  }, [geminiKey]);

  const askGemini = async () => {
    if (!question.trim()) return;
    setAnswer(null);
    if (!model) {
      setAnswer("Model not configured. Add VITE_GEMINI_API_KEY in .env");
      return;
    }
    setAnswerLoading(true);
    try {
      const context = `Meal Swipes: ${mealSwipes ?? "unknown"}, Dining Dollars: ${diningDollars ?? "unknown"}, RU Express: ${ruExpress ?? "unknown"}.`;
      const prompt = `You are a supportive assistant using Rutgers meal plan context.\nContext: ${context}\nQuestion: ${question}\nAnswer concisely for a student.`;
      const res = await model.generateContent(prompt);
      const text = (await res.response).text();
      setAnswer(text.trim());
    } catch (e: any) {
      setAnswer(e?.message || "Failed to get response");
    } finally {
      setAnswerLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="bg-[#FCD535] text-gray-900 p-6 rounded-b-3xl shadow-sm">
        <h2 className="mb-2">Meal Plan</h2>
        <p className="text-gray-700 text-sm">
          Track your meal swipes and dining dollars.
        </p>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-6 bg-white border-0 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              <h3 className="text-gray-900">Meal Plan Balance</h3>
            </div>
            <Button variant="ghost" className="h-8" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-700 space-y-2">
            <div className="flex items-center gap-2">
              {skey ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-gray-400" />}
              <span>{skey ? "Session key detected" : "Add VITE_RUTGERS_SKEY in .env"}</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gray-700" : "text-gray-500"}`} />
              <span>{proxy ? `Proxy: ${proxy}` : "Set VITE_RUTGERS_PROXY and run: npm run proxy"}</span>
            </div>
            {error && <div className="text-red-600">Error: {error}</div>}
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                <div className="text-xs text-emerald-700">Meal Swipes</div>
                <div className="text-xl font-semibold text-emerald-700">{mealSwipes ?? "—"}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                <div className="text-xs text-blue-700">Dining $</div>
                <div className="text-xl font-semibold text-blue-700">
                  {diningDollars !== null ? `$${diningDollars.toFixed(2)}` : "—"}
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                <div className="text-xs text-purple-700">RU Express</div>
                <div className="text-xl font-semibold text-purple-700">
                  {ruExpress !== null ? `$${ruExpress.toFixed(2)}` : "—"}
                </div>
              </div>
            </div>
            {lastUpdated && <div className="text-xs text-gray-500">Updated: {new Date(lastUpdated).toLocaleString()}</div>}
          </div>
        </Card>

        <Card className="p-5 bg-white border-0 shadow-sm rounded-3xl">
          <h3 className="mb-2">What you can ask</h3>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>
              If my last day of classes is December 10, when will I run out of
              meal swipes?
            </li>
            <li>How many times a day can I eat ideally?</li>
            <li>How did I use Dining Dollars vs. meal swipes this week?</li>
          </ul>
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about your meal plan…"
                className="flex-1 rounded-md border border-gray-200 px-3 h-10"
              />
              <Button onClick={askGemini} disabled={answerLoading} className="h-10">
                {answerLoading ? "Thinking…" : "Ask"}
              </Button>
            </div>
            {answer && <div className="mt-3 text-sm text-gray-800">{answer}</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}


