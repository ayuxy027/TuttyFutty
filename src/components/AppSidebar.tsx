import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target, Calendar, BookOpen, ChevronLeft, ChevronRight,
  Moon, Sun, PenLine, ListChecks, Repeat, Layers, BarChart3,
  Heart,
} from "lucide-react";
import { useState } from "react";

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
    ],
  },
];

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 48 : 200 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-screen flex-col border-r border-boundary bg-ground"
    >
      {/* Logo */}
      <div className="flex h-grid-6 items-center border-b border-boundary px-grid-2">
        {!collapsed && (
          <span className="font-mono text-xs font-semibold text-primary">TuttyFutty</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-grid-2 overflow-y-auto px-grid py-grid-2">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <span className="mb-grid block px-grid font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
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
                    className={`flex items-center gap-grid-2 rounded-lg px-grid-2 py-grid transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon size={14} strokeWidth={1.5} />
                    {!collapsed && <span className="font-mono text-[11px]">{label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Dark mode + Collapse */}
      <div className="flex flex-col border-t border-boundary">
        <button
          onClick={() => document.documentElement.classList.toggle("dark")}
          className="flex h-grid-5 items-center justify-center text-muted-foreground hover:text-primary"
        >
          <Sun size={14} className="hidden dark:block" />
          <Moon size={14} className="block dark:hidden" />
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-grid-5 items-center justify-center text-muted-foreground hover:text-primary"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
