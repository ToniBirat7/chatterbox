import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config/index.js";
import type { ExtendedError, Socket } from "socket.io";
import cookie from "cookie";

export const authenticateJWTHTTP = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token: string | undefined = req.cookies["auth_token"];

  if (!token) {
    res.status(401).json({ message: "No token found" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authenticateJWTSocket = (
  socket: Socket,
  next: (err?: ExtendedError) => void
): void => {
  const cookieHeader = socket.handshake.headers.cookie;

  if (!cookieHeader) {
    next(new Error("Authentication failed: no cookie"));
    return;
  }

  const cookies = cookie.parse(cookieHeader);
  const token = cookies["auth_token"];

  if (!token) {
    next(new Error("Authentication failed: token missing"));
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserJwtPayload;
    socket.data.user = payload as Member & UserJwtPayload;
    next();
  } catch {
    next(new Error("Authentication failed: invalid token"));
  }
};
