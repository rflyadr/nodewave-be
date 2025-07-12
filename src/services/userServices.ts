import { prisma } from "../utils/prisma.utils";
import bcrypt from "bcrypt";

interface CreateUserInput {
  email: string;
  fullName: string;
  password: string;
}

export async function createUser({ email, fullName, password }: CreateUserInput) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      password: hashedPassword,
    },
  });
  return user;
}
