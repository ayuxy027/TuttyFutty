import { useState } from "react";
import { motion } from "framer-motion";
import { format, subDays, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Frown, Meh, Smile, Sparkles, Heart } from "lucide-react";

const moodIcons = [
  { icon: Frown, label: "Terrible" },
  { icon: Frown, label: "Bad" },
  { icon: Meh, label: "Okay" },
  { icon: Smile, label: "Good" },
  { icon: Sparkles, label: "Great" },
  { icon: Heart, label: "Amazing" },
];

interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  gratitude: string;
  reflection: string;
  wins: string[];
  createdAt: string;
}

const Journal = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = format(currentDate, "yyyy-MM-dd");

  const [mood, setMood] = useState(-1);
  const [gratitude, setGratitude] = useState("");
  const [reflection, setReflection] = useState("");
  const [wins, setWins] = useState<string[]>([]);
  const [newWin, setNewWin] = useState("");

  const navigateDate = (dir: number) => {
    const next = dir > 0 ? addDays(currentDate, 1) : subDays(currentDate, 1);
    setCurrentDate(next);
  };

  const addWin = () => {
    if (!newWin.trim()) return;
    setWins([...wins, newWin.trim()]);
    setNewWin("");
  };

  return (
    <div className="flex flex-1 flex-col">
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
          <div className="rounded-lg border border-boundary bg-cell p-grid-3">
            <span className="mb-grid-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Mood
            </span>
            <div className="flex gap-grid-2">
              {moodIcons.map((item, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMood(i)}
                  title={item.label}
                  className={`flex h-grid-5 w-grid-5 items-center justify-center rounded-lg border text-base transition-colors ${
                    mood === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-boundary hover:border-primary"
                  }`}
                >
                  <item.icon size={18} />
                </motion.button>
              ))}
            </div>
          </div>

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
