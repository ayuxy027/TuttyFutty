import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, Clock, Calendar } from "lucide-react";
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
  low: "border-l-muted-foreground/30",
  medium: "border-l-foreground/30",
  high: "border-l-foreground",
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-mono text-sm font-semibold text-foreground">Planner</h2>
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <Calendar size={12} />
          <span>{format(new Date(), "EEE, MMM d")}</span>
          <span>·</span>
          <span>{doneCount}/{tasks.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-border">
        <motion.div
          className="h-full bg-foreground"
          animate={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-[600px] flex-col gap-2">
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
                  className={`group flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 border-l-4 ${
                    priorityStyles[task.priority]
                  } ${task.done ? "opacity-50" : ""}`}
                >
                  <button
                    onClick={() => toggle(task.id)}
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                      task.done
                        ? "border-foreground bg-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {task.done && <Check size={10} className="text-background" />}
                  </button>

                  {task.timeBlock && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <Clock size={10} />
                      {task.timeBlock}
                    </span>
                  )}

                  <span
                    className={`flex-1 text-sm ${
                      task.done ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {task.text}
                  </span>

                  <button
                    onClick={() => remove(task.id)}
                    className="flex-shrink-0 text-muted-foreground opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="font-mono text-sm text-muted-foreground">No tasks yet</p>
              <p className="font-mono text-xs text-muted-foreground mt-1">Add your first task below</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Bar */}
      <div className="border-t border-border bg-muted/20 p-4">
        <div className="mx-auto flex max-w-[600px] gap-2">
          {/* Priority Selector */}
          <div className="flex rounded-md border border-border bg-background p-1">
            {(["low", "medium", "high"] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setNewPriority(p)}
                className={`rounded px-2 py-1 font-mono text-[9px] uppercase transition-colors ${
                  newPriority === p
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a task..."
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />

          {/* Add Button */}
          <button
            onClick={add}
            className="rounded-md border border-border bg-background px-3 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;
