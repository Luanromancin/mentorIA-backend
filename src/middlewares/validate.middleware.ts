import { Request, Response, NextFunction } from 'express';
import { validate as classValidate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

export const validate = (dtoClass: any) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const dtoObject = plainToClass(dtoClass, req.body);
    const errors: ValidationError[] = await classValidate(dtoObject);

    if (errors.length > 0) {
      const errorMessages: string[] = errors
        .map((error: ValidationError) => {
          if (error.constraints) {
            return Object.values(error.constraints);
          }
          return [];
        })
        .flat();

      res.status(400).json({
        message: 'Erro de validação',
        errors: errorMessages,
      });
      return;
    }

    req.body = dtoObject;
    return next();
  };
};
