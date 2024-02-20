// databaseService.js
import { getOrCreatePool } from "../../config/database/database";
import { StatusCodes } from "http-status-codes";

class DatabaseService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async executeQuery(query: string, queryParams: any[] = []) {
    try {
      const pool = await getOrCreatePool();
      const client = await pool.connect();
      try {
        const result = await client.query(query, queryParams);
        return { status: StatusCodes.OK, data: result.rows };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error executing query:", error);
      return { status: StatusCodes.INTERNAL_SERVER_ERROR, error: "Error executing query" };
    }
  }
}

export const databaseService = new DatabaseService();
