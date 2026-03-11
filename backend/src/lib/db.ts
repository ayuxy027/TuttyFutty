import { getDatabase, initDatabase } from "./database.js";

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export const db = {
  init: initDatabase,
  get: getDatabase,

  findMany<T = unknown>(table: string, filters?: Record<string, unknown>): T[] {
    const db = getDatabase();
    
    if (!filters || Object.keys(filters).length === 0) {
      return db.query(`SELECT * FROM ${table}`).all() as T[];
    }

    const keys = Object.keys(filters);
    const values = Object.values(filters);
    const where = keys.map((k) => `${k} = ?`).join(" AND ");
    
    return db.query(`SELECT * FROM ${table} WHERE ${where}`).all(...values) as T[];
  },

  findOne<T = unknown>(table: string, filters: Record<string, unknown>): T | undefined {
    const db = getDatabase();
    const keys = Object.keys(filters);
    const values = Object.values(filters);
    const where = keys.map((k) => `${k} = ?`).join(" AND ");
    
    return db.query(`SELECT * FROM ${table} WHERE ${where} LIMIT 1`).get(...values) as T | undefined;
  },

  create<T = unknown>(table: string, data: Record<string, unknown>): T {
    const db = getDatabase();
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");
    
    const stmt = db.query(
      `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`
    );
    
    const result = stmt.run(...values);
    return this.findOne<T>(table, { id: result.lastInsertRowid }) as T;
  },

  update<T = unknown>(table: string, id: number, data: Record<string, unknown>): T | undefined {
    const db = getDatabase();
    const keys = Object.keys(data);
    const values = Object.values(data);
    const set = keys.map((k) => `${k} = ?`).join(", ");
    
    db.query(`UPDATE ${table} SET ${set}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
    
    return this.findOne<T>(table, { id });
  },

  delete(table: string, id: number): boolean {
    const db = getDatabase();
    const result = db.query(`DELETE FROM ${table} WHERE id = ?`).run(id);
    return result.changes > 0;
  },

  query<T = unknown>(sql: string, ...params: unknown[]): T[] {
    const db = getDatabase();
    return db.query(sql).all(...params) as T[];
  },

  run(sql: string, ...params: unknown[]) {
    const db = getDatabase();
    return db.query(sql).run(...params);
  },
};
