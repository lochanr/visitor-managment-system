import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getHosts = async (_req: Request, res: Response) => {
  const hosts = await prisma.user.findMany({
    where: { isActive: true },   // ← only active hosts in dropdown
    select: { id: true, name: true, email: true, role: true }
  });
  res.json(hosts);
};
