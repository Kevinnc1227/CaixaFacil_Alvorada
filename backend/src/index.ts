import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import produtosRoutes from './routes/produtosRoutes';
import pedidosRoutes from './routes/pedidosRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/pedidos', pedidosRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'CaixaFacil Alvorada API' });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
