import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { useState, useEffect } from "react";

const ISTClock = () => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      setTime(istTime.toLocaleTimeString("en-IN", { 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit",
        hour12: false 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm font-mono">
      <span className="text-muted-foreground">IST</span>
      <span className="font-semibold">{time}</span>
    </div>
  );
};

const WorkspaceLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-end border-b px-6">
          <ISTClock />
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default WorkspaceLayout;
