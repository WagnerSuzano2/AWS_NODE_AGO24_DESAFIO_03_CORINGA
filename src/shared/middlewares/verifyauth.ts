import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import AppError from '../errors/AppError';
import authConfig from '../../config/auth';

interface ITokenPayload {
  iat: number; 
  exp: number; 
  email: string; 
}

interface CustomRequest extends Request {
  user?: {
    email: string; 
  };
}

export const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): void => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new AppError('jwt token is missing', 401); 
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret) as ITokenPayload; 
    
    req.user = {
      email: decoded.email,
    };

    return next();
  } catch {
    throw new AppError('invalid JWT token', 401);
  }
};
