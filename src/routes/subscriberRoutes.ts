import { Router } from 'express';
import { body } from 'express-validator';
import {
  createSubscriber,
  getAllSubscribers,
  getSubscriberById,
  updateSubscriber,
  subscribeToTopics,
  unsubscribeFromTopics,
  deleteSubscriber,
} from '../controllers/subscriberController';

const router = Router();

// Validation middleware
const subscriberValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').optional().trim(),
  body('topicIds').optional().isArray().withMessage('topicIds must be an array'),
];

const topicIdsValidation = [
  body('topicIds').isArray().withMessage('topicIds must be an array'),
];

// Routes
router.post('/', subscriberValidation, createSubscriber);
router.get('/', getAllSubscribers);
router.get('/:id', getSubscriberById);
router.put('/:id', updateSubscriber);
router.post('/:id/subscribe', topicIdsValidation, subscribeToTopics);
router.post('/:id/unsubscribe', topicIdsValidation, unsubscribeFromTopics);
router.delete('/:id', deleteSubscriber);

export default router;

