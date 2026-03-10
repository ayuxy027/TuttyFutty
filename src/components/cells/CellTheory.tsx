import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, BookOpen, Mic } from "lucide-react";

interface Cell {
  id: string;
  type: string;
  content: string;
}

interface CellTheoryProps {
  cell: Cell;
  onRemove: () => void;
}

const sampleContent = `## Consensus in Distributed Systems

Consensus is the process by which a group of nodes in a distributed system agree on a single value. This is fundamental to building reliable systems.

**Key Properties:**
- **Agreement** — All correct processes decide on the same value
- **Validity** — The decided value was proposed by some process
- **Termination** — Every correct process eventually decides

The FLP impossibility result (Fischer, Lynch, Paterson, 1985) proves that no deterministic algorithm can guarantee consensus in an asynchronous system with even one faulty process.

### Practical Algorithms

Modern systems use algorithms like **Raft** and **Paxos** that work around FLP by making timing assumptions or using randomization.`;

const CellTheory = ({ cell, onRemove }: CellTheoryProps) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);

  const isInterview = cell.type === "interview";

  // Simulate streaming generation
  useEffect(() => {
    if (!isStreaming) return;
    const content = isInterview
      ? "Tell me about your understanding of distributed consensus algorithms. What are the key tradeoffs between Raft and Paxos in production systems?"
      : sampleContent;
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        const chunkSize = Math.floor(Math.random() * 4) + 1;
        setDisplayedContent(content.slice(0, index + chunkSize));
        index += chunkSize;
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [isStreaming, isInterview]);

  return (
    <div className="rounded-lg border border-cell-border bg-cell p-grid-3">
      {/* Cell header */}
      <div className="mb-grid-2 flex items-center justify-between">
        <div className="flex items-center gap-grid">
          {isInterview ? (
            <Mic size={12} strokeWidth={1.5} className="text-muted-foreground" />
          ) : (
            <BookOpen size={12} strokeWidth={1.5} className="text-muted-foreground" />
          )}
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {isInterview ? "Interview" : "AI Theory"}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-primary"
        >
          <X size={12} />
        </button>
      </div>

      {/* Content */}
      <div className="font-body text-xs leading-[20px] text-foreground whitespace-pre-wrap">
        {displayedContent}
        {isStreaming && (
          <span className="caret-blink font-mono text-primary">▋</span>
        )}
      </div>

      {/* Streaming progress */}
      {isStreaming && (
        <div className="mt-grid-2 h-[1px] progress-linear bg-boundary" />
      )}
    </div>
  );
};

export default CellTheory;
