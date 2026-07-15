import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = "gemini-flash-lite-latest";

export function getGeminiClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
}
