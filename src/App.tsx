import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import WorkspaceLayout from "./components/WorkspaceLayout";
import Goals from "./pages/Goals";
import CalendarView from "./pages/CalendarView";
import SessionWorkspace from "./pages/SessionWorkspace";
import SprintView from "./pages/SprintView";
import PracticeCenter from "./pages/PracticeCenter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/workspace" element={<WorkspaceLayout />}>
            <Route index element={<Goals />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="session/:date" element={<SessionWorkspace />} />
            <Route path="sprint/:goalId" element={<SprintView />} />
            <Route path="practice" element={<PracticeCenter />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
