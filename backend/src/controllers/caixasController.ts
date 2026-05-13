import { Request, Response } from 'express';
import { db } from '../db/db';
import { caixas, pedidos, fichas, itensPedido, produtos, reservasCampo } from '../db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

// ─── Helper: calcula o custo total dos itens vendidos em pedidos PAGOS ────────
async function calcularCustoVendas(): Promise<{ custoTotal: number; detalhesPorProduto: Record<string, { qtd: number; custo: number; receita: number }> }> {
    // Buscar todos os pedidos pagos
    const pedidosPagos = await db.select().from(pedidos).where(eq(pedidos.status, 'PAGO')).all();
    if (pedidosPagos.length === 0) return { custoTotal: 0, detalhesPorProduto: {} };

    const pedidoIds = pedidosPagos.map(p => p.id);

    // Buscar itens desses pedidos
    const itens = await db.select().from(itensPedido)
        .where(inArray(itensPedido.pedidoId, pedidoIds))
        .all();

    if (itens.length === 0) return { custoTotal: 0, detalhesPorProduto: {} };

    // Buscar produtos para pegar o precoCusto
    const produtoIds = [...new Set(itens.map(i => i.produtoId))];
    const produtosData = await db.select().from(produtos)
        .where(inArray(produtos.id, produtoIds))
        .all();

    const produtoMap = new Map(produtosData.map(p => [p.id, p]));
    const detalhesPorProduto: Record<string, { qtd: number; custo: number; receita: number }> = {};
    let custoTotal = 0;

    for (const item of itens) {
        const prod = produtoMap.get(item.produtoId);
        if (!prod) continue;

        const custoItem = (prod.precoCusto ?? 0) * item.quantidade;
        const receitaItem = item.precoUnitario * item.quantidade;
        custoTotal += custoItem;

        const key = prod.nome;
        if (!detalhesPorProduto[key]) {
            detalhesPorProduto[key] = { qtd: 0, custo: 0, receita: 0 };
        }
        detalhesPorProduto[key].qtd += item.quantidade;
        detalhesPorProduto[key].custo += custoItem;
        detalhesPorProduto[key].receita += receitaItem;
    }

    return { custoTotal, detalhesPorProduto };
}

// ─── GET /caixa/relatorio ─────────────────────────────────────────────────────
export const getRelatorioCaixa = async (req: Request, res: Response): Promise<void> => {
    try {
        const allPedidos = await db.select().from(pedidos).all();
        const allFichas = await db.select().from(fichas).all();
        const allReservas = await db.select().from(reservasCampo).all();

        const pedidosPagos = allPedidos.filter(p => p.status === 'PAGO');
        const totalVendasApp = pedidosPagos.reduce((acc, p) => acc + p.total, 0);

        const fichasPagas = allFichas.filter(f => f.status === 'PAGA');
        const fichasEmAberto = allFichas.filter(f => f.status === 'ABERTA');
        const totalFichasRecebido = fichasPagas.reduce((acc, f) => acc + f.totalAcumulado, 0);

        const reservasAtivas = allReservas.filter(r => r.status === 'CONFIRMADA' || r.status === 'CONCLUIDA');
        const totalReservas = reservasAtivas.reduce((acc, r) => acc + r.valorTotal, 0);

        const totalBrutoDia = totalVendasApp + totalFichasRecebido + totalReservas;

        // Calcular custo e lucro
        const { custoTotal, detalhesPorProduto } = await calcularCustoVendas();

        // Lucro bruto = receita das vendas diretas - custo dos produtos
        // Lucro líquido considera fichas e reservas também (sem custo calculável)
        const lucroBruto = totalVendasApp - custoTotal;
        const lucroLiquido = totalBrutoDia - custoTotal;

        res.json({
            resumoFinanceiro: {
                totalBrutoDia,
                vendasDiretas: totalVendasApp,
                recebidoFichas: totalFichasRecebido,
                reservasCampo: totalReservas,
                pendenteFichasAbertas: fichasEmAberto.reduce((acc, f) => acc + f.totalAcumulado, 0),
                custoTotalProdutos: custoTotal,
                lucroBruto,
                lucroLiquido,
            },
            metricas: {
                qtdPedidos: pedidosPagos.length,
                qtdFichasEmAberto: fichasEmAberto.length,
                qtdFichasPagas: fichasPagas.length,
                qtdReservasAtivas: reservasAtivas.length,
                qtdItensVendidos: Object.values(detalhesPorProduto).reduce((acc, d) => acc + d.qtd, 0),
            },
            detalhesProdutos: detalhesPorProduto
        });

    } catch (error) {
        console.error('Erro ao gerar relatorio:', error);
        res.status(500).json({ error: 'Erro ao gerar relatorio' });
    }
};

// ─── POST /caixa/fechar ───────────────────────────────────────────────────────
export const fecharCaixa = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const usuarioId = req.user!.id;
        const { totalVendas, totalFichas, totalReservas, totalBruto, totalCusto, lucroLiquido } = req.body;

        const [novoCaixa] = await db.insert(caixas).values({
            organizacaoId: req.user!.organizacaoId!,
            totalVendas: totalVendas ?? 0,
            totalFichas: totalFichas ?? 0,
            totalReservas: totalReservas ?? 0,
            totalBruto: totalBruto ?? 0,
            totalCusto: totalCusto ?? 0,
            lucroLiquido: lucroLiquido ?? 0,
            fechadoPor: usuarioId,
            fechadoEm: new Date()
        }).returning();

        res.json(novoCaixa);
    } catch (error) {
        console.error('Erro ao fechar caixa:', error);
        res.status(500).json({ error: 'Erro ao fechar caixa' });
    }
};

// ─── GET /caixa/historico ─────────────────────────────────────────────────────
export const getHistoricoCaixas = async (req: Request, res: Response): Promise<void> => {
    try {
        const historico = await db.select().from(caixas).orderBy(desc(caixas.id));
        res.json(historico);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar historico' });
    }
};
