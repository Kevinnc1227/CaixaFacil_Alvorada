import { Request, Response } from 'express';
import { db } from '../db/db';
import { caixas, pedidos, fichas, itensPedido, produtos, reservasCampo } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getRelatorioCaixa = async (req: Request, res: Response): Promise<void> => {
    try {
        const allPedidos = await db.select().from(pedidos).all();
        const allFichas = await db.select().from(fichas).all();
        // Reservas confirmadas ou concluídas contam no faturamento do dia
        const allReservas = await db.select().from(reservasCampo).all();

        const totalVendasApp = allPedidos.filter(p => p.status === 'PAGO').reduce((acc, p) => acc + p.total, 0);
        const fichasPagas = allFichas.filter(f => f.status === 'PAGA');
        const fichasEmAberto = allFichas.filter(f => f.status === 'ABERTA');
        const totalFichasRecebido = fichasPagas.reduce((acc, f) => acc + f.totalAcumulado, 0);

        // Valor de reservas: apenas status CONFIRMADA ou CONCLUIDA
        const reservasAtivas = allReservas.filter(r => r.status === 'CONFIRMADA' || r.status === 'CONCLUIDA');
        const totalReservas = reservasAtivas.reduce((acc, r) => acc + r.valorTotal, 0);

        res.json({
            resumoFinanceiro: {
                totalBrutoDia: totalVendasApp + totalFichasRecebido + totalReservas,
                vendasDiretas: totalVendasApp,
                recebidoFichas: totalFichasRecebido,
                reservasCampo: totalReservas,
                pendenteFichasAbertas: fichasEmAberto.reduce((acc, f) => acc + f.totalAcumulado, 0)
            },
            metricas: {
                qtdPedidos: allPedidos.length,
                qtdFichasEmAberto: fichasEmAberto.length,
                qtdFichasPagas: fichasPagas.length,
                qtdReservasAtivas: reservasAtivas.length,
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
