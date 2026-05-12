import { Router } from 'express';
import {
    listOrganizacoes, createOrganizacao, updateOrganizacao, resetSetupToken,
    listUsuariosByOrg, createUsuarioForOrg,
} from '../controllers/adminController';
import { authenticate, requireSuperAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas /api/admin requerem SUPERADMIN
router.use(authenticate, requireSuperAdmin);

// Organizações
router.get('/organizacoes', listOrganizacoes);
router.post('/organizacoes', createOrganizacao);
router.patch('/organizacoes/:id', updateOrganizacao);
router.post('/organizacoes/:id/reset-setup', resetSetupToken);

// Usuários por organização
router.get('/organizacoes/:id/usuarios', listUsuariosByOrg);
router.post('/organizacoes/:id/usuarios', createUsuarioForOrg);

export default router;
