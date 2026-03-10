import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Check, X, Shuffle } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  deck: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: string;
}

const mockCards: Flashcard[] = [
  { id: "1", front: "What is the FLP impossibility result?", back: "No deterministic consensus algorithm can guarantee termination in an asynchronous system with even one faulty process. (Fischer, Lynch, Paterson, 1985)", deck: "Distributed Systems", difficulty: "hard" },
  { id: "2", front: "What are the three properties of consensus?", back: "Agreement (all correct processes decide the same value), Validity (the decided value was proposed by some process), and Termination (every correct process eventually decides).", deck: "Distributed Systems", difficulty: "medium" },
  { id: "3", front: "How does Raft handle leader election?", back: "Nodes start as followers. If no heartbeat is received within an election timeout, a follower becomes a candidate and requests votes. A candidate with a majority becomes leader.", deck: "Distributed Systems", difficulty: "medium" },
  { id: "4", front: "What is qubit superposition?", back: "A qubit can exist in a linear combination of |0⟩ and |1⟩ states simultaneously: α|0⟩ + β|1⟩ where |α|² + |β|² = 1.", deck: "Quantum Computing", difficulty: "hard" },
  { id: "5", front: "What is quantum entanglement?", back: "When two qubits are entangled, measuring one instantly determines the state of the other, regardless of distance. This correlation is stronger than any classical correlation.", deck: "Quantum Computing", difficulty: "easy" },
];

const Flashcards = () => {
  const [cards] = useState<Flashcard[]>(mockCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, "correct" | "incorrect">>({});

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
        {isDone ? (
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
        ) : (
          <div className="flex w-full max-w-[480px] flex-col items-center gap-grid-3">
            {/* Deck label */}
            <span className="font-mono text-[10px] text-muted-foreground">
              {current.deck} · {current.difficulty}
            </span>

            {/* Card */}
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

            {/* Actions */}
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
        )}
      </div>
    </div>
  );
};

export default Flashcards;
