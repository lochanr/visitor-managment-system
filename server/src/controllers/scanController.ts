import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const scanQr = async (req: Request, res: Response) => {
  const { visitId } = req.body;
  if (!visitId) return res.status(400).json({ error: 'visitId required' });

  const visit = await prisma.visit.findUnique({
    where: { visitId },
    include: { visitor: true }
  });
  if (!visit) return res.status(404).json({ error: 'Invalid QR code' });
  if (visit.status === 'PENDING') return res.status(403).json({ error: 'Visit not approved yet' });
  if (visit.status === 'REJECTED') return res.status(403).json({ error: 'Visit was rejected' });
  if (visit.status === 'CHECKED_OUT') return res.status(400).json({ error: 'Visitor already checked out' });

  if (visit.status === 'APPROVED') {
    const updated = await prisma.visit.update({
      where: { visitId },
      data: { status: 'CHECKED_IN', inTime: new Date() },
      include: { visitor: true }
    });
    return res.json({ message: 'Entry marked successfully', visit: updated });
  }

  if (visit.status === 'CHECKED_IN') {
    const updated = await prisma.visit.update({
      where: { visitId },
      data: { status: 'CHECKED_OUT', outTime: new Date() },
      include: { visitor: true }
    });
    return res.json({ message: 'Exit marked successfully', visit: updated });
  }

  res.status(400).json({ error: 'Unexpected state' });
};
