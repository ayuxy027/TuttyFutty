import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";

type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  timeBlock?: string;
}

const priorityStyles: Record<Priority, string> = {
  low: "border-boundary",
  medium: "border-foreground/30",
  high: "border-primary",
};

const DailyPlanner = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");

  const toggle = (id: string) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => setTasks(tasks.filter((t) => t.id !== id));

  const add = () => {
    if (!newText.trim()) return;
    setTasks([
      ...tasks,
      { id: Date.now().toString(), text: newText.trim(), done: false, priority: newPriority },
    ]);
    setNewText("");
  };

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-boundary px-grid-3 py-grid-2">
        <h2 className="font-mono text-sm font-semibold text-primary">Planner</h2>
        <span className="font-mono text-[10px] text-muted-foreground">
          {format(new Date(), "EEE, MMM d")} - {doneCount}/{tasks.length}
        </span>
      </div>

      <div className="h-[2px] bg-boundary">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-grid-3 py-grid-3">
        <div className="mx-auto flex max-w-[560px] flex-col gap-grid">
          <AnimatePresence mode="popLayout">
            {tasks
              .sort((a, b) => {
                if (a.timeBlock && b.timeBlock) return a.timeBlock.localeCompare(b.timeBlock);
                if (a.timeBlock) return -1;
                if (b.timeBlock) return 1;
                return 0;
              })
              .map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className={`flex items-center gap-grid-2 rounded-lg border-l-2 bg-cell px-grid-3 py-grid-2 ${
                    priorityStyles[task.priority]
                  } ${task.done ? "opacity-50" : ""}`}
                >
                  <button
                    onClick={() => toggle(task.id)}
                    className={`flex h-grid-2 w-grid-2 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                      task.done
                        ? "border-primary bg-primary"
                        : "border-boundary hover:border-primary"
                    }`}
                  >
                    {task.done && <Check size={8} className="text-primary-foreground" />}
                  </button>

                  {task.timeBlock && (
                    <span className="flex items-center gap-[2px] font-mono text-[10px] text-muted-foreground">
                      <Clock size={8} />
                      {task.timeBlock}
                    </span>
                  )}

                  <span
                    className={`flex-1 font-body text-xs ${
                      task.done ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {task.text}
                  </span>

                  <button
                    onClick={() => remove(task.id)}
                    className="flex-shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive"
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                  >
                    <Trash2 size={12} />
                  </button>
                </motion.div>
              ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-grid-4 text-center">
              <p className="font-mono text-xs text-muted-foreground">No tasks yet</p>
              <p className="font-mono text-[10px] text-muted-foreground">Add your first task below</p>
            </div>
          )}

          <div className="flex gap-grid">
            <div className="flex gap-grid rounded-lg border border-boundary bg-cell p-grid">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={`rounded px-grid py-[2px] font-mono text-[9px] uppercase transition-colors ${
                    newPriority === p
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Add task..."
              className="flex-1 rounded-lg border border-boundary bg-cell px-grid-2 py-grid font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={add}
              className="rounded-lg border border-boundary px-grid-2 text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;
