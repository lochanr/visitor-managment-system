import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createVisit = async (req: Request, res: Response) => {
  try {
    const {
      phone, name, photoBase64, organizationName,
      idProofNumber, vehicleNumber,
      hostId, department, reason
    } = req.body;

    if (!hostId) return res.status(400).json({ error: 'hostId is required' });

    const host = await prisma.user.findUnique({ where: { id: parseInt(hostId) } });
    if (!host) return res.status(400).json({ error: 'Invalid host selected' });

    const visitor = await prisma.visitor.upsert({
      where: { phone },
      update: { name, photoBase64, organizationName, idProofNumber, vehicleNumber },
      create: { phone, name, photoBase64, organizationName, idProofNumber, vehicleNumber }
    });

    const visit = await prisma.visit.create({
      data: {
        visitorId: visitor.id,
        hostId: parseInt(hostId),
        department,
        reason,
        status: 'PENDING'
      },
      include: {
        visitor: true,
        host: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    // Return id, visitId, status clearly for frontend polling
    res.json({ id: visit.id, visitId: visit.visitId, status: visit.status, visit });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

// Poll by DB id — public, used by waiting page
export const getVisitStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);
    const visit = await prisma.visit.findUnique({
      where: { id },
      select: {
        id: true,
        visitId: true,
        status: true,
        approvedAt: true,
        rejectedAt: true,
      }
    });
    if (!visit) return res.status(404).json({ error: 'Visit not found' });
    res.json(visit);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getVisits = async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const where = user.role === 'OWNER' ? {} : { hostId: user.id };
  const visits = await prisma.visit.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      visitor: true,
      host: { select: { id: true, name: true, email: true, role: true } }
    }
  });
  res.json(visits);
};

export const getVisitById = async (req: AuthRequest, res: Response) => {
  const visit = await prisma.visit.findUnique({
    where: { visitId: req.params['visitId'] as string },
    include: {
      visitor: true,
      host: { select: { id: true, name: true, email: true, role: true } }
    }
  });
  if (!visit) return res.status(404).json({ error: 'Visit not found' });
  res.json(visit);
};

export const approveVisit = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);
    const user = req.user!;

    const existing = await prisma.visit.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (user.role === 'HOST' && existing.hostId !== user.id)
      return res.status(403).json({ error: 'Not assigned to you' });

    const visit = await prisma.visit.update({
      where: { id },
      data: {
        status: 'APPROVED',
        qrValue: existing.visitId,  // visitId is already set by cuid default
        approvedAt: new Date()
      },
      include: {
        visitor: true,
        host: { select: { id: true, name: true, email: true, role: true } }
      }
    });
    res.json(visit);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const rejectVisit = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);
    const user = req.user!;

    const existing = await prisma.visit.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (user.role === 'HOST' && existing.hostId !== user.id)
      return res.status(403).json({ error: 'Not assigned to you' });

    const visit = await prisma.visit.update({
      where: { id },
      data: { status: 'REJECTED', rejectedAt: new Date() },
      include: {
        visitor: true,
        host: { select: { id: true, name: true, email: true, role: true } }
      }
    });
    res.json(visit);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const recoverPass = async (req: Request, res: Response) => {
  const phone = decodeURIComponent(req.params['phone'] as string);
  const visitor = await prisma.visitor.findUnique({ where: { phone } });
  if (!visitor) return res.status(404).json({ error: 'No visitor found for this phone' });

  const visit = await prisma.visit.findFirst({
    where: {
      visitorId: visitor.id,
      status: { in: ['APPROVED', 'CHECKED_IN'] }
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, visitId: true, status: true }
  });

  if (!visit) return res.status(404).json({ error: 'No active approved pass found for this phone number' });
  res.json(visit);
};

export const getVisitPass = async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params as { visitId: string };
    const visit = await prisma.visit.findUnique({
      where: { visitId },
      include: {
        visitor: true,
        host: { select: { id: true, name: true, email: true, role: true } }
      }
    });
    if (!visit) return res.status(404).json({ error: 'Visit not found' });
    res.json(visit);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
