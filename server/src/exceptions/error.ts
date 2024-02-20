import { Response } from "express";
import { CustomError } from "../types";

export const handleErrors = (error: unknown, res: Response) => {
  const customError = error as CustomError;
  res.status(customError.status ?? 500).json(customError);
};
