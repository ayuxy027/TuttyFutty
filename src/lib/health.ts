const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface EndpointStatus {
  name: string;
  path: string;
  status: "checking" | "online" | "offline" | "error";
  latency?: number;
  error?: string;
}

export interface HealthCheckResult {
  timestamp: string;
  endpoints: EndpointStatus[];
  summary: {
    total: number;
    online: number;
    offline: number;
    error: number;
  };
}

const endpoints = [
  { name: "Health", path: "/health" },
  { name: "Goals", path: "/goals" },
  { name: "Tasks", path: "/tasks" },
  { name: "Habits", path: "/habits" },
  { name: "Journal", path: "/journal" },
  { name: "Flashcards", path: "/flashcards" },
  { name: "Sessions", path: "/sessions" },
  { name: "Daily Plans", path: "/plans" },
  { name: "AI Conversations", path: "/ai/conversations" },
  { name: "User Sessions", path: "/sessions/tracking" },
];

async function checkEndpoint(endpoint: typeof endpoints[0]): Promise<EndpointStatus> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE}${endpoint.path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const latency = Date.now() - startTime;
    
    if (response.ok || response.status === 401) {
      return {
        name: endpoint.name,
        path: endpoint.path,
        status: "online",
        latency,
      };
    } else {
      return {
        name: endpoint.name,
        path: endpoint.path,
        status: "error",
        latency,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      name: endpoint.name,
      path: endpoint.path,
      status: "offline",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function checkAllEndpoints(): Promise<HealthCheckResult> {
  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      const result = await checkEndpoint(endpoint);
      return result;
    })
  );

  const summary = {
    total: results.length,
    online: results.filter((r) => r.status === "online").length,
    offline: results.filter((r) => r.status === "offline").length,
    error: results.filter((r) => r.status === "error").length,
  };

  return {
    timestamp: new Date().toISOString(),
    endpoints: results,
    summary,
  };
}
