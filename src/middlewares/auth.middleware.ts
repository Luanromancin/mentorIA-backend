import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  // Supondo que a autenticação foi bem-sucedida
  // Usando type assertion para contornar o problema de tipos
  (req as any).user = { id: 'user-id', name: 'User Name' };
  next();
};
