import { Router } from "express";
import { DashboardController } from "../controllers/dashboard/dashboardController";

const router = Router();
const controller = new DashboardController();

router.get("/getGameStatistics", controller.getMatchDayStatistics);
router.get("/getPlayerCount", controller.getPlayerCount);
router.get(
  "/getTopFiveHighestHeadshots",
  controller.getTopFivePlayersHighestAverageHeadshots,
);
router.get(
  "/getTopFiveMatchCount",
  controller.getTopFiveActivePlayersMatchCount,
);
router.get(
  "/getAverageHeadshotsPerMatch",
  controller.getAverageHeadshotsPerMatch,
);
router.get(
  "/getTotalMatchesPerDay",
  controller.getTotalMatchesPerDay,
);


export default router;


