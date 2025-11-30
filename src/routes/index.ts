import { Router } from 'express';
import topicRoutes from './topicRoutes';
import subscriberRoutes from './subscriberRoutes';
import contentRoutes from './contentRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Newsletter Service API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/topics', topicRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/content', contentRoutes);

export default router;

