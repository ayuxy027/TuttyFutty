import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Check, X, Shuffle, Loader2, Calendar, Sparkles } from "lucide-react";
import { format, subMonths, addMonths } from "date-fns";
import { apiRequest } from "../lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  deck: string;
  difficulty: "easy" | "medium" | "hard";
  cardDate?: string;
}

interface ApiFlashcard {
  id: number;
  deck_name: string;
  front: string;
  back: string;
  difficulty: number;
  card_date?: string;
}

const Flashcards = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, "correct" | "incorrect">>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [topic, setTopic] = useState("");

  useEffect(() => {
    fetchDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchCardsByDate(selectedDate);
    } else {
      fetchCards();
    }
  }, [selectedDate]);

  const fetchDates = async () => {
    try {
      const response = await apiRequest<{ message: string; data: string[] }>("/flashcards/dates");
      setDates(response.data || []);
    } catch (err) {
      console.error("Failed to fetch dates:", err);
    }
  };

  const fetchCardsByDate = async (date: string) => {
    try {
      setLoading(true);
      const response = await apiRequest<{ message: string; data: ApiFlashcard[] }>(`/flashcards/date/${date}`);
      const apiCards = response.data || [];
      formatCards(apiCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load flashcards");
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{ message: string; data: ApiFlashcard[] }>("/flashcards");
      const apiCards = response.data || [];
      formatCards(apiCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load flashcards");
      setLoading(false);
    }
  };

  const formatCards = (apiCards: ApiFlashcard[]) => {
    const difficultyMap = ["easy", "medium", "hard"] as const;
    const formatted: Flashcard[] = apiCards.map((card) => ({
      id: String(card.id),
      front: card.front,
      back: card.back,
      deck: card.deck_name,
      difficulty: difficultyMap[card.difficulty - 1] || "medium",
      cardDate: card.card_date,
    }));
    setCards(formatted);
    setLoading(false);
  };

  const generateFlashcards = async () => {
    if (!topic.trim()) return;

    try {
      setGenerating(true);
      setShowGenerateModal(false);
      setTopic("");
      await apiRequest<{ message: string; data: ApiFlashcard[] }>("/flashcards/generate", {
        method: "POST",
        body: JSON.stringify({ topic, count: 5, deck_name: topic }),
      });
      await fetchDates();
      await fetchCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  };

  const openGenerateModal = () => {
    setShowGenerateModal(true);
    setTopic("");
  };

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
  const isDone = reviewed === cards.length && cards.length > 0;

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const hasFlashcards = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return dates.includes(dateStr);
  };

  const renderContent = () => {
    if (loading || generating) {
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
        <div className="flex flex-col items-center justify-center gap-grid-3 py-grid-4 text-center">
          <p className="font-body text-xs text-muted-foreground">No flashcards for this date</p>
          <button
            onClick={openGenerateModal}
            className="flex items-center gap-grid rounded-lg border border-primary bg-primary px-grid-3 py-grid-2 font-mono text-xs text-primary-foreground"
          >
            <Sparkles size={12} />
            Generate with AI
          </button>
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
            {correctCount === cards.length ? "Perfect score!" : "Review incorrect cards."}
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
              className={flipped
                ? "font-body text-xs leading-[20px] text-foreground"
                : "font-mono text-sm font-medium text-primary"
              }
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
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="text-muted-foreground hover:text-primary"
          >
            <Calendar size={12} />
          </button>
          <button
            onClick={openGenerateModal}
            className="text-muted-foreground hover:text-primary"
            title="Generate with AI"
          >
            <Sparkles size={12} />
          </button>
          <button onClick={reset} className="text-muted-foreground hover:text-primary">
            <Shuffle size={12} />
          </button>
        </div>
      </div>

      {/* Date Picker */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-boundary bg-cell overflow-hidden"
          >
            <div className="p-grid-3">
              <div className="flex items-center justify-between mb-grid-2">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="text-muted-foreground hover:text-primary"
                >
                  ←
                </button>
                <span className="font-mono text-xs">{format(currentMonth, "MMMM yyyy")}</span>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="text-muted-foreground hover:text-primary"
                >
                  →
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i} className="font-mono text-[10px] text-muted-foreground">{d}</span>
                ))}
                {getDaysInMonth().map((date, i) => (
                  <button
                    key={i}
                    disabled={!date}
                    onClick={() => date && setSelectedDate(format(date, "yyyy-MM-dd"))}
                    className={`p-1 font-mono text-xs rounded ${
                      date && hasFlashcards(date)
                        ? "bg-primary text-primary-foreground"
                        : date && selectedDate === format(date, "yyyy-MM-dd")
                        ? "border border-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="mt-2 font-mono text-xs text-muted-foreground hover:text-primary"
                >
                  Show all cards
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      {cards.length > 0 && (
        <div className="h-[2px] bg-boundary">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${(reviewed / cards.length) * 100}%` }}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center px-grid-3 py-grid-3">
        {renderContent()}
      </div>

      {/* Generate Flashcards Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-mono text-sm font-semibold mb-4">Generate Flashcards</h3>
              <p className="text-xs text-muted-foreground mb-4">Enter a topic and AI will generate flashcards for you.</p>

              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., React Hooks, JavaScript closures..."
                className="mb-4"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && topic.trim()) {
                    generateFlashcards();
                  }
                }}
                autoFocus
              />

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowGenerateModal(false)}
                  className="border-black text-black hover:bg-transparent hover:border-black"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateFlashcards}
                  disabled={!topic.trim() || generating}
                  className="border-black text-black hover:bg-transparent hover:border-black"
                >
                  {generating ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Flashcards;
