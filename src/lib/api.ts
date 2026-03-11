const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Helper for making API requests
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================
// AUTH
// ============================================
export interface User {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const auth = {
  login: (data: AuthLoginRequest) =>
    apiRequest<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  register: (data: AuthRegisterRequest) =>
    apiRequest<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  logout: () =>
    apiRequest<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () =>
    apiRequest<User>("/auth/me"),
};

// ============================================
// GOALS
// ============================================
export interface Goal {
  id: number;
  user_id: number | null;
  title: string;
  description: string | null;
  category: string | null;
  target_date: string | null;
  status: "active" | "completed" | "archived";
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface GoalCreateRequest {
  title: string;
  description?: string;
  category?: string;
  target_date?: string;
  status?: "active" | "completed" | "archived";
  priority?: number;
}

export const goals = {
  getAll: () => apiRequest<Goal[]>("/goals"),

  getById: (id: number) => apiRequest<Goal>(`/goals/${id}`),

  create: (data: GoalCreateRequest) =>
    apiRequest<Goal>("/goals", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<GoalCreateRequest>) =>
    apiRequest<Goal>(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiRequest<void>(`/goals/${id}`, { method: "DELETE" }),
};

// ============================================
// TASKS
// ============================================
export interface Task {
  id: number;
  sprint_id: number | null;
  goal_id: number | null;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateRequest {
  sprint_id?: number;
  goal_id?: number;
  title: string;
  description?: string;
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: number;
  due_date?: string;
}

export const tasks = {
  getAll: () => apiRequest<Task[]>("/tasks"),

  getById: (id: number) => apiRequest<Task>(`/tasks/${id}`),

  getByGoal: (goalId: number) => apiRequest<Task[]>(`/tasks?goal_id=${goalId}`),

  getBySprint: (sprintId: number) => apiRequest<Task[]>(`/tasks?sprint_id=${sprintId}`),

  create: (data: TaskCreateRequest) =>
    apiRequest<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<TaskCreateRequest>) =>
    apiRequest<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiRequest<void>(`/tasks/${id}`, { method: "DELETE" }),
};

// ============================================
// HABITS
// ============================================
export interface Habit {
  id: number;
  user_id: number | null;
  name: string;
  description: string | null;
  frequency: "daily" | "weekly" | "monthly";
  target_count: number;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  completed_at: string;
  notes: string | null;
}

export interface HabitCreateRequest {
  name: string;
  description?: string;
  frequency?: "daily" | "weekly" | "monthly";
  target_count?: number;
}

export const habits = {
  getAll: () => apiRequest<Habit[]>("/habits"),

  getById: (id: number) => apiRequest<Habit>(`/habits/${id}`),

  create: (data: HabitCreateRequest) =>
    apiRequest<Habit>("/habits", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<HabitCreateRequest>) =>
    apiRequest<Habit>(`/habits/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiRequest<void>(`/habits/${id}`, { method: "DELETE" }),

  // Habit Logs
  logCompletion: (habitId: number, notes?: string) =>
    apiRequest<HabitLog>(`/habits/${habitId}/log`, { method: "POST", body: JSON.stringify({ notes }) }),

  getLogs: (habitId: number) =>
    apiRequest<HabitLog[]>(`/habits/${habitId}/logs`),
};

// ============================================
// JOURNAL
// ============================================
export interface JournalEntry {
  id: number;
  user_id: number | null;
  title: string | null;
  content: string;
  mood: string | null;
  tags: string | null;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface JournalCreateRequest {
  title?: string;
  content: string;
  mood?: string;
  tags?: string;
  entry_date?: string;
}

export const journal = {
  getAll: () => apiRequest<JournalEntry[]>("/journal"),

  getById: (id: number) => apiRequest<JournalEntry>(`/journal/${id}`),

  getByDate: (date: string) => apiRequest<JournalEntry[]>(`/journal?entry_date=${date}`),

  create: (data: JournalCreateRequest) =>
    apiRequest<JournalEntry>("/journal", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<JournalCreateRequest>) =>
    apiRequest<JournalEntry>(`/journal/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiRequest<void>(`/journal/${id}`, { method: "DELETE" }),
};

// ============================================
// FLASHCARDS
// ============================================
export interface Flashcard {
  id: number;
  user_id: number | null;
  deck_name: string;
  front: string;
  back: string;
  difficulty: number;
  last_reviewed: string | null;
  next_review: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlashcardCreateRequest {
  deck_name: string;
  front: string;
  back: string;
  difficulty?: number;
}

export const flashcards = {
  getAll: () => apiRequest<Flashcard[]>("/flashcards"),

  getById: (id: number) => apiRequest<Flashcard>(`/flashcards/${id}`),

  getByDeck: (deckName: string) => apiRequest<Flashcard[]>(`/flashcards?deck_name=${encodeURIComponent(deckName)}`),

  getDates: () => apiRequest<string[]>("/flashcards/dates"),

  getByDate: (date: string) => apiRequest<Flashcard[]>(`/flashcards/date/${date}`),

  generate: (topic: string, count: number, deckName: string) =>
    apiRequest<Flashcard[]>("/flashcards/generate", { 
      method: "POST", 
      body: JSON.stringify({ topic, count, deck_name: deckName }) 
    }),

  create: (data: FlashcardCreateRequest) =>
    apiRequest<Flashcard>("/flashcards", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<FlashcardCreateRequest>) =>
    apiRequest<Flashcard>(`/flashcards/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiRequest<void>(`/flashcards/${id}`, { method: "DELETE" }),
};

// ============================================
// SESSIONS (Focus Sessions)
// ============================================
export interface Session {
  id: number;
  user_id: number | null;
  title: string;
  description: string | null;
  session_date: string;
  duration_minutes: number | null;
  focus_rating: number | null;
  energy_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionCreateRequest {
  title: string;
  description?: string;
  session_date: string;
  duration_minutes?: number;
  focus_rating?: number;
  energy_rating?: number;
  notes?: string;
}

export const sessions = {
  getAll: () => apiRequest<Session[]>("/sessions"),

  getById: (id: number) => apiRequest<Session>(`/sessions/${id}`),

  getByDate: (date: string) => apiRequest<Session[]>(`/sessions?session_date=${date}`),

  create: (data: SessionCreateRequest) =>
    apiRequest<Session>("/sessions", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<SessionCreateRequest>) =>
    apiRequest<Session>(`/sessions/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiRequest<void>(`/sessions/${id}`, { method: "DELETE" }),
};

// ============================================
// DAILY PLANS
// ============================================
export interface DailyPlan {
  id: number;
  user_id: number | null;
  plan_date: string;
  tasks: string | null;
  notes: string | null;
  focus_areas: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyPlanCreateRequest {
  plan_date: string;
  tasks?: string;
  notes?: string;
  focus_areas?: string;
}

export const dailyPlans = {
  getAll: () => apiRequest<DailyPlan[]>("/plans"),

  getById: (id: number) => apiRequest<DailyPlan>(`/plans/${id}`),

  getByDate: (date: string) => apiRequest<DailyPlan[]>(`/plans?plan_date=${date}`),

  create: (data: DailyPlanCreateRequest) =>
    apiRequest<DailyPlan>("/plans", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<DailyPlanCreateRequest>) =>
    apiRequest<DailyPlan>(`/plans/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiRequest<void>(`/plans/${id}`, { method: "DELETE" }),
};

// ============================================
// AI CONVERSATIONS
// ============================================
export interface AIConversation {
  id: number;
  user_id: number | null;
  title: string | null;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: number;
  conversation_id: number;
  role: "user" | "model";
  content: string;
  tokens_used: number | null;
  created_at: string;
}

export interface AIConversationCreateRequest {
  title?: string;
  model?: string;
}

export const aiConversations = {
  getAll: () => apiRequest<AIConversation[]>("/ai/conversations"),

  getById: (id: number) => apiRequest<AIConversation>(`/ai/conversations/${id}`),

  create: (data: AIConversationCreateRequest) =>
    apiRequest<AIConversation>("/ai/conversations", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<AIConversationCreateRequest>) =>
    apiRequest<AIConversation>(`/ai/conversations/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiRequest<void>(`/ai/conversations/${id}`, { method: "DELETE" }),

  getMessages: (conversationId: number) =>
    apiRequest<AIMessage[]>(`/ai/conversations/${conversationId}/messages`),
};

// ============================================
// AI STREAMING
// ============================================
export async function* streamGenerate(prompt: string) {
  const response = await fetch(`${API_BASE}/ai/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));
        if (data.done) return;
        yield data.text;
      }
    }
  }
}

export async function* streamChat(messages: { role: "user" | "model"; parts: string }[]) {
  const response = await fetch(`${API_BASE}/ai/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));
        if (data.done) return;
        yield data.text;
      }
    }
  }
}

// ============================================
// USER SESSIONS (Tracking)
// ============================================
export interface UserSession {
  id: number;
  user_id: number;
  device_info: string | null;
  ip_address: string | null;
  started_at: string;
  ended_at: string | null;
  last_active_at: string;
}

export const userSessions = {
  getAll: () => apiRequest<UserSession[]>("/sessions/tracking"),

  getById: (id: number) => apiRequest<UserSession>(`/sessions/tracking/${id}`),

  start: (deviceInfo?: string) =>
    apiRequest<UserSession>("/sessions/tracking/start", { 
      method: "POST", 
      body: JSON.stringify({ device_info: deviceInfo }) 
    }),

  end: (id: number) =>
    apiRequest<UserSession>(`/sessions/tracking/${id}/end`, { method: "POST" }),

  updateActivity: (id: number) =>
    apiRequest<UserSession>(`/sessions/tracking/${id}/activity`, { method: "POST" }),
};

// ============================================
// QUIZ
// ============================================
export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: number;
  question: string;
  is_correct: boolean;
  goal_title: string | null;
  step_number: number | null;
  attempted_at: string;
}

export interface QuizGenerateRequest {
  topic?: string;
  count?: number;
}

export const quiz = {
  generate: (data?: QuizGenerateRequest) =>
    apiRequest<QuizQuestion>("/ai/quiz/generate", { 
      method: "POST", 
      body: JSON.stringify(data || {}) 
    }),

  getAttempts: () => apiRequest<QuizAttempt[]>("/ai/quiz/attempts"),
};

// ============================================
// STATS
// ============================================
export interface TaskStats {
  completed: number;
  total: number;
}

export interface HabitStats {
  rate: number;
}

export interface SessionStats {
  count: number;
  minutes: number;
}

export interface JournalStats {
  count: number;
}

export const stats = {
  getTasks: () => apiRequest<TaskStats>("/tasks/stats"),
  getHabits: () => apiRequest<HabitStats>("/habits/stats"),
  getSessions: () => apiRequest<SessionStats>("/sessions/stats"),
  getJournal: () => apiRequest<JournalStats>("/journal/stats"),
};

// ============================================
// HEALTH CHECK
// ============================================
export const health = {
  check: () => apiRequest<{ status: string; timestamp: string }>("/"),
};
