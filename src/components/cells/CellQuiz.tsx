import { useState } from "react";
import { HelpCircle, X, Check } from "lucide-react";
import { motion } from "framer-motion";

interface Cell {
  id: string;
  type: string;
  content: string;
}

interface CellQuizProps {
  cell: Cell;
  onRemove: () => void;
}

const mockQuiz = {
  question:
    "What does the FLP impossibility result state about distributed consensus?",
  options: [
    "Consensus is impossible in synchronous systems",
    "No deterministic algorithm can guarantee consensus in an asynchronous system with even one faulty process",
    "All consensus algorithms require at least 3 nodes",
    "Byzantine fault tolerance requires 2f+1 nodes",
  ],
  correct: 1,
};

const CellQuiz = ({ cell, onRemove }: CellQuizProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

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
        {mockQuiz.question}
      </p>

      <div className="flex flex-col gap-grid">
        {mockQuiz.options.map((option, i) => {
          const isCorrect = submitted && i === mockQuiz.correct;
          const isWrong = submitted && i === selected && i !== mockQuiz.correct;

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
          {selected === mockQuiz.correct
            ? "Correct. The FLP result is foundational to understanding distributed systems limitations."
            : "Incorrect. Review the FLP impossibility result — it specifically addresses asynchronous systems."}
        </motion.p>
      )}
    </div>
  );
};

export default CellQuiz;
