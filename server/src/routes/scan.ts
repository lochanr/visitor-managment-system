import { Router } from 'express';
import { scanQr } from '../controllers/scanController';

const router = Router();
router.post('/', scanQr); // Public — no auth needed
export default router;
