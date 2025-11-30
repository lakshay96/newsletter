import { Router } from 'express';
import { body } from 'express-validator';
import {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
  getContentStats,
} from '../controllers/contentController';

const router = Router();

// Validation middleware
const contentValidation = [
  body('topicId').notEmpty().withMessage('Topic ID is required'),
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('body').notEmpty().trim().withMessage('Body is required'),
  body('scheduledTime').isISO8601().withMessage('Valid scheduled time is required (ISO 8601 format)'),
];

// Routes
router.post('/', contentValidation, createContent);
router.get('/', getAllContent);
router.get('/stats', getContentStats);
router.get('/:id', getContentById);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router;

