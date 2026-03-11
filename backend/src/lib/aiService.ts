// AI Service - High-level API for AI operations
import { 
  generateContent, 
  chatGenerateContent,
  getModel,
  streamGenerateContent,
  streamChatGenerateContent,
  isGeminiConnected
} from "./gemini.js";
import { db } from "./db.js";
import { PROMPT_TEMPLATES, SYSTEM_PROMPTS, buildSystemMessage } from "./aiPrompts.js";

export type SystemType = keyof typeof SYSTEM_PROMPTS;

export interface GenerateOptions {
  prompt: string;
  conversationId?: number;
  userId?: number;
  stream?: boolean;
  onChunk?: (text: string) => void;
}

export interface ChatOptions {
  messages: { role: "user" | "model"; parts: string }[];
  conversationId?: number;
  userId?: number;
  systemType?: SystemType;
  stream?: boolean;
  onChunk?: (text: string) => void;
}

export interface FlashcardGenerationResult {
  success: boolean;
  flashcards?: Array<{ front: string; back: string }>;
  error?: string;
}

export interface QuizGenerationResult {
  success: boolean;
  quiz?: Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;
  error?: string;
}

class AIService {
  // Check if AI service is available
  isAvailable(): boolean {
    return isGeminiConnected();
  }

  // Generate content from a simple prompt
  async generate(prompt: string): Promise<string | null> {
    return generateContent(prompt);
  }

  // Generate content with streaming
  async* generateStream(prompt: string, onChunk: (text: string) => void): AsyncGenerator<string> {
    const result = await streamGenerateContent(prompt, onChunk);
    if (!result) return;
    yield result;
  }

  // Chat with history
  async chat(messages: { role: "user" | "model"; parts: string }[]): Promise<string | null> {
    return chatGenerateContent(messages);
  }

  // Chat with streaming
  async* chatStream(
    messages: { role: "user" | "model"; parts: string }[], 
    onChunk: (text: string) => void
  ): AsyncGenerator<string> {
    const result = await streamChatGenerateContent(messages, onChunk);
    if (!result) return;
    yield result;
  }

  // Generate flashcards from a topic
  async generateFlashcards(topic: string, count: number = 5): Promise<FlashcardGenerationResult> {
    const prompt = PROMPT_TEMPLATES.generateFlashcards(topic, count);
    const result = await this.generate(prompt);

    if (!result) {
      return { success: false, error: "AI service not available" };
    }

    try {
      // Try to parse JSON from the response
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const flashcards = JSON.parse(jsonMatch[0]);
        return { success: true, flashcards };
      }
      return { success: false, error: "Could not parse flashcards" };
    } catch (e) {
      return { success: false, error: "Failed to parse flashcards" };
    }
  }

  // Generate quiz questions from a topic
  async generateQuiz(topic: string, count: number = 5): Promise<QuizGenerationResult> {
    const prompt = PROMPT_TEMPLATES.generateQuiz(topic, count);
    const result = await this.generate(prompt);

    if (!result) {
      return { success: false, error: "AI service not available" };
    }

    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const quiz = JSON.parse(jsonMatch[0]);
        return { success: true, quiz };
      }
      return { success: false, error: "Could not parse quiz" };
    } catch (e) {
      return { success: false, error: "Failed to parse quiz" };
    }
  }

  // Summarize text
  async summarize(text: string, maxLength: number = 100): Promise<string | null> {
    const prompt = PROMPT_TEMPLATES.summarize(text, maxLength);
    return this.generate(prompt);
  }

  // Get goal planning advice
  async planGoal(goalTitle: string, description: string): Promise<string | null> {
    const prompt = PROMPT_TEMPLATES.goalPlan(goalTitle, description);
    return this.generate(prompt);
  }

  // Get habit advice
  async getHabitAdvice(habit: string): Promise<string | null> {
    const prompt = PROMPT_TEMPLATES.habitAdvice(habit);
    return this.generate(prompt);
  }

  // Get journal prompt based on mood
  getJournalPrompt(mood?: string): string {
    return PROMPT_TEMPLATES.journalPrompt(mood);
  }

  // Explain a topic
  async explainTopic(topic: string): Promise<string | null> {
    const prompt = PROMPT_TEMPLATES.explainTopic(topic);
    return this.generate(prompt);
  }

  // Brainstorm ideas
  async brainstorm(topic: string, count: number = 5): Promise<string | null> {
    const prompt = PROMPT_TEMPLATES.brainstorm(topic, count);
    return this.generate(prompt);
  }

  // Chat with a specific system type
  async chatWithSystem(
    userMessage: string, 
    systemType: SystemType = "default"
  ): Promise<string | null> {
    const messages = [
      buildSystemMessage(systemType),
      { role: "user" as const, parts: userMessage }
    ];
    return this.chat(messages);
  }

  // Create a new conversation
  createConversation(userId: number, title: string, model: string = "gemini-2.0-flash") {
    return db.create("ai_conversations", {
      user_id: userId,
      title,
      model,
    });
  }

  // Get all conversations for a user
  getConversations(userId: number) {
    return db.findMany("ai_conversations", { user_id: userId });
  }

  // Get a specific conversation
  getConversation(userId: number, conversationId: number) {
    return db.findOne("ai_conversations", { id: conversationId, user_id: userId });
  }

  // Get messages for a conversation
  getMessages(conversationId: number) {
    return db.findMany("ai_messages", { conversation_id: conversationId });
  }

  // Update conversation title
  updateConversation(conversationId: number, title: string) {
    return db.update("ai_conversations", conversationId, { title });
  }

  // Delete conversation (cascades to messages)
  deleteConversation(conversationId: number) {
    return db.delete("ai_conversations", conversationId);
  }
}

export const aiService = new AIService();
