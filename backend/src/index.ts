import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import shortRoutes from './routes/shortRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import watchHistoryRoutes from './routes/watchHistoryRoutes.js';
import savedVideoRoutes from './routes/savedVideoRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import creatorRoutes from './routes/creatorRoutes.js';
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
app.use('/api/users', userRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/shorts', shortRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/watch-history', watchHistoryRoutes);
app.use('/api/saved-videos', savedVideoRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/creator', creatorRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`IndTube API running on port ${config.port}`);
});

export default app;
