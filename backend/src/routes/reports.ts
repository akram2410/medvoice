import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

export const reportsRouter = Router();
reportsRouter.use(requireAuth);
reportsRouter.use(requireRole('ADMIN', 'DOCTOR'));

// GET /api/reports — all reports for this doctor
reportsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, search } = req.query;
    const visits = await prisma.visit.findMany({
      where: {
        doctorId: req.doctorId,
        ...(status && { status: String(status) as any }),
        report: search ? {
          OR: [
            { diagnosis: { contains: String(search), mode: 'insensitive' } },
            { assessment: { contains: String(search), mode: 'insensitive' } },
          ],
        } : undefined,
      },
      include: { patient: true, report: true },
      orderBy: { date: 'desc' },
    });
    res.json({ reports: visits });
  } catch (err) { next(err); }
});
