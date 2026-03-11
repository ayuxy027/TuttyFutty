import { db } from "../lib/db.js";

export function logActivity(
  userId: number | undefined,
  action: string,
  entityType?: string,
  entityId?: number,
  metadata?: Record<string, unknown>
): void {
  try {
    db.create("user_activities", {
      user_id: userId || null,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export function getRecentActivity(userId: number, limit = 50) {
  return db.query(
    "SELECT * FROM user_activities WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    userId,
    limit
  );
}
