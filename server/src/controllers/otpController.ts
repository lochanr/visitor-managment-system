import { Request, Response } from 'express';

export const sendOtp = (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });
  // DEV MODE: OTP is always 123456
  res.json({ success: true, message: 'OTP sent (dev mode: use 123456)' });
};

export const verifyOtp = (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });
  if (otp !== '123456') return res.status(401).json({ error: 'Invalid OTP' });
  res.json({ success: true, message: 'OTP verified' });
};
