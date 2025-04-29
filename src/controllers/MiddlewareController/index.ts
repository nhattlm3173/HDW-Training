import { NextFunction, Request, Response } from "express";
import jwt, {
  Jwt,
  JwtPayload,
  VerifyCallback,
  VerifyErrors,
} from "jsonwebtoken";
import { IUser } from "../../interface/IUser";
import dotenv from "dotenv";

dotenv.config();
export const middlewareController = {
  verifyToken: (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization;
    // console.log(req.headers);

    if (!token || typeof token !== "string") {
      res.status(403).json({ message: ["Token invalid"] });
      return;
    }
    if (token) {
      const accessToken = token.split(" ")[1];
      const jwtKey: string = process.env.JWT_ACCESS_KEY || "";
      const callback: VerifyCallback = (
        error: VerifyErrors | null,
        decoded: string | Jwt | JwtPayload | undefined
      ): void => {
        if (error) {
          res.status(403).json({ message: ["Token expired"] });
          return;
        }
        (req as any).user = decoded as IUser;
        next();
      };
      jwt.verify(accessToken, jwtKey, callback);
    } else {
      res.status(401).json({ message: ["You are not authenticated"] });
      return;
    }
  },
};
