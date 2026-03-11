import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const TIMEZONES = [
  { label: "IST", zone: "Asia/Kolkata" },
  { label: "GMT", zone: "Europe/London" },
  { label: "EST", zone: "America/New_York" },
  { label: "PST", zone: "America/Los_Angeles" },
];

const Clock = () => {
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [time, setTime] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tzTime = new Date(now.toLocaleString("en-US", { timeZone: timezone.zone }));
      setTime(tzTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-mono cursor-pointer hover:border-muted-foreground/50 transition-colors"
           onClick={() => setShowDropdown(!showDropdown)}>
        <span className="text-muted-foreground">{timezone.label}</span>
        <span className="font-semibold text-foreground">{time}</span>
        <ChevronDown size={12} className="text-muted-foreground" />
      </div>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 z-50 rounded-md border border-border bg-background shadow-md overflow-hidden">
          {TIMEZONES.map((tz) => (
            <button
              key={tz.label}
              onClick={() => { setTimezone(tz); setShowDropdown(false); }}
              className={`w-full px-3 py-1.5 text-left text-xs font-mono transition-colors ${
                timezone.label === tz.label
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tz.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const WorkspaceLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-end border-b border-border px-4">
          <Clock />
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default WorkspaceLayout;
