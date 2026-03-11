import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Check, X, Shuffle, Loader2 } from "lucide-react";
import { apiRequest } from "../lib/api";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  deck: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: string;
}

interface ApiFlashcard {
  id: number;
  deck_name: string;
  front: string;
  back: string;
  difficulty: number;
}

const Flashcards = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, "correct" | "incorrect">>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<{ message: string; data: ApiFlashcard[] }>("/flashcards");
        const apiCards = response.data || [];
        const difficultyMap = ["easy", "medium", "hard"] as const;
        const formatted: Flashcard[] = apiCards.map((card) => ({
          id: String(card.id),
          front: card.front,
          back: card.back,
          deck: card.deck_name,
          difficulty: difficultyMap[card.difficulty - 1] || "medium",
        }));
        setCards(formatted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load flashcards");
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, []);

  const current = cards[currentIndex];
  const reviewed = Object.keys(results).length;

  const markResult = (result: "correct" | "incorrect") => {
    setResults({ ...results, [current.id]: result });
    setFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setResults({});
  };

  const correctCount = Object.values(results).filter((r) => r === "correct").length;
  const isDone = reviewed === cards.length;

  // Determine what to render based on state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-grid-4">
          <Loader2 className="animate-spin text-muted-foreground" size={20} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-grid-3">
          <p className="font-body text-xs text-destructive">{error}</p>
        </div>
      );
    }

    if (cards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-grid-4 text-center">
          <p className="font-body text-xs text-muted-foreground">No flashcards available</p>
        </div>
      );
    }

    if (isDone) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-grid-3 text-center"
        >
          <span className="font-mono text-3xl text-primary">
            {correctCount}/{cards.length}
          </span>
          <p className="font-body text-xs text-muted-foreground">
            Session complete. {correctCount === cards.length ? "Perfect score." : "Review incorrect cards."}
          </p>
          <button
            onClick={reset}
            className="flex items-center gap-grid rounded-lg border border-boundary px-grid-3 py-grid-2 font-mono text-xs text-foreground hover:border-primary"
          >
            <RotateCcw size={12} />
            Restart
          </button>
        </motion.div>
      );
    }

    // Show the flashcard
    return (
      <div className="flex w-full max-w-[480px] flex-col items-center gap-grid-3">
        <span className="font-mono text-[10px] text-muted-foreground">
          {cards[currentIndex]?.deck} · {cards[currentIndex]?.difficulty}
        </span>

        <motion.button
          onClick={() => setFlipped(!flipped)}
          className="flex min-h-[200px] w-full items-center justify-center rounded-lg border border-boundary bg-cell p-grid-4 text-center transition-colors hover:border-primary"
          whileTap={{ scale: 0.99 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={flipped ? "back" : "front"}
              initial={{ opacity: 0, rotateX: -10 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, rotateX: 10 }}
              transition={{ duration: 0.2 }}
              className={`${
                flipped
                  ? "font-body text-xs leading-[20px] text-foreground"
                  : "font-mono text-sm font-medium text-primary"
              }`}
            >
              {flipped ? current.back : current.front}
            </motion.p>
          </AnimatePresence>
        </motion.button>

        <span className="font-mono text-[10px] text-muted-foreground">
          {flipped ? "Tap to flip back" : "Tap to reveal"}
        </span>

        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-grid-2"
          >
            <button
              onClick={() => markResult("incorrect")}
              className="flex items-center gap-grid rounded-lg border border-destructive px-grid-3 py-grid-2 font-mono text-xs text-destructive transition-colors hover:bg-destructive hover:text-primary-foreground"
            >
              <X size={12} />
              Again
            </button>
            <button
              onClick={() => markResult("correct")}
              className="flex items-center gap-grid rounded-lg border border-primary bg-primary px-grid-3 py-grid-2 font-mono text-xs text-primary-foreground"
            >
              <Check size={12} />
              Got it
            </button>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-boundary px-grid-3 py-grid-2">
        <h2 className="font-mono text-sm font-semibold text-primary">Flashcards</h2>
        <div className="flex items-center gap-grid-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            {reviewed}/{cards.length}
          </span>
          <button onClick={reset} className="text-muted-foreground hover:text-primary">
            <Shuffle size={12} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="h-[2px] bg-boundary">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${(reviewed / cards.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-grid-3 py-grid-3">
        {renderContent()}
      </div>
    </div>
  );
};

export default Flashcards;
