import { NextFunction, Request, Response } from 'express';
import { Schema, ZodError } from 'zod';
const validateRequestZFD =
  (schema: Schema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fullData = {
        ...req.body,
      };
      await schema.parseAsync(fullData);
      next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequestZFD;
