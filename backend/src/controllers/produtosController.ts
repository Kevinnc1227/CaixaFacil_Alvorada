import { Response } from 'express';
import { db } from '../db/db';
import { produtos, ajustesEstoque } from '../db/schema';
import { eq, like, and } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

export const listProdutos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { q, categoria } = req.query;
        const orgId = req.user!.organizacaoId!;

        // Busca apenas produtos da organização do usuário autenticado
        const results = await db.select().from(produtos)
            .where(eq(produtos.organizacaoId, orgId))
            .all();

        let filtered = results;
        if (q) filtered = filtered.filter(p => p.nome.toLowerCase().includes(String(q).toLowerCase()));
        if (categoria && categoria !== 'Todos') filtered = filtered.filter(p => p.categoria === categoria);

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
};

export const createProduto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const { nome, categoria, precoVenda, qtdEstoque, qtdMinima } = req.body;

        const [result] = await db.insert(produtos).values({
            nome, categoria, precoVenda, qtdEstoque, qtdMinima,
            organizacaoId: orgId,
        }).returning();

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
};

export const updateProduto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const orgId = req.user!.organizacaoId!;
        const { nome, categoria, precoVenda, qtdMinima, ativo } = req.body;

        const [result] = await db.update(produtos)
            .set({ nome, categoria, precoVenda, qtdMinima, ativo })
            .where(and(eq(produtos.id, id), eq(produtos.organizacaoId, orgId)))
            .returning();

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
};

export const ajustarEstoque = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const produtoId = Number(req.params.id);
        const orgId = req.user!.organizacaoId!;
        const usuarioId = req.user!.id;
        const { quantidade, tipo, motivo } = req.body;

        if (quantidade <= 0) {
            res.status(400).json({ error: 'A quantidade deve ser maior que zero' });
            return;
        }

        // Garante que o produto pertence à organização
        const produtoAtual = await db.select().from(produtos)
            .where(and(eq(produtos.id, produtoId), eq(produtos.organizacaoId, orgId)))
            .get();

        if (!produtoAtual) {
            res.status(404).json({ error: 'Produto não encontrado' });
            return;
        }

        let novaQtd = produtoAtual.qtdEstoque;
        if (tipo === 'ENTRADA') {
            novaQtd += quantidade;
        } else if (tipo === 'SAIDA') {
            novaQtd = Math.max(0, novaQtd - quantidade);
        } else {
            res.status(400).json({ error: 'Tipo de ajuste inválido (ENTRADA ou SAIDA)' });
            return;
        }

        await db.transaction(async (tx) => {
            await tx.insert(ajustesEstoque).values({
                produtoId, usuarioId, quantidade, tipo, motivo,
                organizacaoId: orgId,
            });
            await tx.update(produtos).set({ qtdEstoque: novaQtd }).where(eq(produtos.id, produtoId));
        });

        res.json({ message: 'Estoque ajustado com sucesso', novoEstoque: novaQtd });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao ajustar estoque' });
    }
};
