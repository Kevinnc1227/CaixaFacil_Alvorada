import { Router } from 'express';
import { getRelatorioCaixa, fecharCaixa, getHistoricoCaixas } from '../controllers/caixasController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Apenas o ADMINISTRADOR gere o fechamento
router.get('/relatorio', authenticate, requireRole(['ADMINISTRADOR']), getRelatorioCaixa);
router.post('/fechar', authenticate, requireRole(['ADMINISTRADOR']), fecharCaixa);
router.get('/historico', authenticate, requireRole(['ADMINISTRADOR']), getHistoricoCaixas);

export default router;
