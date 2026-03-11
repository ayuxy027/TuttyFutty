import { useState, useEffect } from "react";
import { checkAllEndpoints, type HealthCheckResult, type EndpointStatus } from "../lib/health";
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const StatusIcon = ({ status }: { status: EndpointStatus["status"] }) => {
  switch (status) {
    case "online":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "offline":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case "checking":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    default:
      return null;
  }
};

const HealthCheck = () => {
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshHealth = async () => {
    setLoading(true);
    try {
      const result = await checkAllEndpoints();
      setHealth(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Health Check</h1>
          <p className="text-sm text-muted-foreground">
            Monitor the status of all backend endpoints
          </p>
        </div>
        <Button onClick={refreshHealth} disabled={loading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {health && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{health.summary.online}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Offline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{health.summary.offline}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{health.summary.error}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {health?.endpoints.map((endpoint) => (
              <div
                key={endpoint.path}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon status={endpoint.status} />
                  <div>
                    <div className="font-medium">{endpoint.name}</div>
                    <div className="text-xs text-muted-foreground">{endpoint.path}</div>
                  </div>
                </div>
                <div className="text-right">
                  {endpoint.latency && (
                    <span className="text-sm text-muted-foreground">
                      {endpoint.latency}ms
                    </span>
                  )}
                  {endpoint.error && (
                    <span className="text-sm text-red-500">{endpoint.error}</span>
                  )}
                </div>
              </div>
            ))}
            {loading && !health && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {lastUpdated && (
        <p className="text-center text-xs text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default HealthCheck;
