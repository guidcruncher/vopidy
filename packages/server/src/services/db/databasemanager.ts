// databaseManager.ts
import { Database, open } from "sqlite"
import sqlite3 from "sqlite3"

// Define a type for the open database instance for better typing
export type DbInstance = Database

/**
 * Manages the connection to the SQLite database.
 */
export class DatabaseManager {
  /**
   * Opens and returns a connection to the SQLite database.
   * @returns A promise that resolves to the opened database instance.
   */
  public static async getDb(): Promise<DbInstance> {
    // Note: It's often better to manage a single, persistent connection
    // for an application, but for this refactoring, we'll keep the
    // open/close pattern from the original class.
    if (!process.env.VOPIDY_DB) {
      throw new Error("VOPIDY_DB environment variable is not set.")
    }
    return open({
      filename: `${process.env.VOPIDY_DB}/vopidy.sqlite`,
      driver: sqlite3.Database,
    })
  }
}
