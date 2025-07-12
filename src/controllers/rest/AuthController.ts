import { Request, Response } from "express";
import { prisma } from "../../utils/prisma.utils";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );
  res.json({ token });
};

export const register = async (req: Request, res: Response) => {
  const { email, fullName, password } = req.body;
  if (!email || !fullName || !password) {
    return res.status(400).json({ message: "Email, fullName, and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
      },
    });
    res.json({ id: user.id, email: user.email, fullName: user.fullName });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
