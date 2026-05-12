import { Response } from 'express';
import { db } from '../db/db';
import { caixas, pedidos, fichas } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getRelatorioCaixa = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;

        const allPedidos = await db.select().from(pedidos).where(eq(pedidos.organizacaoId, orgId)).all();
        const allFichas  = await db.select().from(fichas).where(eq(fichas.organizacaoId, orgId)).all();

        const totalVendasApp = allPedidos.filter(p => p.status === 'PAGO').reduce((acc, p) => acc + p.total, 0);
        const fichasPagas     = allFichas.filter(f => f.status === 'PAGA');
        const fichasEmAberto  = allFichas.filter(f => f.status === 'ABERTA');
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
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
};

export const fecharCaixa = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId    = req.user!.organizacaoId!;
        const usuarioId = req.user!.id;
        const { totalVendas, totalFichas } = req.body;

        const [novoCaixa] = await db.insert(caixas).values({
            totalVendas, totalFichas,
            organizacaoId: orgId,
            fechadoPor: usuarioId,
            fechadoEm: new Date()
        }).returning();

        res.json(novoCaixa);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fechar caixa' });
    }
};

export const getHistoricoCaixas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const historico = await db.select().from(caixas)
            .where(eq(caixas.organizacaoId, orgId))
            .orderBy(desc(caixas.id));
        res.json(historico);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
};
