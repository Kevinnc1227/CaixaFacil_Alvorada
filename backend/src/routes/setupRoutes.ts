import { Router } from 'express';
import { getSetupInfo, completeSetup } from '../controllers/setupController';

const router = Router();

// Rotas públicas — acessadas via link único enviado ao cliente
router.get('/:token', getSetupInfo);
router.patch('/:token', completeSetup);

export default router;
