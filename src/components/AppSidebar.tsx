import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target, Calendar, BookOpen, ChevronLeft, ChevronRight,
  Moon, Sun, PenLine, ListChecks, Repeat, Layers, BarChart3,
  Heart, LogOut, Shield,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const navSections = [
  {
    label: "Learn",
    items: [
      { icon: Target, path: "/workspace", label: "Goals" },
      { icon: Calendar, path: "/workspace/calendar", label: "Calendar" },
      { icon: BookOpen, path: "/workspace/practice", label: "Practice" },
      { icon: Layers, path: "/workspace/flashcards", label: "Flashcards" },
    ],
  },
  {
    label: "Productivity",
    items: [
      { icon: ListChecks, path: "/workspace/planner", label: "Planner" },
      { icon: Repeat, path: "/workspace/habits", label: "Habits" },
      { icon: PenLine, path: "/workspace/journal", label: "Journal" },
      { icon: BarChart3, path: "/workspace/review", label: "Review" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: Heart, path: "/workspace/health", label: "Health" },
      { icon: Shield, path: "/workspace/encryption", label: "Encryption" },
    ],
  },
];

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 48 : 180 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="flex h-screen flex-col border-r border-border bg-muted/20"
    >
      {/* Logo */}
      <div className="flex h-12 items-center border-b border-border px-3">
        <span className="font-mono text-xs font-semibold text-foreground">
          {collapsed ? "TF" : "TuttyFutty"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 py-3">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <span className="mb-2 block px-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {section.label}
              </span>
            )}
            <div className="flex flex-col gap-[2px]">
              {section.items.map(({ icon: Icon, path, label }) => {
                const isActive = location.pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                      isActive
                        ? "bg-foreground text-background"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={14} strokeWidth={1.5} />
                    {!collapsed && <span className="font-mono">{label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Dark mode + Collapse + Logout */}
      <div className="flex flex-col border-t border-border">
        <button
          onClick={() => document.documentElement.classList.toggle("dark")}
          className="flex h-9 items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <Sun size={14} className="hidden dark:block" />
          <Moon size={14} className="block dark:hidden" />
        </button>
        <button
          onClick={handleLogout}
          className="flex h-9 items-center justify-center text-muted-foreground hover:text-foreground"
          title="Logout"
        >
          <LogOut size={14} />
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-9 items-center justify-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
