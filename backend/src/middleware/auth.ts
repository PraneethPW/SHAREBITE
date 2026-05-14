import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "donor" | "receiver";
  location: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  const token = header?.startsWith("Bearer ")
    ? header.slice(7)
    : undefined;

  if (!token) {
    return res.status(401).json({
      message: "Missing token",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev"
    ) as AuthUser;

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}