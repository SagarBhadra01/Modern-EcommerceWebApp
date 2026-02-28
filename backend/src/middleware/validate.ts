import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validates req[target] against a Zod schema.
 * Returns 400 with field-level errors on failure.
 */
export const validate =
  (schema: ZodSchema, target: ValidationTarget = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        error: 'Validation Error',
        message: 'Request validation failed.',
        errors,
      });
      return;
    }

    // Replace raw input with parsed/coerced value
    (req as any)[target] = result.data;
    next();
  };
