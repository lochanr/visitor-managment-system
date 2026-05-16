import { Router } from 'express';
import {
  createVisit, getVisits, getVisitById,
  approveVisit, rejectVisit, recoverPass,
  getVisitStatus, getVisitPass
} from '../controllers/visitController';
import { getVisitorByPhone } from '../controllers/visitorController';
import { getHosts } from '../controllers/hostsController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public
router.get('/visitors/phone/:phone', getVisitorByPhone);
router.get('/hosts', getHosts);
router.get('/recover/:phone', recoverPass);
router.get('/status/:id', getVisitStatus);
router.get('/pass/:visitId', getVisitPass);   // ← new, public
router.post('/', createVisit);

// Protected
router.get('/', authenticateToken, requireRole('OWNER', 'HOST'), getVisits);
router.get('/:visitId', authenticateToken, requireRole('OWNER', 'HOST'), getVisitById);
router.patch('/:id/approve', authenticateToken, requireRole('OWNER', 'HOST'), approveVisit);
router.patch('/:id/reject', authenticateToken, requireRole('OWNER', 'HOST'), rejectVisit);

export default router;
