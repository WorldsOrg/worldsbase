/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { databaseService } from "../../services/table/databaseService";

export class DashboardController {
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
                  FROM monster_match_history mh
                  LEFT JOIN monster_player_match_performance pmp ON mh.match_id = pmp.match_id
                  LEFT JOIN monster_players p ON pmp.player_id = p.id
                  LEFT JOIN monster_player_inventory pi ON p.id = pi.player_id
                  LEFT JOIN monster_game_resources r ON pi.resource_id = r.id
                  GROUP BY match_day
                  ORDER BY 1) SELECT TO_CHAR(match_day, 'FMDay, Mon DD, YYYY') AS match_day_friendly,
                                 *,
                                 ROW_NUMBER() OVER (
                                                    ORDER BY match_day) AS row_num
               FROM matches) AS virtual_table
            GROUP BY match_day_friendly
            ORDER BY "sum_row_num" ASC
            LIMIT 100;`;

    const result = await databaseService.executeQuery(query);
    const { status, data, error } = result;

    if (status === StatusCodes.OK && data) {
      res.status(StatusCodes.OK).json(data);
    } else {
      res.status(status).send(error);
    }
  };

  getPlayerCount = async (req: Request, res: Response) => {
    const query = `
    SELECT COUNT(*) AS count
    FROM monster_players
    LIMIT 50000;`;

    const result = await databaseService.executeQuery(query);
    const { status, data, error } = result;

    if (status === StatusCodes.OK && data) {
      res.status(StatusCodes.OK).json(data);
    } else {
      res.status(status).send(error);
    }
  };

  getTopFivePlayersHighestAverageHeadshots = async (
    req: Request,
    res: Response
  ) => {
    const query = `
          SELECT steam_username AS steam_username,
                 avg_headshots_per_match AS count
          FROM
            (SELECT p.steam_username,
                    ROUND(AVG(pmp.headshots), 2) AS avg_headshots_per_match
             FROM monster_players p
             JOIN monster_player_match_performance pmp ON p.id = pmp.player_id
             GROUP BY p.steam_username
             ORDER BY avg_headshots_per_match DESC
             LIMIT 5) AS virtual_table
          LIMIT 1000;`;

    const result = await databaseService.executeQuery(query);
    const { status, data, error } = result;

    if (status === StatusCodes.OK && data) {
      res.status(StatusCodes.OK).json(data);
    } else {
      res.status(status).send(error);
    }
  };

  getTopFiveActivePlayersMatchCount = async (req: Request, res: Response) => {
    const query = `
    SELECT steam_username AS steam_username,
    total_matches AS count
FROM
(SELECT p.steam_username,
       COUNT(DISTINCT mh.match_id) AS total_matches
FROM monster_players p
JOIN monster_player_match_performance pmp ON p.id = pmp.player_id
JOIN monster_match_history mh ON pmp.match_id = mh.match_id
GROUP BY p.steam_username
ORDER BY COUNT(DISTINCT mh.match_id) desc
limit 5) AS virtual_table
LIMIT 1000;`;

    const result = await databaseService.executeQuery(query);
    const { status, data, error } = result;

    if (status === StatusCodes.OK && data) {
      res.status(StatusCodes.OK).json(data);
    } else {
      res.status(status).send(error);
    }
  };

  getAverageHeadshotsPerMatch = async (req: Request, res: Response) => {
    const query = `
    SELECT steam_username AS steam_username,
    avg_headshots_per_match AS count
FROM
(SELECT p.steam_username,
       ROUND(AVG(pmp.headshots), 2) AS avg_headshots_per_match
FROM monster_player_match_performance pmp
JOIN monster_players p ON pmp.player_id = p.id
GROUP BY p.steam_username) AS virtual_table
LIMIT 1000;`;

    const result = await databaseService.executeQuery(query);
    const { status, data, error } = result;

    if (status === StatusCodes.OK && data) {
      res.status(StatusCodes.OK).json(data);
    } else {
      res.status(status).send(error);
    }
  };

  getTotalMatchesPerDay = async (req: Request, res: Response) => {
    const query = `
    SELECT match_day AS match_day,
       total_matches AS count
FROM
  (WITH matches as
     (SELECT DATE_TRUNC('day', TO_TIMESTAMP(mh.start_time / 1000)) AS match_day,
             COUNT(DISTINCT mh.match_id) AS total_matches
      FROM monster_match_history mh
      GROUP BY match_day
      ORDER BY 1) SELECT TO_CHAR(match_day, 'FMDay, Mon DD, YYYY') as match_day,
                         total_matches
   from matches) AS virtual_table
LIMIT 1000;`;

    const result = await databaseService.executeQuery(query);
    const { status, data, error } = result;

    if (status === StatusCodes.OK && data) {
      res.status(StatusCodes.OK).json(data);
    } else {
      res.status(status).send(error);
    }
  };
}
