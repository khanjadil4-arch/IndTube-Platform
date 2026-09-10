import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan('dev'));

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`IndTube API running on port ${config.port}`);
});

export default app;
