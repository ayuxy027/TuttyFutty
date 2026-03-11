import { Database } from "bun:sqlite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../../sqlite/tuttyfutty.db");
const schemaPath = path.resolve(__dirname, "../../../sqlite/schema.sql");

let db: Database | null = null;

export function initDatabase(): Database {
  if (db) return db;

  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);

  runMigrations(db);

  console.log(`Database initialized at: ${dbPath}`);
  return db;
}

export function getDatabase(): Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

function runMigrations(database: Database): void {
  if (!fs.existsSync(schemaPath)) {
    console.warn("Schema file not found:", schemaPath);
    return;
  }

  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Execute the entire schema as one transaction
  // This ensures tables are created before indexes
  try {
    database.exec(schema);
    console.log("Migrations run successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    // If full execution fails, fall back to statement-by-statement
    const statements = schema
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--") && !s.startsWith("-- "));

    for (const statement of statements) {
      try {
        database.exec(statement);
      } catch (err) {
        // Only warn, don't fail - "IF NOT EXISTS" handles most issues
        console.warn("Migration statement warning:", statement.substring(0, 60), (err as Error).message);
      }
    }
    console.log("Migrations completed with fallback method");
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log("Database closed");
  }
}
