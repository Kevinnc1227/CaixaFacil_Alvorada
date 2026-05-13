import { Router } from 'express';
import { createLead, listLeads, updateLeadStatus } from '../controllers/leadsController';
import { authenticate, requireSuperAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Rota pública — qualquer visitante pode enviar uma solicitação
router.post('/', createLead);

// Rotas protegidas — apenas SUPERADMIN
router.get('/', authenticate, requireSuperAdmin, listLeads);
router.patch('/:id', authenticate, requireSuperAdmin, updateLeadStatus);

export default router;
