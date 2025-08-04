import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  // Usando o ID real do usuário que tem competências no banco
  (req as any).user = { 
    id: '9da00b0d-d2f7-4589-9321-8179553f2b47', 
    name: 'Gabriela Lima' 
  };
  next();
};
