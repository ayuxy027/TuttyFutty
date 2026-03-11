import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, BookOpen, Target, Brain, PenLine, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { apiRequest } from "../lib/api";

interface WeeklyStats {
  tasksCompleted: number;
  tasksTotal: number;
  habitsRate: number;
  studySessions: number;
  quizzesPassed: number;
  quizzesFailed: number;
  journalEntries: number;
  focusMinutes: number;
  streak: number;
}

const WeeklyReview = () => {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        setLoading(true);
        // Fetch multiple data sources in parallel
        const [tasksRes, habitsRes, sessionsRes, journalRes] = await Promise.all([
          apiRequest<{ completed: number; total: number }[]>("/tasks"),
          apiRequest<{ rate: number }[]>("/habits/stats"),
          apiRequest<{ count: number; minutes: number }[]>("/sessions/stats"),
          apiRequest<{ count: number }[]>("/journal/stats"),
        ]);
        
        setStats({
          tasksCompleted: tasksRes[0]?.completed || 0,
          tasksTotal: tasksRes[0]?.total || 0,
          habitsRate: habitsRes[0]?.rate || 0,
          studySessions: sessionsRes[0]?.count || 0,
          quizzesPassed: 0,
          quizzesFailed: 0,
          journalEntries: journalRes[0]?.count || 0,
          focusMinutes: sessionsRes[0]?.minutes || 0,
          streak: 0,
        });
      } catch (err) {
        // Use default values if API fails
        setStats({
          tasksCompleted: 0,
          tasksTotal: 0,
          habitsRate: 0,
          studySessions: 0,
          quizzesPassed: 0,
          quizzesFailed: 0,
          journalEntries: 0,
          focusMinutes: 0,
          streak: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchWeeklyStats();
  }, []);

  const topWins = stats && stats.tasksCompleted > 0 ? [
    `Completed ${stats.tasksCompleted} tasks this week`,
    stats.studySessions > 0 ? `${stats.studySessions} study sessions completed` : "Start a study session",
    stats.journalEntries > 0 ? `${stats.journalEntries}/7 days journaled` : "Journal to track your progress",
  ] : [
    "Start tracking your progress",
    "Complete tasks to see achievements",
    "Build consistent habits",
  ];

  const areasToImprove = stats ? [
    stats.tasksCompleted < stats.tasksTotal ? `Complete ${stats.tasksTotal - stats.tasksCompleted} more tasks` : "All tasks completed!",
    stats.journalEntries < 7 ? `Journal ${7 - stats.journalEntries} more days` : "Great journaling consistency!",
    stats.habitsRate < 100 ? `${100 - stats.habitsRate}% more habit completion needed` : "All habits on track!",
  ] : [
    "Add tasks to track progress",
    "Journal daily for reflection",
    "Set up habits to build consistency",
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-boundary px-grid-3 py-grid-2">
        <h2 className="font-mono text-sm font-semibold text-primary">Weekly Review</h2>
        <span className="font-mono text-[10px] text-muted-foreground">Mar 4 — Mar 10</span>
      </div>

      <div className="flex-1 overflow-y-auto px-grid-3 py-grid-3">
        {loading && (
          <div className="flex items-center justify-center py-grid-4">
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          </div>
        )}
        {!loading && stats && (
          <div className="mx-auto flex max-w-[560px] flex-col gap-grid-3">
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-grid-2">
              {[
                { label: "Tasks", value: `${stats.tasksCompleted}/${stats.tasksTotal}`, icon: Check },
                { label: "Habits", value: `${stats.habitsRate}%`, icon: Target },
                { label: "Focus", value: `${stats.focusMinutes}m`, icon: Brain },
                { label: "Sessions", value: stats.studySessions, icon: BookOpen },
                { label: "Quizzes", value: `${stats.quizzesPassed}/${stats.quizzesFailed}`, icon: Brain },
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
                    <TrendingUp size={10} className="mt-[3px] flex-shrink-0 text-primary" />
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
                    <TrendingDown size={10} className="mt-[3px] flex-shrink-0 text-muted-foreground" />
                    <span className="font-body text-xs text-foreground">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReview;
