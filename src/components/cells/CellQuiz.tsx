import { useState, useEffect } from "react";
import { HelpCircle, X, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { quiz } from "../../lib/api";

interface Cell {
  id: string;
  type: string;
  content: string;
}

interface CellQuizProps {
  cell: Cell;
  onRemove: () => void;
}

const CellQuiz = ({ cell, onRemove }: CellQuizProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [quizData, setQuizData] = useState<quiz.QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        // Try to parse quiz data from cell content first
        let parsed: quiz.QuizQuestion | null = null;
        try {
          parsed = JSON.parse(cell.content);
        } catch {
          // If content is not JSON, it's empty - generate a new quiz via API
        }

        if (parsed && parsed.question && parsed.options) {
          setQuizData(parsed);
        } else {
          // Fetch a quiz from the AI API
          const data = await quiz.generate();
          setQuizData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [cell.content]);

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-cell-border bg-cell p-grid-3">
        <div className="mb-grid-2 flex items-center justify-between">
          <div className="flex items-center gap-grid">
            <HelpCircle size={12} strokeWidth={1.5} className="text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Quiz
            </span>
          </div>
          <button onClick={onRemove} className="text-muted-foreground hover:text-primary">
            <X size={12} />
          </button>
        </div>
        <div className="flex items-center justify-center py-grid-3">
          <Loader2 className="animate-spin text-muted-foreground" size={20} />
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="rounded-lg border border-cell-border bg-cell p-grid-3">
        <div className="mb-grid-2 flex items-center justify-between">
          <div className="flex items-center gap-grid">
            <HelpCircle size={12} strokeWidth={1.5} className="text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Quiz
            </span>
          </div>
          <button onClick={onRemove} className="text-muted-foreground hover:text-primary">
            <X size={12} />
          </button>
        </div>
        <p className="font-body text-xs text-destructive">Failed to load quiz</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-cell-border bg-cell p-grid-3">
      <div className="mb-grid-2 flex items-center justify-between">
        <div className="flex items-center gap-grid">
          <HelpCircle size={12} strokeWidth={1.5} className="text-muted-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Quiz
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-primary"
        >
          <X size={12} />
        </button>
      </div>

      <p className="mb-grid-3 font-body text-xs font-medium leading-[20px] text-primary">
        {quizData.question}
      </p>

      <div className="flex flex-col gap-grid">
        {quizData.options.map((option, i) => {
          const isCorrect = submitted && i === quizData.correct;
          const isWrong = submitted && i === selected && i !== quizData.correct;

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              whileTap={{ scale: 0.99 }}
              className={`rounded-lg border px-grid-2 py-grid-2 text-left font-body text-xs transition-colors ${
                isCorrect
                  ? "border-primary bg-primary text-primary-foreground"
                  : isWrong
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : selected === i
                  ? "border-primary bg-ground text-primary"
                  : "border-boundary text-foreground hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-grid-2">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
                {isCorrect && <Check size={12} className="ml-auto" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {!submitted && selected !== null && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleSubmit}
          className="mt-grid-2 rounded-lg bg-primary px-grid-3 py-grid font-mono text-xs text-primary-foreground"
        >
          Submit
        </motion.button>
      )}

      {submitted && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-grid-2 font-body text-[10px] text-muted-foreground"
        >
          {selected === quizData.correct
            ? quizData.explanation || "Correct!"
            : "Incorrect. Try reviewing the material and attempt again."}
        </motion.p>
      )}
    </div>
  );
};

export default CellQuiz;
