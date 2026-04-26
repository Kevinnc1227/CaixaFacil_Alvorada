import { Router } from 'express';
import { listTickets, createTicket, getTicketMessages, addMessageToTicket, fecharTicket } from '../controllers/ticketsController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate); // Todo ticket precisa de auth

router.get('/', listTickets);
router.post('/', createTicket);
router.get('/:id/mensagens', getTicketMessages);
router.post('/:id/mensagens', addMessageToTicket);
router.post('/:id/fechar', fecharTicket);

export default router;
