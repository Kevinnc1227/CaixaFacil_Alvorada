import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import produtosRoutes from './routes/produtosRoutes';
import pedidosRoutes from './routes/pedidosRoutes';
import fichasRoutes from './routes/fichasRoutes';
import caixasRoutes from './routes/caixasRoutes';
import ticketsRoutes from './routes/ticketsRoutes';
import usuariosRoutes from './routes/usuariosRoutes';
import reservasCampoRoutes from './routes/reservasCampoRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/clientes', fichasRoutes); // fichasRoutes cuida de /api/clientes também para listagem
app.use('/api/fichas', fichasRoutes); // Alias
app.use('/api/caixa', caixasRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas-campo', reservasCampoRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'CaixaFacil Alvorada API - Todos Módulos Ativos' });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
