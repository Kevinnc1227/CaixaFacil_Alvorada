import { Router } from 'express';
import { listProdutos, createProduto, updateProduto, ajustarEstoque } from '../controllers/produtosController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Todos autênticados podem listar (PDV)
router.get('/', authenticate, listProdutos);

// Apenas ADMIN pode criar, atualizar e ajustar estoque
router.post('/', authenticate, requireRole(['ADMINISTRADOR']), createProduto);
router.put('/:id', authenticate, requireRole(['ADMINISTRADOR']), updateProduto);
router.post('/:id/estoque', authenticate, requireRole(['ADMINISTRADOR']), ajustarEstoque);

export default router;
