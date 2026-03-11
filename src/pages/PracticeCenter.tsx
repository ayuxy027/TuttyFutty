import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, Loader2 } from "lucide-react";
import { apiRequest } from "../lib/api";

interface QuizResult {
  id: string;
  question: string;
  correct: boolean;
  goalTitle: string;
  step: number;
  date: string;
}

interface QuizAttempt {
  id: number;
  question: string;
  is_correct: boolean;
  goal_title: string | null;
  step_number: number | null;
  attempted_at: string;
}

const PracticeCenter = () => {
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">("all");
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizAttempts = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<{ message: string; data: QuizAttempt[] }>("/ai/quiz/attempts");
        const attempts = response.data || [];
        const formatted: QuizResult[] = attempts.map((attempt) => ({
          id: String(attempt.id),
          question: attempt.question,
          correct: attempt.is_correct,
          goalTitle: attempt.goal_title || "General",
          step: attempt.step_number || 0,
          date: new Date(attempt.attempted_at).toISOString().split("T")[0],
        }));
        setResults(formatted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz attempts");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAttempts();
  }, []);

  const filtered = results.filter((r) => {
    if (filter === "correct") return r.correct;
    if (filter === "incorrect") return !r.correct;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-boundary px-grid-3 py-grid-2">
        <h2 className="font-mono text-sm font-semibold text-primary">Practice</h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-grid border-b border-boundary px-grid-3 py-grid">
        {(["all", "correct", "incorrect"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-grid-2 py-grid font-mono text-[10px] capitalize transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-grid-3 py-grid-3">
        {loading && (
          <div className="flex items-center justify-center py-grid-4">
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-grid-3">
            <p className="font-body text-xs text-destructive">{error}</p>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-grid-4 text-center">
            <p className="font-body text-xs text-muted-foreground">No quiz attempts yet</p>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-grid-2">
            {filtered.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-grid-2 rounded-lg border border-boundary p-grid-3"
              >
                <div
                  className={`mt-[2px] flex h-grid-2 w-grid-2 flex-shrink-0 items-center justify-center rounded-full ${
                    result.correct ? "bg-primary" : "bg-destructive"
                  }`}
                >
                  {result.correct ? (
                    <Check size={8} className="text-primary-foreground" />
                  ) : (
                    <X size={8} className="text-primary-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-body text-xs text-primary">{result.question}</p>
                  <div className="mt-grid flex items-center gap-grid-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {result.goalTitle}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">·</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Step {result.step}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">·</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {result.date}
                    </span>
                  </div>
                </div>

                {!result.correct && (
                  <button className="flex-shrink-0 text-muted-foreground hover:text-primary" title="Retry">
                    <RotateCcw size={12} strokeWidth={1.5} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeCenter;
