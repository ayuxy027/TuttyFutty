import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const moodEmojis = ["😤", "😔", "😐", "🙂", "😊", "🔥"];

interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  gratitude: string;
  reflection: string;
  wins: string[];
  createdAt: string;
}

const mockEntries: Record<string, JournalEntry> = {
  "2026-03-10": {
    id: "1",
    date: "2026-03-10",
    mood: 4,
    gratitude: "Had a productive morning session on distributed systems. Coffee was perfect.",
    reflection: "Need to spend more time on Raft consensus — the leader election part is still fuzzy. Tomorrow I'll focus on that specifically.",
    wins: ["Finished 2 sprint steps", "30 min meditation", "Read 20 pages"],
    createdAt: "2026-03-10T08:00:00Z",
  },
  "2026-03-09": {
    id: "2",
    date: "2026-03-09",
    mood: 3,
    gratitude: "Weekend rest. Recharged for the week ahead.",
    reflection: "Took it easy today. Sometimes that's the most productive thing.",
    wins: ["Journaled", "Walked 5km"],
    createdAt: "2026-03-09T10:00:00Z",
  },
};

const Journal = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const entry = mockEntries[dateStr];

  const [mood, setMood] = useState(entry?.mood ?? -1);
  const [gratitude, setGratitude] = useState(entry?.gratitude ?? "");
  const [reflection, setReflection] = useState(entry?.reflection ?? "");
  const [wins, setWins] = useState<string[]>(entry?.wins ?? [""]);
  const [newWin, setNewWin] = useState("");

  const navigateDate = (dir: number) => {
    const next = dir > 0 ? addDays(currentDate, 1) : subDays(currentDate, 1);
    setCurrentDate(next);
    const key = format(next, "yyyy-MM-dd");
    const e = mockEntries[key];
    setMood(e?.mood ?? -1);
    setGratitude(e?.gratitude ?? "");
    setReflection(e?.reflection ?? "");
    setWins(e?.wins ?? [""]);
  };

  const addWin = () => {
    if (!newWin.trim()) return;
    setWins([...wins, newWin.trim()]);
    setNewWin("");
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-boundary px-grid-3 py-grid-2">
        <h2 className="font-mono text-sm font-semibold text-primary">Journal</h2>
        <div className="flex items-center gap-grid-2">
          <button onClick={() => navigateDate(-1)} className="text-muted-foreground hover:text-primary">
            <ChevronLeft size={14} />
          </button>
          <span className="font-mono text-xs text-primary">
            {format(currentDate, "EEE, MMM d")}
          </span>
          <button onClick={() => navigateDate(1)} className="text-muted-foreground hover:text-primary">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-grid-3 py-grid-3">
        <div className="mx-auto flex max-w-[560px] flex-col gap-grid-3">
          {/* Mood selector */}
          <div className="rounded-lg border border-boundary bg-cell p-grid-3">
            <span className="mb-grid-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Mood
            </span>
            <div className="flex gap-grid-2">
              {moodEmojis.map((emoji, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMood(i)}
                  className={`flex h-grid-5 w-grid-5 items-center justify-center rounded-lg border text-base transition-colors ${
                    mood === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-boundary hover:border-primary"
                  }`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Gratitude */}
          <div className="rounded-lg border border-boundary bg-cell p-grid-3">
            <span className="mb-grid-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Gratitude
            </span>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="What are you grateful for today?"
              className="min-h-[64px] w-full resize-none bg-transparent font-body text-xs leading-[20px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Wins */}
          <div className="rounded-lg border border-boundary bg-cell p-grid-3">
            <span className="mb-grid-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Today's Wins
            </span>
            <div className="flex flex-col gap-grid">
              {wins.map((win, i) => (
                <div key={i} className="flex items-center gap-grid-2">
                  <div className="h-[4px] w-[4px] flex-shrink-0 rounded-full bg-primary" />
                  <span className="font-body text-xs text-foreground">{win}</span>
                </div>
              ))}
              <div className="flex gap-grid">
                <input
                  value={newWin}
                  onChange={(e) => setNewWin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWin()}
                  placeholder="Add a win..."
                  className="flex-1 rounded-lg border border-boundary bg-background px-grid-2 py-grid font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={addWin} className="text-muted-foreground hover:text-primary">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Reflection */}
          <div className="rounded-lg border border-boundary bg-cell p-grid-3">
            <span className="mb-grid-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Reflection
            </span>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="How was your day? What did you learn?"
              className="min-h-[96px] w-full resize-none bg-transparent font-body text-xs leading-[20px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
