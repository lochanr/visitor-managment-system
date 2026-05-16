import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getVisitorByPhone = async (req: Request, res: Response) => {
  const phone = decodeURIComponent(req.params['phone'] as string);
  const visitor = await prisma.visitor.findUnique({ where: { phone } });
  if (!visitor) return res.status(404).json({ error: 'Not found' });
  res.json(visitor);
};
