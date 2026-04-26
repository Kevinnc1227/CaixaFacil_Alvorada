import { Request, Response } from 'express';
import { db } from '../db/db';
import { pedidos, itensPedido, produtos, caixas, fichas } from '../db/schema';
import { AuthRequest } from '../middlewares/authMiddleware';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export const createPedido = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const usuarioId = req.user!.id;
        const { tipo, fichaId, itens, total } = req.body;
        // itens = [{ produtoId, quantidade, precoUnitario }]

        if (!itens || itens.length === 0) {
            res.status(400).json({ error: 'Pedido vazio' });
            return;
        }

        // Verificar caixa aberto do dia? 
        // Regra: Não se fecha o caixa no meio do dia, apenas no final.

        await db.transaction(async (tx) => {
            // 1. Criar pedido
            const [novoPedido] = await tx.insert(pedidos).values({
                usuarioId,
                tipo,
                status: tipo === 'PAGAR_AGORA' ? 'PAGO' : 'LANCADO_FICHA',
                total,
                fichaId: tipo === 'LANCAR_FICHA' ? fichaId : null
            }).returning();

            // 2. Inserir itens e decrementar estoque
            for (const item of itens) {
                await tx.insert(itensPedido).values({
                    pedidoId: novoPedido.id,
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    precoUnitario: item.precoUnitario
                });

                // Decrementar estoque do produto
                const produtoDb = await tx.select().from(produtos).where(eq(produtos.id, item.produtoId)).get();
                if (produtoDb) {
                    const newQtd = Math.max(0, produtoDb.qtdEstoque - item.quantidade);
                    await tx.update(produtos).set({ qtdEstoque: newQtd }).where(eq(produtos.id, produtoDb.id));
                }
            }

            // 3. Se for na ficha, acumular valor
            if (tipo === 'LANCAR_FICHA' && fichaId) {
                const fichaDb = await tx.select().from(fichas).where(eq(fichas.id, fichaId)).get();
                if (fichaDb) {
                    await tx.update(fichas).set({ totalAcumulado: fichaDb.totalAcumulado + total }).where(eq(fichas.id, fichaId));
                }
            }
        });

        res.status(201).json({ message: 'Pedido registrado com sucesso' });
    } catch (error) {
        console.error('Erro ao registrar pedido:', error);
        res.status(500).json({ error: 'Erro ao registrar pedido' });
    }
};

export const listUltimosPedidos = async (req: Request, res: Response): Promise<void> => {
    try {
        // Apenas pedidos recentes para exibir na tela do relatorio
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Simplificando o fetch para MVP
        const results = await db.select().from(pedidos)
            .limit(50)
            .orderBy(desc(pedidos.id));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar pedidos' });
    }
};
