import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  doctorId?: string;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next(new AppError(401, 'Authentication required'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { doctorId: string };
    req.doctorId = payload.doctorId;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
