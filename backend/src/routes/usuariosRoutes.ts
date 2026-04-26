import { Router } from 'express';
import { listUsuarios, createUsuario, updateUsuario } from '../controllers/usuariosController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Apenas Administradores gerenciam usuários
router.use(authenticate, requireRole(['ADMINISTRADOR']));

router.get('/', listUsuarios);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);

export default router;
