/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getOrCreatePool } from "../../config/database/database";

export class DashboardController {
  private async handleDatabaseRequest(req: Request, res: Response, query: string, queryParams: any[] = []) {
    try {
      const pool = await getOrCreatePool();
      const client = await pool.connect();
      try {
        const result = await client.query(query, queryParams);
        res.status(StatusCodes.OK).json(result.rows);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Error executing query");
    }
  }

  getMatchDayStatistics = async (req: Request, res: Response) => {
    const query = `
            SELECT match_day_friendly AS "match_day_friendly",
                   sum(total_players) AS "players",
                   sum(total_matches) AS "matches",
                   sum(total_headshots) AS "headshots",
                   sum(total_resources) AS "resources",
                   sum(row_num) AS "sum_row_num"
            FROM
              (WITH matches AS
                 (SELECT DATE_TRUNC('day', TO_TIMESTAMP(mh.start_time / 1000))::DATE AS match_day,
                         COUNT(DISTINCT mh.match_id) AS total_matches,
                         COUNT(DISTINCT pmp.id) AS total_players,
                         COALESCE(SUM(pmp.headshots), 0) AS total_headshots,
                         COALESCE(SUM(pi.quantity), 0) AS total_resources
                  FROM match_history mh
                  LEFT JOIN player_match_performance pmp ON mh.match_id = pmp.match_id
                  LEFT JOIN players p ON pmp.player_id = p.id
                  LEFT JOIN player_inventory pi ON p.id = pi.player_id
                  LEFT JOIN resources r ON pi.resource_id = r.id
                  GROUP BY match_day
                  ORDER BY 1) SELECT TO_CHAR(match_day, 'FMDay, Mon DD, YYYY') AS match_day_friendly,
                                 *,
                                 ROW_NUMBER() OVER (
                                                    ORDER BY match_day) AS row_num
               FROM matches) AS virtual_table
            GROUP BY match_day_friendly
            ORDER BY "sum_row_num" ASC
            LIMIT 100;`;

    await this.handleDatabaseRequest(req, res, query);
  };

  getPlayerCount = async (req: Request, res: Response) => {
    const query = `
    SELECT COUNT(*) AS count
    FROM public.players
    LIMIT 50000;`;

    await this.handleDatabaseRequest(req, res, query);
  };

  getTopFivePlayersHighestAverageHeadshots = async (req: Request, res: Response) => {
    const query = `
          SELECT steam_username AS steam_username,
                 avg_headshots_per_match AS count
          FROM
            (SELECT p.steam_username,
                    ROUND(AVG(pmp.headshots), 2) AS avg_headshots_per_match
             FROM players p
             JOIN player_match_performance pmp ON p.id = pmp.player_id
             GROUP BY p.steam_username
             ORDER BY avg_headshots_per_match DESC
             LIMIT 5) AS virtual_table
          LIMIT 1000;`;

    await this.handleDatabaseRequest(req, res, query);
  };

  getTopFiveActivePlayersMatchCount = async (req: Request, res: Response) => {
    const query = `
    SELECT steam_username AS steam_username,
    total_matches AS count
FROM
(SELECT p.steam_username,
       COUNT(DISTINCT mh.match_id) AS total_matches
FROM players p
JOIN player_match_performance pmp ON p.id = pmp.player_id
JOIN match_history mh ON pmp.match_id = mh.match_id
GROUP BY p.steam_username
ORDER BY COUNT(DISTINCT mh.match_id) desc
limit 5) AS virtual_table
LIMIT 1000;`;

    await this.handleDatabaseRequest(req, res, query);
  };

  getAverageHeadshotsPerMatch = async (req: Request, res: Response) => {
    const query = `
    SELECT steam_username AS steam_username,
    avg_headshots_per_match AS count
FROM
(SELECT p.steam_username,
       ROUND(AVG(pmp.headshots), 2) AS avg_headshots_per_match
FROM player_match_performance pmp
JOIN players p ON pmp.player_id = p.id
GROUP BY p.steam_username) AS virtual_table
LIMIT 1000;`;

    await this.handleDatabaseRequest(req, res, query);
  };

  getTotalMatchesPerDay = async (req: Request, res: Response) => {
    const query = `
    SELECT match_day AS match_day,
       total_matches AS count
FROM
  (WITH matches as
     (SELECT DATE_TRUNC('day', TO_TIMESTAMP(mh.start_time / 1000)) AS match_day,
             COUNT(DISTINCT mh.match_id) AS total_matches
      FROM match_history mh
      GROUP BY match_day
      ORDER BY 1) SELECT TO_CHAR(match_day, 'FMDay, Mon DD, YYYY') as match_day,
                         total_matches
   from matches) AS virtual_table
LIMIT 1000;`;

    await this.handleDatabaseRequest(req, res, query);
  };
}
