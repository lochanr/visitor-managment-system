import { Router } from 'express';
import {
  getHosts, createHost, deactivateHost, reactivateHost, resetHostPassword
} from '../controllers/usersController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/hosts',                    authenticateToken, requireRole('OWNER'), getHosts);
router.post('/hosts',                   authenticateToken, requireRole('OWNER'), createHost);
router.patch('/hosts/:id/deactivate',   authenticateToken, requireRole('OWNER'), deactivateHost);
router.patch('/hosts/:id/reactivate',   authenticateToken, requireRole('OWNER'), reactivateHost);
router.patch('/hosts/:id/reset-password', authenticateToken, requireRole('OWNER'), resetHostPassword);

export default router;
