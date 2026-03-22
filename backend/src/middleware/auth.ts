import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  doctorId?: string;
  role?: Role;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next(new AppError(401, 'Authentication required'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { doctorId: string; role: Role };
    req.doctorId = payload.doctorId;
    req.role = payload.role;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
}
