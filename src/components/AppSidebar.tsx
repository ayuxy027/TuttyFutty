import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Calendar, BookOpen, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { icon: Target, path: "/workspace", label: "Goals" },
  { icon: Calendar, path: "/workspace/calendar", label: "Calendar" },
  { icon: BookOpen, path: "/workspace/practice", label: "Practice" },
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
          <span className="font-mono text-xs font-semibold text-primary">
            TuttyFutty
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-grid px-grid py-grid-2">
        {navItems.map(({ icon: Icon, path, label }) => {
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
              <Icon size={16} strokeWidth={1.5} />
              {!collapsed && (
                <span className="font-mono text-xs">{label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-grid-5 items-center justify-center border-t border-boundary text-muted-foreground hover:text-primary"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
};

export default AppSidebar;
