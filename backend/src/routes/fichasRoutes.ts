import { Router } from 'express';
import { listClientes, createCliente, getFichasByCliente, fecharFicha, createFicha } from '../controllers/fichasController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Todos autenticados gerenciam fichas
router.get('/', authenticate, listClientes);
router.post('/', authenticate, createCliente);
router.get('/:id/fichas', authenticate, getFichasByCliente);
router.post('/:id/fichas', authenticate, createFicha); // Abre nova ficha pro cliente

// Apenas admin/suporte pode dar 'baixa' (receber dinheiro final e fechar a ficha) - Mudar se Operador tiver permissão de fechar conta
router.post('/fichas/:id/fechar', authenticate, requireRole(['ADMINISTRADOR']), fecharFicha);

export default router;
