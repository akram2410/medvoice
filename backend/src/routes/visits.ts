import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateReport } from '../services/reportService';

export const visitsRouter = Router();
visitsRouter.use(requireAuth);
visitsRouter.use(requireRole('ADMIN', 'DOCTOR'));

const CreateVisitSchema = z.object({
  patientId: z.string(),
  rawNote: z.string().min(10, 'Note must be at least 10 characters'),
  audioUrl: z.string().optional(),
});

const UpdateReportSchema = z.object({
  chiefComplaint: z.string(),
  historyOfPresentIllness: z.string(),
  physicalExamination: z.string(),
  assessment: z.string(),
  plan: z.string(),
});

// GET /api/visits  — all visits for doctor's patients
visitsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, patientId } = req.query;
    const visits = await prisma.visit.findMany({
      where: {
        doctorId: req.doctorId,
        ...(status && { status: String(status) as any }),
        ...(patientId && { patientId: String(patientId) }),
      },
      include: { patient: true, report: true },
      orderBy: { date: 'desc' },
    });
    res.json({ visits });
  } catch (err) { next(err); }
});

// POST /api/visits — create visit + generate AI report
visitsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { patientId, rawNote, audioUrl } = CreateVisitSchema.parse(req.body);

    // Create the visit
    const visit = await prisma.visit.create({
      data: { patientId, doctorId: req.doctorId!, rawNote, audioUrl },
    });

    // Generate report via Claude
    const reportData = await generateReport(rawNote);

    // Save report
    const report = await prisma.report.create({
      data: { visitId: visit.id, ...reportData },
    });

    // Audit log
    await prisma.auditLog.create({
      data: { doctorId: req.doctorId!, visitId: visit.id, action: 'VISIT_CREATED' },
    });

    res.status(201).json({ visit, report });
  } catch (err) { next(err); }
});

// PATCH /api/visits/:id/report — update report fields
visitsRouter.patch('/:id/report', async (req: AuthRequest, res, next) => {
  try {
    const visit = await prisma.visit.findUnique({ where: { id: req.params.id } });
    if (!visit) throw new AppError(404, 'Visit not found');
    if (visit.doctorId !== req.doctorId) throw new AppError(403, 'Forbidden');
    if (visit.status === 'SIGNED') throw new AppError(400, 'Signed reports cannot be edited');

    const data = UpdateReportSchema.parse(req.body);
    const report = await prisma.report.update({
      where: { visitId: req.params.id },
      data,
    });

    await prisma.auditLog.create({
      data: { doctorId: req.doctorId!, visitId: visit.id, action: 'REPORT_UPDATED' },
    });

    res.json({ report });
  } catch (err) { next(err); }
});

// DELETE /api/visits/:id — delete a draft visit and its report
visitsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const visit = await prisma.visit.findUnique({ where: { id: req.params.id } });
    if (!visit) throw new AppError(404, 'Visit not found');
    if (visit.doctorId !== req.doctorId) throw new AppError(403, 'Forbidden');
    if (visit.status === 'SIGNED') throw new AppError(400, 'Signed visits cannot be deleted');

    await prisma.auditLog.deleteMany({ where: { visitId: visit.id } });
    await prisma.report.deleteMany({ where: { visitId: visit.id } });
    await prisma.visit.delete({ where: { id: visit.id } });

    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST /api/visits/:id/sign — sign and lock report
visitsRouter.post('/:id/sign', async (req: AuthRequest, res, next) => {
  try {
    const visit = await prisma.visit.findUnique({ where: { id: req.params.id } });
    if (!visit) throw new AppError(404, 'Visit not found');
    if (visit.doctorId !== req.doctorId) throw new AppError(403, 'Forbidden');
    if (visit.status === 'SIGNED') throw new AppError(400, 'Already signed');

    const updated = await prisma.visit.update({
      where: { id: req.params.id },
      data: { status: 'SIGNED', signedAt: new Date() },
      include: { report: true, patient: true },
    });

    await prisma.auditLog.create({
      data: {
        doctorId: req.doctorId!,
        visitId: visit.id,
        action: 'REPORT_SIGNED',
        details: { signedAt: new Date().toISOString() },
        ipAddress: req.ip,
      },
    });

    res.json({ visit: updated });
  } catch (err) { next(err); }
});
