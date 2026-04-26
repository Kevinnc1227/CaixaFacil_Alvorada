import { Request, Response } from 'express';
import { db } from '../db/db';
import { caixas, pedidos, fichas, itensPedido, produtos } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getRelatorioCaixa = async (req: Request, res: Response): Promise<void> => {
    try {
        // Para simplificar o MVP, pega pedidos fechados "hoje". 
        // Como n tem timezone, vamos pegar os ultimo x registros ou tudo marcado hoje.
        const allPedidos = await db.select().from(pedidos).all();
        const allFichas = await db.select().from(fichas).all();

        // Aqui fariamos as somas reais
        const totalVendasApp = allPedidos.filter(p => p.status === 'PAGO').reduce((acc, p) => acc + p.total, 0);
        const fichasPagas = allFichas.filter(f => f.status === 'PAGA');
        const fichasEmAberto = allFichas.filter(f => f.status === 'ABERTA');
        const totalFichasRecebido = fichasPagas.reduce((acc, f) => acc + f.totalAcumulado, 0);

        res.json({
            resumoFinanceiro: {
                totalBrutoDia: totalVendasApp + totalFichasRecebido,
                vendasDiretas: totalVendasApp,
                recebidoFichas: totalFichasRecebido,
                pendenteFichasAbertas: fichasEmAberto.reduce((acc, f) => acc + f.totalAcumulado, 0)
            },
            metricas: {
                qtdPedidos: allPedidos.length,
                qtdFichasEmAberto: fichasEmAberto.length,
                qtdFichasPagas: fichasPagas.length
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar relatorio' });
    }
};

export const fecharCaixa = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const usuarioId = req.user!.id;
        const { totalVendas, totalFichas } = req.body;

        const [novoCaixa] = await db.insert(caixas).values({
            totalVendas,
            totalFichas,
            fechadoPor: usuarioId,
            fechadoEm: new Date()
        }).returning();

        res.json(novoCaixa);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fechar caixa' });
    }
};

export const getHistoricoCaixas = async (req: Request, res: Response): Promise<void> => {
    try {
        const historico = await db.select().from(caixas).orderBy(desc(caixas.id));
        res.json(historico);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar historico' });
    }
};
