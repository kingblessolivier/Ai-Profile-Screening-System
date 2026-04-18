import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Support token via query param for SSE (EventSource can't set headers)
  const queryToken = typeof req.query.token === "string" ? req.query.token : null;
  const header = req.headers.authorization;
  const token = queryToken ?? (header?.startsWith("Bearer ") ? header.split(" ")[1] : null);
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
