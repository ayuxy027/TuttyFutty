import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, BookOpen, Brain, Dumbbell, PenLine, Sparkles } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  icon: React.ReactNode;
  streak: number;
  completedDays: boolean[];
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "BookOpen": return <BookOpen size={16} />;
    case "Brain": return <Brain size={16} />;
    case "Dumbbell": return <Dumbbell size={16} />;
    case "PenLine": return <PenLine size={16} />;
    case "Sparkles": return <Sparkles size={16} />;
    default: return <Sparkles size={16} />;
  }
};

const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("Sparkles");

  const iconOptions = ["Sparkles", "BookOpen", "Brain", "Dumbbell", "PenLine"];

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
        icon: getIcon(newIcon),
        streak: 0,
        completedDays: Array(21).fill(false),
      },
    ]);
    setNewName("");
    setNewIcon("Sparkles");
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
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex gap-grid rounded-lg border border-boundary bg-cell p-grid-2"
            >
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-grid-5 rounded-lg border border-boundary bg-background px-grid py-grid text-center text-sm focus:outline-none"
              >
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>{getIcon(icon)}</option>
                ))}
              </select>
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

          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-grid-4 text-center">
              <Sparkles size={32} className="text-muted-foreground mb-grid-2" />
              <p className="font-mono text-xs text-muted-foreground">No habits yet</p>
              <p className="font-mono text-[10px] text-muted-foreground">Click + to add your first habit</p>
            </div>
          ) : (
            habits.map((habit, idx) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-lg border border-boundary bg-cell p-grid-3"
              >
                <div className="mb-grid-2 flex items-center justify-between">
                  <div className="flex items-center gap-grid-2">
                    <span className="text-muted-foreground">{habit.icon}</span>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
