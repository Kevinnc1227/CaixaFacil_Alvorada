import { Response } from 'express';
import { db } from '../db/db.js';
import { pedidos, itensPedido, produtos, fichas } from '../db/schema.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { eq, desc } from 'drizzle-orm';

// Eu registro um pedido de forma transacional: crio o pedido, insiro os itens,
// decremento o estoque e, se for ficha, atualizo o total acumulado — tudo ou nada.
export const createPedido = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const usuarioId = req.user!.id;
        const orgId = req.user!.organizacaoId!;
        const { tipo, fichaId, itens, total } = req.body;

        if (!itens || itens.length === 0) {
            res.status(400).json({ error: 'Pedido vazio' });
            return;
        }

        db.transaction((tx) => {
            // 1. Eu crio o pedido com organizacaoId para garantir o isolamento multi-tenant
            const novoPedido = tx.insert(pedidos).values({
                organizacaoId: orgId,
                usuarioId,
                tipo,
                status: tipo === 'PAGAR_AGORA' ? 'PAGO' : 'LANCADO_FICHA',
                total,
                fichaId: tipo === 'LANCAR_FICHA' ? fichaId : null
            }).returning().get();

            // 2. Eu insiro cada item e já decremento o estoque no mesmo passo
            for (const item of itens) {
                tx.insert(itensPedido).values({
                    pedidoId: novoPedido.id,
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    precoUnitario: item.precoUnitario
                }).run();

                const produtoDb = tx.select().from(produtos).where(eq(produtos.id, item.produtoId)).get();
                if (produtoDb) {
                    const newQtd = Math.max(0, produtoDb.qtdEstoque - item.quantidade);
                    tx.update(produtos).set({ qtdEstoque: newQtd }).where(eq(produtos.id, produtoDb.id)).run();
                }
            }

            // 3. Eu acumulo o valor na ficha se for lançamento no crédito
            if (tipo === 'LANCAR_FICHA' && fichaId) {
                const fichaDb = tx.select().from(fichas).where(eq(fichas.id, fichaId)).get();
                if (fichaDb) {
                    tx.update(fichas).set({ totalAcumulado: fichaDb.totalAcumulado + total })
                        .where(eq(fichas.id, fichaId)).run();
                }
            }
        });

        res.status(201).json({ message: 'Pedido registrado com sucesso' });
    } catch (error) {
        console.error('Erro ao registrar pedido:', error);
        res.status(500).json({ error: 'Erro ao registrar pedido' });
    }
};

// Eu retorno os últimos 50 pedidos da organização para a tela de relatório.
// Limitar a 50 é suficiente para o dashboard — quem precisar de mais usa os filtros de caixa.
export const listUltimosPedidos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const results = await db.select().from(pedidos)
            .where(eq(pedidos.organizacaoId, orgId))
            .limit(50)
            .orderBy(desc(pedidos.id));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar pedidos' });
    }
};
