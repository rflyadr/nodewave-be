import { Request, Response, NextFunction } from "express";

export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const { email, fullName, password } = req.body;
  if (!email || !fullName || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  next();
}
