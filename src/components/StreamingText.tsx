import { useState, useEffect, useRef } from "react";

interface StreamingTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export function StreamingText({ text, speed = 20, className = "" }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex >= text.length) return;

    const timeout = setTimeout(() => {
      setDisplayedText((prev) => prev + text[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, currentIndex, speed]);

  return (
    <div ref={containerRef} className={`streaming-text ${className}`}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">▊</span>
      )}
    </div>
  );
}

interface StreamResponseProps {
  isStreaming: boolean;
  text: string;
  className?: string;
}

export function StreamResponse({ isStreaming, text, className = "" }: StreamResponseProps) {
  const [visibleChars, setVisibleChars] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!text) {
      setVisibleChars(0);
      return;
    }

    if (isStreaming) {
      const interval = setInterval(() => {
        setVisibleChars((prev) => {
          if (prev >= text.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 15);

      return () => clearInterval(interval);
    } else {
      setVisibleChars(text.length);
    }
  }, [text, isStreaming]);

  const displayText = text.slice(0, visibleChars);

  return (
    <div 
      className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"} ${className}`}
    >
      {displayText}
      {isStreaming && <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5" />}
    </div>
  );
}

interface UseStreamReturn {
  text: string;
  isStreaming: boolean;
  error: string | null;
}

export function useStream(
  generator: AsyncGenerator<string> | null
): UseStreamReturn {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!generator) return;

    setText("");
    setIsStreaming(true);
    setError(null);

    const stream = async () => {
      try {
        for await (const chunk of generator) {
          setText((prev) => prev + chunk);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Stream error");
      } finally {
        setIsStreaming(false);
      }
    };

    stream();
  }, [generator]);

  return { text, isStreaming, error };
}
