import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes';
import produtosRoutes from './routes/produtosRoutes';
import pedidosRoutes from './routes/pedidosRoutes';
import fichasRoutes from './routes/fichasRoutes';
import caixasRoutes from './routes/caixasRoutes';
import ticketsRoutes from './routes/ticketsRoutes';
import usuariosRoutes from './routes/usuariosRoutes';
import leadsRoutes from './routes/leadsRoutes';
import adminRoutes from './routes/adminRoutes';
import setupRoutes from './routes/setupRoutes';
import reservasCampoRoutes from './routes/reservasCampoRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);

// ─── Public ───────────────────────────────────────────────────────────────────
app.use('/api/leads', leadsRoutes);
app.use('/api/setup', setupRoutes);

// ─── Super Admin ──────────────────────────────────────────────────────────────
app.use('/api/admin', adminRoutes);

// ─── Tenant-scoped (autenticado + organizacaoId no JWT) ───────────────────────
app.use('/api/produtos', produtosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/clientes', fichasRoutes);
app.use('/api/fichas', fichasRoutes);
app.use('/api/caixa', caixasRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas-campo', reservasCampoRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'K-HUB API v2.0 — Multi-Tenant' });
});

app.listen(port, () => {
    console.log(`[K-HUB server]: Running at http://localhost:${port}`);
});
