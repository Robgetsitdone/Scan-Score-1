/**
 * Database client initialization
 * Exports the Drizzle ORM instance for use throughout the server
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Re-export all schemas for convenience
export * from "@shared/schema";
export * from "@shared/models/chat";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "DATABASE_URL not set. Database features will not be available."
  );
}

// Create postgres client (lazy connection)
const client = connectionString
  ? postgres(connectionString, { prepare: false })
  : null;

// Create and export the Drizzle instance
export const db = client ? drizzle(client) : null;

/**
 * Check if the database is available
 */
export function isDatabaseAvailable(): boolean {
  return db !== null;
}

/**
 * Get the database instance, throwing if not available
 */
export function getDb() {
  if (!db) {
    throw new Error(
      "Database not available. Ensure DATABASE_URL environment variable is set."
    );
  }
  return db;
}
