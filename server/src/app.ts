/* eslint-disable comma-dangle */
// src/app.ts
import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction } from "express";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import { StatusCodes } from "http-status-codes";
import mainRouter from "./routes/mainRouter";
import swaggerJson from "../documentation/swagger/swagger-open-api.json";
import moesif from "moesif-nodejs";
import checkApiMiddleWare from "./middleware/checkApi";

const app = express();

const moesifMiddleware = moesif({
  applicationId: process.env.moesifId as string,
});

app.use(moesifMiddleware);

app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerJson));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(checkApiMiddleWare);
app.use(mainRouter);

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: "An unexpected error occurred. Please try again later.",
  });
});
export default app;
