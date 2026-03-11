import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import WorkspaceLayout from "./components/WorkspaceLayout";
import Goals from "./pages/Goals";
import CalendarView from "./pages/CalendarView";
import SessionWorkspace from "./pages/SessionWorkspace";
import SprintView from "./pages/SprintView";
import PracticeCenter from "./pages/PracticeCenter";
import Journal from "./pages/Journal";
import DailyPlanner from "./pages/DailyPlanner";
import HabitTracker from "./pages/HabitTracker";
import Flashcards from "./pages/Flashcards";
import WeeklyReview from "./pages/WeeklyReview";
import AIChat from "./pages/AIChat";
import HealthCheck from "./pages/HealthCheck";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/workspace" element={
              <ProtectedRoute>
                <WorkspaceLayout />
              </ProtectedRoute>
            }>
            <Route index element={<Goals />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="session/:date" element={<SessionWorkspace />} />
            <Route path="sprint/:goalId" element={<SprintView />} />
            <Route path="practice" element={<PracticeCenter />} />
            <Route path="journal" element={<Journal />} />
            <Route path="planner" element={<DailyPlanner />} />
            <Route path="habits" element={<HabitTracker />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="review" element={<WeeklyReview />} />
            <Route path="ai" element={<AIChat />} />
            <Route path="health" element={<HealthCheck />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
