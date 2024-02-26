import { Router } from "express";
import tableRoutes from "./tableRoutes";
import dashboardRoutes from "./dashboardRoutes";
import authRoutes from "./authRoutes";

const mainRouter = Router();

mainRouter.use("/auth", authRoutes);
mainRouter.use("/table", tableRoutes);
mainRouter.use("/dashboard", dashboardRoutes);

export default mainRouter;
