import { Router } from 'express';
import { listProdutos, createProduto, updateProduto, deleteProduto, ajustarEstoque } from '../controllers/produtosController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Todos autênticados podem listar (PDV)
router.get('/', authenticate, listProdutos);

// Apenas ADMIN pode criar, atualizar, excluir e ajustar estoque
router.post('/', authenticate, requireRole(['ADMINISTRADOR']), createProduto);
router.put('/:id', authenticate, requireRole(['ADMINISTRADOR']), updateProduto);
router.delete('/:id', authenticate, requireRole(['ADMINISTRADOR']), deleteProduto);
router.post('/:id/estoque', authenticate, requireRole(['ADMINISTRADOR']), ajustarEstoque);

export default router;
