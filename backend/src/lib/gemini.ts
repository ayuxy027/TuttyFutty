import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { env } from "../config/env.js";

let genAI: GoogleGenerativeAI | null = null;

export function initGemini(): GoogleGenerativeAI | null {
  if (!env.GEMINI_API_KEY) {
    console.warn("Gemini API key not configured");
    return null;
  }

  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return genAI;
}

export function getGemini(): GoogleGenerativeAI | null {
  if (!genAI) {
    return initGemini();
  }
  return genAI;
}

export function isGeminiConnected(): boolean {
  return genAI !== null;
}

export function getModel(): GenerativeModel | null {
  const gemini = getGemini();
  if (!gemini) return null;
  return gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
}

export async function generateContent(prompt: string): Promise<string | null> {
  const model = getModel();
  if (!model) return null;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function streamGenerateContent(
  prompt: string,
  onChunk: (text: string) => void
): Promise<string | null> {
  const model = getModel();
  if (!model) return null;

  const result = await model.generateContentStream(prompt);
  
  let fullText = "";
  for await (const chunk of result.stream) {
    const text = chunk.text();
    fullText += text;
    onChunk(text);
  }
  
  return fullText;
}

export async function chatGenerateContent(
  messages: { role: "user" | "model"; parts: string }[]
): Promise<string | null> {
  const model = getModel();
  if (!model) return null;

  const chat = model.startChat({
    history: messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.parts }],
    })),
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.parts);
  return result.response.text();
}

export async function streamChatGenerateContent(
  messages: { role: "user" | "model"; parts: string }[],
  onChunk: (text: string) => void
): Promise<string | null> {
  const model = getModel();
  if (!model) return null;

  const chat = model.startChat({
    history: messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.parts }],
    })),
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessageStream(lastMessage.parts);
  
  let fullText = "";
  for await (const chunk of result.stream) {
    const text = chunk.text();
    fullText += text;
    onChunk(text);
  }
  
  return fullText;
}
