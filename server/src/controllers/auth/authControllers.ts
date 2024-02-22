import { Request, Response } from "express";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { StatusCodes } from "http-status-codes";
import { databaseService } from "../../services/table/databaseService";

interface UserPayload {
  email: string;
  id: number;
}

export class AuthController {
  getMe = async (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(StatusCodes.UNAUTHORIZED);
    jwt.verify(token, process.env.SECRET_KEY as string, (err: Error | null, user: object | undefined) => {
      if (err) {
        return res.sendStatus(StatusCodes.FORBIDDEN);
      }
      const userInfo = user as UserPayload;
      res.status(StatusCodes.OK).send(userInfo);
    });
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).send("Missing input");
    }

    try {
      const query = "SELECT * FROM dashboard_users WHERE email = $1";
      const values = [email];
      const result = await databaseService.executeQuery(query, values);

      if (result.status === StatusCodes.OK && result.data && result.data?.length > 0) {
        const user = result.data[0];
        console.log(user);

        if (await bcrypt.compare(password, user.password)) {
          const accessToken = jwt.sign({ email: user.email, id: user.id }, process.env.SECRET_KEY, { expiresIn: "7d" });
          return res.status(StatusCodes.OK).json({ accessToken });
        } else {
          return res.status(StatusCodes.UNAUTHORIZED).send("Password incorrect");
        }
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).send("No user found with this email");
      }
    } catch (err) {
      console.error(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server error");
    }
  };

  signup = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(StatusCodes.BAD_REQUEST).send("Missing input");
      return;
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = "INSERT INTO dashboard_users (email, password) VALUES ($1, $2) RETURNING *;";
      const values = [email, hashedPassword];
      const result = await databaseService.executeQuery(query, values);
      console.log(result);

      if (result.status === StatusCodes.OK) {
        if (result.data && result.data.length > 0) {
          const user = result.data[0];
          const accessToken = jwt.sign({ email: user.email, id: user.id }, process.env.SECRET_KEY, { expiresIn: "7d" });
          return res.status(StatusCodes.OK).json({ accessToken });
        }
      } else {
        res.status(result.status).send(result.error);
      }
    } catch (err) {
      console.error((err as Error).message);
      res.status(500).send("Server error");
    }
  };
}
