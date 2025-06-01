import cors from 'cors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import webhookHandler from './helpers/webhookHandler';
import path from 'path';

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Webhook endpoint with raw body parser - MUST be first
app.post('/api/v1/stripe/webhook', express.raw({type: 'application/json'}), webhookHandler);

// Apply middleware to all other routes
app.use(cors());
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use(express.static('uploads'));

// Main router
app.use('/api/v1', router);

// Live response
app.get('/', (req: Request, res: Response) => {
  const date = new Date(Date.now());
  res.send(
    `<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
    `
  );
});

// Global error handler
app.use(globalErrorHandler);

// Handle not found route
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;