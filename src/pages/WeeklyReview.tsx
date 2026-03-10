import { motion } from "framer-motion";
import { Check, X, BookOpen, Target, Brain, PenLine } from "lucide-react";

const WeeklyReview = () => {
  const stats = {
    tasksCompleted: 18,
    tasksTotal: 24,
    habitsRate: 78,
    studySessions: 5,
    quizzesPassed: 7,
    quizzesFailed: 2,
    journalEntries: 4,
    focusMinutes: 245,
    streak: 8,
  };

  const topWins = [
    "Completed Sprint Step 2 for Distributed Systems",
    "Maintained 8-day study streak",
    "Scored 100% on consensus quiz",
  ];

  const areasToImprove = [
    "Raft leader election — needs deeper review",
    "Only journaled 4/7 days",
    "Skipped exercise twice",
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-boundary px-grid-3 py-grid-2">
        <h2 className="font-mono text-sm font-semibold text-primary">Weekly Review</h2>
        <span className="font-mono text-[10px] text-muted-foreground">Mar 4 — Mar 10</span>
      </div>

      <div className="flex-1 overflow-y-auto px-grid-3 py-grid-3">
        <div className="mx-auto flex max-w-[560px] flex-col gap-grid-3">
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-grid-2">
            {[
              { label: "Tasks", value: `${stats.tasksCompleted}/${stats.tasksTotal}`, icon: Check },
              { label: "Habits", value: `${stats.habitsRate}%`, icon: Target },
              { label: "Focus", value: `${stats.focusMinutes}m`, icon: Brain },
              { label: "Sessions", value: stats.studySessions, icon: BookOpen },
              { label: "Quizzes", value: `${stats.quizzesPassed}✓ ${stats.quizzesFailed}✗`, icon: Brain },
              { label: "Journal", value: `${stats.journalEntries}/7`, icon: PenLine },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-grid rounded-lg border border-boundary bg-cell p-grid-3 text-center"
              >
                <stat.icon size={14} strokeWidth={1.5} className="text-muted-foreground" />
                <span className="font-mono text-lg font-semibold text-primary">{stat.value}</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Streak */}
          <div className="flex items-center justify-center gap-grid-2 rounded-lg border border-primary bg-cell p-grid-3">
            <span className="font-mono text-2xl font-bold text-primary">{stats.streak}</span>
            <span className="font-mono text-xs text-muted-foreground">day streak</span>
          </div>

          {/* Top wins */}
          <div className="rounded-lg border border-boundary bg-cell p-grid-3">
            <span className="mb-grid-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Highlights
            </span>
            <div className="flex flex-col gap-grid">
              {topWins.map((win, i) => (
                <div key={i} className="flex items-start gap-grid-2">
                  <Check size={10} className="mt-[3px] flex-shrink-0 text-primary" />
                  <span className="font-body text-xs text-foreground">{win}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Areas to improve */}
          <div className="rounded-lg border border-boundary bg-cell p-grid-3">
            <span className="mb-grid-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Focus Areas
            </span>
            <div className="flex flex-col gap-grid">
              {areasToImprove.map((area, i) => (
                <div key={i} className="flex items-start gap-grid-2">
                  <X size={10} className="mt-[3px] flex-shrink-0 text-muted-foreground" />
                  <span className="font-body text-xs text-foreground">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReview;
