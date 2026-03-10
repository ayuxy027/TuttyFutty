import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw } from "lucide-react";

interface QuizResult {
  id: string;
  question: string;
  correct: boolean;
  goalTitle: string;
  step: number;
  date: string;
}

const mockResults: QuizResult[] = [
  { id: "1", question: "What does the FLP impossibility result state?", correct: true, goalTitle: "Distributed Systems", step: 2, date: "2026-03-08" },
  { id: "2", question: "How does Raft handle leader election?", correct: false, goalTitle: "Distributed Systems", step: 2, date: "2026-03-08" },
  { id: "3", question: "What is a qubit superposition?", correct: true, goalTitle: "Quantum Computing", step: 1, date: "2026-03-10" },
  { id: "4", question: "Explain Byzantine fault tolerance requirements", correct: false, goalTitle: "Distributed Systems", step: 3, date: "2026-03-10" },
];

const PracticeCenter = () => {
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">("all");

  const filtered = mockResults.filter((r) => {
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
      </div>
    </div>
  );
};

export default PracticeCenter;
