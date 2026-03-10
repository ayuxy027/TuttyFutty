import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Clock, BookOpen, PenLine, HelpCircle, Mic } from "lucide-react";
import CellTheory from "@/components/cells/CellTheory";
import CellNote from "@/components/cells/CellNote";
import CellQuiz from "@/components/cells/CellQuiz";

type CellType = "theory" | "note" | "quiz" | "interview";

interface Cell {
  id: string;
  type: CellType;
  content: string;
}

const cellTypeConfig: { type: CellType; icon: typeof BookOpen }[] = [
  { type: "theory", icon: BookOpen },
  { type: "note", icon: PenLine },
  { type: "quiz", icon: HelpCircle },
  { type: "interview", icon: Mic },
];

const SessionWorkspace = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [cells, setCells] = useState<Cell[]>([]);
  const [showCellMenu, setShowCellMenu] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);

  // Pomodoro timer
  useEffect(() => {
    if (!pomodoroActive || pomodoroSeconds <= 0) return;
    const interval = setInterval(() => {
      setPomodoroSeconds((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroSeconds]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const addCell = (type: CellType) => {
    const cell: Cell = {
      id: Date.now().toString(),
      type,
      content: "",
    };
    setCells([...cells, cell]);
    setShowCellMenu(false);
  };

  const updateCell = (id: string, content: string) => {
    setCells(cells.map((c) => (c.id === id ? { ...c, content } : c)));
  };

  const removeCell = (id: string) => {
    setCells(cells.filter((c) => c.id !== id));
  };

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Session header — 28px chrome */}
      <div className="flex items-center justify-between border-b border-boundary px-grid-3 chrome-height">
        <div className="flex items-center gap-grid-2">
          <button
            onClick={() => navigate("/workspace/calendar")}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
          </button>
          <span className="font-mono text-xs text-primary">{date}</span>
        </div>

        {/* Pomodoro */}
        <button
          onClick={() => setPomodoroActive(!pomodoroActive)}
          className="flex items-center gap-grid rounded-lg border border-boundary px-grid-2 py-[2px] font-mono text-[10px] text-foreground transition-colors hover:border-primary"
        >
          <Clock size={10} strokeWidth={1.5} />
          <span>{formatTime(pomodoroSeconds)}</span>
        </button>
      </div>

      {/* Progress bar for pomodoro */}
      {pomodoroActive && (
        <div className="h-[2px] bg-boundary">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "100%" }}
            animate={{
              width: `${(pomodoroSeconds / (25 * 60)) * 100}%`,
            }}
            transition={{ duration: 1 }}
          />
        </div>
      )}

      {/* Cells area */}
      <div className="flex-1 overflow-y-auto px-grid-3 py-grid-3">
        <AnimatePresence mode="popLayout">
          {cells.map((cell, i) => (
            <motion.div
              key={cell.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ease: [0.16, 1, 0.3, 1] }}
              className="mb-grid-2"
            >
              {cell.type === "theory" && (
                <CellTheory
                  cell={cell}
                  onRemove={() => removeCell(cell.id)}
                />
              )}
              {cell.type === "note" && (
                <CellNote
                  cell={cell}
                  onChange={(content) => updateCell(cell.id, content)}
                  onRemove={() => removeCell(cell.id)}
                />
              )}
              {cell.type === "quiz" && (
                <CellQuiz
                  cell={cell}
                  onRemove={() => removeCell(cell.id)}
                />
              )}
              {cell.type === "interview" && (
                <CellTheory
                  cell={{ ...cell, type: "interview" }}
                  onRemove={() => removeCell(cell.id)}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {cells.length === 0 && (
          <div className="flex flex-col items-center justify-center py-grid-8 text-center">
            <p className="font-mono text-xs text-muted-foreground">
              No cells yet. Add one to begin.
            </p>
          </div>
        )}

        {/* Add cell button */}
        <div className="relative mt-grid-3 flex justify-center">
          <button
            onClick={() => setShowCellMenu(!showCellMenu)}
            className="flex items-center gap-grid rounded-lg border border-dashed border-boundary px-grid-3 py-grid-2 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus size={14} strokeWidth={1.5} />
            Add Cell
          </button>

          <AnimatePresence>
            {showCellMenu && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-full mb-grid flex gap-grid rounded-lg border border-boundary bg-background p-grid"
              >
                {cellTypeConfig.map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => addCell(type)}
                    className="flex items-center gap-grid rounded-lg px-grid-2 py-grid text-foreground transition-colors hover:bg-accent"
                    title={type}
                  >
                    <Icon size={14} strokeWidth={1.5} />
                    <span className="font-mono text-[10px] capitalize">
                      {type}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SessionWorkspace;
