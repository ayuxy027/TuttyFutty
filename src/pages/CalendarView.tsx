import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import { apiRequest } from "../lib/api";

interface Session {
  id: number;
  session_date: string;
}

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessionDays, setSessionDays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<{ message: string; data: Session[] }>("/sessions");
        const sessions = response.data || [];
        const dates = sessions.map((session) => new Date(session.session_date));
        setSessionDays(dates);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const hasSession = (day: Date) =>
    sessionDays.some((s) => isSameDay(s, day));

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    navigate(`/workspace/session/${dateStr}`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-mono text-sm font-semibold text-foreground">
          Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-xs text-foreground min-w-[100px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
        {!loading && !error && (
          <>
            {/* Day labels */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="py-1 text-center font-mono text-[10px] text-muted-foreground uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const inMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);
                const session = hasSession(day);

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.005 }}
                    onClick={() => inMonth && handleDayClick(day)}
                    disabled={!inMonth}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-md border text-xs transition-all ${
                      !inMonth
                        ? "border-transparent text-muted-foreground/30"
                        : today
                        ? "border-foreground bg-foreground text-background font-semibold"
                        : session
                        ? "border-border bg-background hover:border-foreground hover:bg-muted"
                        : "border-transparent text-foreground hover:border-border hover:bg-muted"
                    }`}
                  >
                    <span className="font-mono">{format(day, "d")}</span>
                    {session && !today && (
                      <div className="absolute bottom-1.5 h-1 w-1 rounded-full bg-foreground" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
