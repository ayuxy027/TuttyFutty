import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  completedDays: boolean[]; // last 21 days
}

const mockHabits: Habit[] = [
  {
    id: "1", name: "Study", emoji: "📚", streak: 8,
    completedDays: [true,true,false,true,true,true,true,true,true,true,false,false,true,true,true,false,true,true,true,true,true],
  },
  {
    id: "2", name: "Meditate", emoji: "🧘", streak: 3,
    completedDays: [false,false,true,false,true,false,false,true,true,false,false,true,false,false,true,false,false,true,true,true,false],
  },
  {
    id: "3", name: "Exercise", emoji: "💪", streak: 5,
    completedDays: [true,false,true,true,false,true,false,true,true,false,true,true,false,true,true,true,true,true,true,true,false],
  },
  {
    id: "4", name: "Read", emoji: "📖", streak: 12,
    completedDays: [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false],
  },
  {
    id: "5", name: "Journal", emoji: "✍️", streak: 2,
    completedDays: [false,false,false,true,false,false,true,false,false,true,false,false,true,false,true,false,true,false,true,true,false],
  },
];

const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>(mockHabits);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("✅");

  const toggleToday = (id: string) => {
    setHabits(
      habits.map((h) => {
        if (h.id !== id) return h;
        const days = [...h.completedDays];
        days[days.length - 1] = !days[days.length - 1];
        return { ...h, completedDays: days };
      })
    );
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits([
      ...habits,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        emoji: newEmoji || "✅",
        streak: 0,
        completedDays: Array(21).fill(false),
      },
    ]);
    setNewName("");
    setNewEmoji("✅");
    setShowAdd(false);
  };

  const removeHabit = (id: string) => setHabits(habits.filter((h) => h.id !== id));

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-boundary px-grid-3 py-grid-2">
        <h2 className="font-mono text-sm font-semibold text-primary">Habits</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-muted-foreground hover:text-primary"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-grid-3 py-grid-3">
        <div className="mx-auto flex max-w-[560px] flex-col gap-grid-3">
          {/* Add form */}
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex gap-grid rounded-lg border border-boundary bg-cell p-grid-2"
            >
              <input
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-grid-5 rounded-lg border border-boundary bg-background px-grid py-grid text-center text-sm focus:outline-none"
                maxLength={2}
              />
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHabit()}
                placeholder="Habit name"
                className="flex-1 rounded-lg border border-boundary bg-background px-grid-2 py-grid font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <button onClick={addHabit} className="rounded-lg bg-primary px-grid-2 font-mono text-[10px] text-primary-foreground">
                Add
              </button>
            </motion.div>
          )}

          {/* Habit cards */}
          {habits.map((habit, idx) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-lg border border-boundary bg-cell p-grid-3"
            >
              <div className="mb-grid-2 flex items-center justify-between">
                <div className="flex items-center gap-grid-2">
                  <span className="text-base">{habit.emoji}</span>
                  <span className="font-mono text-xs font-medium text-primary">{habit.name}</span>
                </div>
                <div className="flex items-center gap-grid-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {habit.streak}d streak
                  </span>
                  <button onClick={() => removeHabit(habit.id)} className="text-muted-foreground hover:text-destructive">
                    <X size={10} />
                  </button>
                </div>
              </div>

              {/* 21-day grid (3 weeks × 7 days) */}
              <div className="grid grid-cols-7 gap-[3px]">
                {habit.completedDays.map((done, di) => {
                  const isToday = di === habit.completedDays.length - 1;
                  return (
                    <motion.button
                      key={di}
                      whileTap={{ scale: 0.85 }}
                      onClick={isToday ? () => toggleToday(habit.id) : undefined}
                      className={`aspect-square rounded-sm transition-colors ${
                        done
                          ? "bg-primary"
                          : isToday
                          ? "border border-dashed border-primary bg-background"
                          : "bg-accent"
                      } ${isToday ? "cursor-pointer" : "cursor-default"}`}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
