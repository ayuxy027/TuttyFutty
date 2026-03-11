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
        const data = await apiRequest<Session[]>("/sessions");
        const dates = data.map((session) => new Date(session.session_date));
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
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-boundary px-grid-3 py-grid-2">
        <h2 className="font-mono text-sm font-semibold text-primary">
          Calendar
        </h2>
        <div className="flex items-center gap-grid-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-lg p-grid text-muted-foreground hover:text-primary"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-mono text-xs text-primary">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-lg p-grid text-muted-foreground hover:text-primary"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-grid-3 py-grid-3">
        {loading && (
          <div className="flex items-center justify-center py-grid-4">
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-grid-3">
            <p className="font-body text-xs text-destructive">{error}</p>
          </div>
        )}
        {!loading && !error && (
          <>
            {/* Day labels */}
            <div className="mb-grid grid grid-cols-7 gap-grid">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="py-grid text-center font-mono text-[10px] text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-grid">
              {days.map((day, i) => {
                const inMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);
                const session = hasSession(day);

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.008 }}
                    onClick={() => inMonth && handleDayClick(day)}
                    disabled={!inMonth}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border transition-colors ${
                      !inMonth
                        ? "border-transparent text-muted-foreground/30"
                        : today
                        ? "border-primary bg-primary text-primary-foreground"
                        : session
                        ? "border-boundary bg-ground text-primary hover:border-primary"
                        : "border-transparent text-foreground hover:border-boundary hover:bg-ground"
                    }`}
                  >
                    <span className="font-mono text-xs">{format(day, "d")}</span>
                    {session && !today && (
                      <div className="absolute bottom-[6px] h-[3px] w-[3px] rounded-full bg-primary" />
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
