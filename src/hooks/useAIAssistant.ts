// ─── AI Assistant Hook ───────────────────────────────────────────────────────
// Gemini 2.0 Flash with SynkDrop context injection.

import { useState, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAuth } from "@/context/AuthContext";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AssistantContext {
  onlineFriendsCount?: number;
  activeTransfersCount?: number;
  accountPaused?: boolean;
}

export function useAIAssistant(context?: AssistantContext) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (text: string): Promise<string> => {
    if (!GEMINI_API_KEY) {
      return "AI assistant is not configured yet. Please add your VITE_GEMINI_API_KEY.";
    }

    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, timestamp: Date.now() },
    ]);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const systemPrompt = `You are the SynkDrop assistant — a helpful, concise AI built into SynkDrop, a gesture-driven peer-to-peer file sharing app.

Current context:
- User: ${profile?.username ?? "unknown"}
- Online friends: ${context?.onlineFriendsCount ?? 0}
- Active transfers: ${context?.activeTransfersCount ?? 0}
- Account paused: ${context?.accountPaused ?? false}

Help with: transfer status, friend management, app features, connection issues, security questions.
Be concise and friendly. Use short responses. Never reveal security implementation details, cryptographic keys, or internal implementation.`;

      // Build conversation history for multi-turn
      const history = messages.slice(-10).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({
        history,
        systemInstruction: systemPrompt,
      });

      const result = await chat.sendMessage(text);
      const response = result.response.text();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response, timestamp: Date.now() },
      ]);

      return response;
    } catch (error) {
      const errMsg = "Sorry, I'm having trouble connecting right now. Try again in a moment.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errMsg, timestamp: Date.now() },
      ]);
      return errMsg;
    } finally {
      setIsLoading(false);
    }
  }, [profile, messages, context]);

  const clearHistory = useCallback(() => setMessages([]), []);

  return { messages, sendMessage, isLoading, clearHistory };
}
