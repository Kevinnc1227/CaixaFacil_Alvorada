import { Response } from 'express';
import { db } from '../db/db';
import { pedidos, itensPedido, produtos, fichas } from '../db/schema';
import { AuthRequest } from '../middlewares/authMiddleware';
import { eq, desc, and } from 'drizzle-orm';

export const createPedido = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const usuarioId = req.user!.id;
        const orgId = req.user!.organizacaoId!;
        const { tipo, fichaId, itens, total } = req.body;

        if (!itens || itens.length === 0) {
            res.status(400).json({ error: 'Pedido vazio' });
            return;
        }

        await db.transaction(async (tx) => {
            const [novoPedido] = await tx.insert(pedidos).values({
                usuarioId,
                organizacaoId: orgId,
                tipo,
                status: tipo === 'PAGAR_AGORA' ? 'PAGO' : 'LANCADO_FICHA',
                total,
                fichaId: tipo === 'LANCAR_FICHA' ? fichaId : null
            }).returning();

            for (const item of itens) {
                await tx.insert(itensPedido).values({
                    pedidoId: novoPedido.id,
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    precoUnitario: item.precoUnitario
                });

                // Decrementa estoque apenas de produto da mesma org (segurança)
                const produtoDb = await tx.select().from(produtos)
                    .where(and(eq(produtos.id, item.produtoId), eq(produtos.organizacaoId, orgId)))
                    .get();

                if (produtoDb) {
                    const newQtd = Math.max(0, produtoDb.qtdEstoque - item.quantidade);
                    await tx.update(produtos).set({ qtdEstoque: newQtd }).where(eq(produtos.id, produtoDb.id));
                }
            }

            if (tipo === 'LANCAR_FICHA' && fichaId) {
                const fichaDb = await tx.select().from(fichas)
                    .where(and(eq(fichas.id, fichaId), eq(fichas.organizacaoId, orgId)))
                    .get();
                if (fichaDb) {
                    await tx.update(fichas)
                        .set({ totalAcumulado: fichaDb.totalAcumulado + total })
                        .where(eq(fichas.id, fichaId));
                }
            }
        });

        res.status(201).json({ message: 'Pedido registrado com sucesso' });
    } catch (error) {
        console.error('Erro ao registrar pedido:', error);
        res.status(500).json({ error: 'Erro ao registrar pedido' });
    }
};

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
