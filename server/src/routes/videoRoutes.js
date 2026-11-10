import { Router } from 'express';
import {
  summarizeVideo,
  getHistory,
  getVideoById,
  deleteVideo,
} from '../controllers/videoController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// All video routes strictly require user authentication
router.post('/summarize', protect, summarizeVideo);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getVideoById);
router.delete('/:id', protect, deleteVideo);

export default router;
