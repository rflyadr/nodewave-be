import { Request, Response } from "express";
import { prisma } from "../../utils/prisma.utils";

export const listProducts = async (req: Request, res: Response) => {
  const { fileId, page = 1, size = 10 } = req.query;

  const where: any = {};
  if (fileId) where.fileId = Number(fileId);

  const total = await prisma.product.count({ where });
  const products = await prisma.product.findMany({
    where,
    skip: (Number(page) - 1) * Number(size),
    take: Number(size),
    orderBy: { createdAt: "desc" },
  });

  res.json({
    page: Number(page),
    size: Number(size),
    total,
    products,
  });
};
