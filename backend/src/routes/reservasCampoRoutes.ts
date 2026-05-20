import { Router } from 'express';
import { listReservas, createReserva, updateStatusReserva, updateReservaHorario } from '../controllers/reservasCampoController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate); // Todas as rotas requerem autenticação

router.get('/', listReservas);
router.post('/', createReserva);
router.patch('/:id/status', updateStatusReserva);
router.patch('/:id', updateReservaHorario);

export default router;
