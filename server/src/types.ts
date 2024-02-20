// src/types.ts
import { Request } from "express";

export interface IRequestWithAuthData extends Request {
  authData?: {
    id: string;
    email: string;
    studio_id: string | null;
    role_id: number | null;
    app_id: string[] | null;
  };
}

export interface CustomError extends Error {
  status?: number;
  message: string;
}
