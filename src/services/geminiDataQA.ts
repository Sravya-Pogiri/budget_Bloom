import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildTransactionContextSnippet,
  loadTransactions,
} from "./dataContext";

// Ask Gemini with the transaction JSON as context so it can do real data analysis.
export async function askGeminiWithTransactions(
  question: string
): Promise<string> {
  const apiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_MODEL_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model:
      (import.meta as any).env?.VITE_GEMINI_MODEL ||
      "gemini-2.5-flash",
  });

  const transactions = await loadTransactions();
  const contextJson = buildTransactionContextSnippet(transactions, 200);

  const system = [
    "You are Budget Bloom, a helpful Rutgers student financial coach.",
    "You have access to the user's transaction JSON.",
    "When numbers are requested (totals, averages, counts), compute them using ONLY the provided data.",
    "Explain patterns briefly and suggest 1–2 concrete next steps.",
  ].join(" ");

  const prompt = `${system}

TRANSACTION JSON (sampled):
${contextJson}

USER QUESTION:
${question}

RESPONSE RULES:
- If the question asks 'how much did I spend' or similar, compute the value from the JSON.
- Show money as $X.XX.
- Keep answer under 150 words and be encouraging, not judgmental.
`;

  const result = await model.generateContent(prompt);
  // @ts-ignore - SDK response type
  return await result.response.text();
}


