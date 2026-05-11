import { Router } from 'express';
import { login, verifyAdminCredentials } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/verify-admin', verifyAdminCredentials);

export default router;
