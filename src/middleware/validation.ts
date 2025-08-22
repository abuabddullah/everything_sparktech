import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateChatRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new AppError('Message is required and must be a non-empty string', 400);
  }

  if (message.length > 5000) {
    throw new AppError('Message is too long (maximum 5000 characters)', 400);
  }

  next();
};

export const validateWikiRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new AppError('Query is required and must be a non-empty string', 400);
  }

  if (query.length > 200) {
    throw new AppError('Query is too long (maximum 200 characters)', 400);
  }

  next();
};

export const validateTTSRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new AppError('Text is required and must be a non-empty string', 400);
  }

  if (text.length > 5000) {
    throw new AppError('Text is too long (maximum 5000 characters)', 400);
  }

  next();
};