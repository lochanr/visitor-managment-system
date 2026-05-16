import { Router } from 'express';
import { login, me, changePassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.post('/login', login);
router.get('/me', authenticateToken, me);
router.post('/change-password', authenticateToken, changePassword);
export default router;
