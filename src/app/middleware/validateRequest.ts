import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

const validateRequest = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
     console.log(req.body)
     try {
          await schema.parseAsync({
               body: req.body,
               params: req.params,
               query: req.query,
               cookies: req.cookies,
          });
          next();
     } catch (error) {
          next(error);
     }
};

export default validateRequest;
