import { Router } from 'express';
import { body } from 'express-validator';
import {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
} from '../controllers/topicController';

const router = Router();

// Validation middleware
const topicValidation = [
  body('name').notEmpty().trim().withMessage('Topic name is required'),
  body('description').optional().trim(),
];

// Routes
router.post('/', topicValidation, createTopic);
router.get('/', getAllTopics);
router.get('/:id', getTopicById);
router.put('/:id', topicValidation, updateTopic);
router.delete('/:id', deleteTopic);

export default router;

