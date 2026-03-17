import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const patientsRouter = Router();
patientsRouter.use(requireAuth);

const PatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.string(),
  bloodType: z.string().optional(),
  healthCard: z.string().min(1),
  phone: z.string().optional(),
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  emergContact: z.string().optional(),
});

// GET /api/patients
patientsRouter.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    const patients = await prisma.patient.findMany({
      where: search ? {
        OR: [
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
          { conditions: { contains: String(search), mode: 'insensitive' } },
          { healthCard: { contains: String(search), mode: 'insensitive' } },
        ],
      } : undefined,
      include: { _count: { select: { visits: true } } },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    res.json({ patients });
  } catch (err) { next(err); }
});

// GET /api/patients/:id
patientsRouter.get('/:id', async (req, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        visits: {
          include: { report: true },
          orderBy: { date: 'desc' },
        },
      },
    });
    if (!patient) throw new AppError(404, 'Patient not found');
    res.json({ patient });
  } catch (err) { next(err); }
});

// POST /api/patients
patientsRouter.post('/', async (req, res, next) => {
  try {
    const data = PatientSchema.parse(req.body);
    const patient = await prisma.patient.create({
      data: { ...data, dateOfBirth: new Date(data.dateOfBirth) },
    });
    res.status(201).json({ patient });
  } catch (err) { next(err); }
});

// PATCH /api/patients/:id
patientsRouter.patch('/:id', async (req, res, next) => {
  try {
    const data = PatientSchema.partial().parse(req.body);
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: data.dateOfBirth ? { ...data, dateOfBirth: new Date(data.dateOfBirth) } : data,
    });
    res.json({ patient });
  } catch (err) { next(err); }
});
