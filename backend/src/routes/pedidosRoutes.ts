import { Router } from 'express';
import { createPedido, listUltimosPedidos } from '../controllers/pedidosController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Operadores e Admins podem registrar pedidos (PDV)
router.post('/', authenticate, createPedido);

// Apenas Admin pode listar histórico completo para painéis simples
router.get('/', authenticate, requireRole(['ADMINISTRADOR']), listUltimosPedidos);

export default router;
