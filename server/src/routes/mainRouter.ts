import { Router } from "express";
import tableRoutes from "./tableRoutes";
import walletRoutes from "./walletRoutes";
import onChainRoutes from "./onChainRoutes";
import dashboardRoutes from "./dashboardRoutes";
import authRoutes from "./authRoutes";

const mainRouter = Router();

mainRouter.use("/auth", authRoutes);
mainRouter.use("/table", tableRoutes);
mainRouter.use("/wallet", walletRoutes);
mainRouter.use("/onChain", onChainRoutes);
mainRouter.use("/dashboard", dashboardRoutes);

export default mainRouter;
