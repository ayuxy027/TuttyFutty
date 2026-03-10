import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Goal {
  id: string;
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  createdAt: string;
}

const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Distributed Systems",
    description: "Master consensus algorithms and fault tolerance",
    currentStep: 3,
    totalSteps: 7,
    createdAt: "2026-03-01",
  },
  {
    id: "2",
    title: "Quantum Computing",
    description: "From qubits to Shor's algorithm",
    currentStep: 1,
    totalSteps: 7,
    createdAt: "2026-03-05",
  },
];

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc,
      currentStep: 0,
      totalSteps: 7,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setGoals([goal, ...goals]);
    setNewTitle("");
    setNewDesc("");
    setShowNew(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-boundary px-grid-3 py-grid-2">
        <h2 className="font-mono text-sm font-semibold text-primary">Goals</h2>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-grid rounded-lg border border-boundary px-grid-2 py-grid text-xs text-foreground transition-colors hover:bg-accent"
        >
          <Plus size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-grid-3 py-grid-3">
        {/* New goal form */}
        <AnimatePresence>
          {showNew && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-grid-3 overflow-hidden"
            >
              <div className="rounded-lg border border-boundary bg-cell p-grid-3">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Goal title"
                  className="mb-grid-2 w-full rounded-lg border border-boundary bg-background px-grid-2 py-grid font-mono text-xs text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief description"
                  className="mb-grid-2 w-full rounded-lg border border-boundary bg-background px-grid-2 py-grid font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex gap-grid">
                  <button
                    onClick={handleCreate}
                    className="rounded-lg bg-primary px-grid-2 py-grid font-mono text-xs text-primary-foreground"
                  >
                    Create Sprint
                  </button>
                  <button
                    onClick={() => setShowNew(false)}
                    className="rounded-lg px-grid-2 py-grid font-mono text-xs text-muted-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal list */}
        <div className="flex flex-col gap-grid-2">
          {goals.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => navigate(`/workspace/sprint/${goal.id}`)}
              className="group cursor-pointer rounded-lg border border-boundary bg-cell p-grid-3 transition-colors hover:border-primary"
            >
              <div className="mb-grid flex items-start justify-between">
                <div>
                  <h3 className="font-mono text-sm font-medium text-primary">
                    {goal.title}
                  </h3>
                  <p className="mt-grid font-body text-xs text-foreground">
                    {goal.description}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="mt-grid text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                />
              </div>

              {/* Progress bar */}
              <div className="mt-grid-2 flex items-center gap-grid-2">
                <div className="h-[2px] flex-1 rounded-full bg-boundary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${(goal.currentStep / goal.totalSteps) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {goal.currentStep}/{goal.totalSteps}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Goals;
