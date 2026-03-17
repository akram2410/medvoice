import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  specialty: z.string().optional(),
  licenseNo: z.string().min(1),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const existing = await prisma.doctor.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, 'Email already registered');

    const hashed = await bcrypt.hash(data.password, 12);
    const doctor = await prisma.doctor.create({
      data: { ...data, password: hashed },
      select: { id: true, email: true, firstName: true, lastName: true, specialty: true, licenseNo: true },
    });

    const token = jwt.sign({ doctorId: doctor.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({ doctor, token });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const doctor = await prisma.doctor.findUnique({ where: { email } });
    if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = jwt.sign({ doctorId: doctor.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const { password: _, ...doctorSafe } = doctor;
    res.json({ doctor: doctorSafe, token });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new AppError(401, 'Not authenticated');
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { doctorId: string };
    const doctor = await prisma.doctor.findUnique({
      where: { id: payload.doctorId },
      select: { id: true, email: true, firstName: true, lastName: true, specialty: true, licenseNo: true },
    });
    if (!doctor) throw new AppError(404, 'Doctor not found');
    res.json({ doctor });
  } catch (err) {
    next(err);
  }
});
