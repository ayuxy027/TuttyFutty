import { useState, useCallback, useRef } from "react";
import { StreamResponse } from "@/components/StreamingText";
import { streamChat } from "@/lib/api";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesRef = useRef<Message[]>([]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: input };
    
    // Update ref and state for user message
    messagesRef.current = [...messagesRef.current, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setCurrentResponse("");
    setIsStreaming(true);

    try {
      // Build chat messages from ref (includes full history)
      const chatMessages = messagesRef.current.map((m) => ({
        role: m.role,
        parts: m.content,
      }));

      const generator = streamChat(chatMessages);
      
      let fullResponse = "";
      for await (const chunk of generator) {
        fullResponse += chunk;
        setCurrentResponse((prev) => prev + chunk);
      }

      const assistantMessage: Message = { role: "model", content: fullResponse };
      messagesRef.current = [...messagesRef.current, assistantMessage];
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Stream error:", err);
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Chat</h1>

        <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                  : "bg-muted mr-auto max-w-[80%]"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          
          {isStreaming && (
            <div className="bg-muted p-4 rounded-lg mr-auto max-w-[80%]">
              <StreamResponse isStreaming={isStreaming} text={currentResponse} />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg border bg-background"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {isStreaming ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
