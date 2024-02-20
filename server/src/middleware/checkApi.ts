import { NextFunction, Response, Request } from "express";
import { StatusCodes } from "http-status-codes";

const checkApiMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const x_api_key = req.headers["x-api-key"] as string;
    if (!x_api_key) {
      return res.status(StatusCodes.UNAUTHORIZED).send("API key is required.");
    } else if (x_api_key !== process.env.API_KEY) {
      return res.status(StatusCodes.UNAUTHORIZED).send("Invalid API key.");
    }
    next();
  } catch (error) {
    console.error("Error in checkApiMiddleWare:", error);
    res.status(StatusCodes.UNAUTHORIZED).send("API key is required.");
  }
};

export default checkApiMiddleWare;
