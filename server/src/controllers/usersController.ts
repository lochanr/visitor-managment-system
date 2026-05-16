import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const logSimulatedEmail = (to: string, name: string, email: string, tempPassword: string, isReset = false) => {
  console.log('\n========== SIMULATED EMAIL ==========');
  console.log(`To: ${to}`);
  console.log(`Subject: Visitor Management System - ${isReset ? 'Password Reset' : 'Login Credentials'}`);
  console.log('Body:');
  console.log(`Hello ${name},`);
  if (isReset) {
    console.log('Your password has been reset by the Owner.');
  } else {
    console.log('Your host account has been created.');
  }
  console.log(`Login Email: ${email}`);
  console.log(`Temporary Password: ${tempPassword}`);
  console.log('Please change your password after first login.');
  console.log('=====================================\n');
};

export const getHosts = async (_req: AuthRequest, res: Response) => {
  const hosts = await prisma.user.findMany({
    where: { role: 'HOST' },
    select: {
      id: true, name: true, email: true, role: true,
      mustChangePassword: true, isActive: true, createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(hosts);
};

export const createHost = async (req: AuthRequest, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'name and email are required' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already exists' });

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'HOST', mustChangePassword: true, isActive: true },
    select: {
      id: true, name: true, email: true, role: true,
      mustChangePassword: true, isActive: true, createdAt: true
    }
  });

  logSimulatedEmail(email, name, email, tempPassword, false);

  // Return tempPassword once — frontend must show and copy it
  res.json({ ...user, tempPassword });
};

export const deactivateHost = async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params['id'] as string);

  // Prevent owner from deactivating themselves
  if (req.user!.id === id)
    return res.status(400).json({ error: 'You cannot deactivate your own account' });

  const host = await prisma.user.findUnique({ where: { id } });
  if (!host) return res.status(404).json({ error: 'Host not found' });

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: {
      id: true, name: true, email: true, role: true,
      mustChangePassword: true, isActive: true, createdAt: true
    }
  });
  res.json(updated);
};

export const reactivateHost = async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params['id'] as string);

  const host = await prisma.user.findUnique({ where: { id } });
  if (!host) return res.status(404).json({ error: 'Host not found' });

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: true },
    select: {
      id: true, name: true, email: true, role: true,
      mustChangePassword: true, isActive: true, createdAt: true
    }
  });
  res.json(updated);
};

export const resetHostPassword = async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params['id'] as string);

  const host = await prisma.user.findUnique({ where: { id } });
  if (!host) return res.status(404).json({ error: 'Host not found' });

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const updated = await prisma.user.update({
    where: { id },
    data: { passwordHash, mustChangePassword: true },
    select: {
      id: true, name: true, email: true, role: true,
      mustChangePassword: true, isActive: true, createdAt: true
    }
  });

  logSimulatedEmail(host.email, host.name, host.email, tempPassword, true);

  res.json({ ...updated, tempPassword });
};
