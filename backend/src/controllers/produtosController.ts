import { Request, Response } from 'express';
import { db } from '../db/db';
import { produtos, ajustesEstoque } from '../db/schema';
import { eq, like, or } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

export const listProdutos = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, categoria } = req.query;

        let query = db.select().from(produtos);

        // Simple filters
        if (q) {
            query.where(like(produtos.nome, `%${String(q)}%`));
        }

        const results = await query.all();

        // Em memória para simplificar os filtros combinados (MVP)
        let filtered = results;
        if (categoria && categoria !== 'Todos') {
            filtered = filtered.filter(p => p.categoria === categoria);
        }

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
};

export const createProduto = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nome, categoria, precoVenda, qtdEstoque, qtdMinima } = req.body;

        const result = await db.insert(produtos).values({
            nome,
            categoria,
            precoVenda,
            qtdEstoque,
            qtdMinima,
        }).returning();

        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
};

export const updateProduto = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const { nome, categoria, precoVenda, qtdMinima, ativo } = req.body;

        const result = await db.update(produtos)
            .set({ nome, categoria, precoVenda, qtdMinima, ativo })
            .where(eq(produtos.id, id))
            .returning();

        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
};

export const ajustarEstoque = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const produtoId = Number(req.params.id);
        const { quantidade, tipo, motivo } = req.body;
        const usuarioId = req.user!.id; // Authenticated user

        if (quantidade <= 0) {
            res.status(400).json({ error: 'A quantidade deve ser maior que zero' });
            return;
        }

        const produtoAtual = await db.select().from(produtos).where(eq(produtos.id, produtoId)).get();

        if (!produtoAtual) {
            res.status(404).json({ error: 'Produto não encontrado' });
            return;
        }

        let novaQtd = produtoAtual.qtdEstoque;

        if (tipo === 'ENTRADA') {
            novaQtd += quantidade;
        } else if (tipo === 'SAIDA') {
            novaQtd -= quantidade;
            if (novaQtd < 0) novaQtd = 0;
        } else {
            res.status(400).json({ error: 'Tipo de ajuste inválido (ENTRADA ou SAIDA)' });
            return;
        }

        await db.transaction(async (tx) => {
            // Registrar log de auditoria
            await tx.insert(ajustesEstoque).values({
                produtoId,
                usuarioId,
                quantidade,
                tipo,
                motivo
            });

            // Atualizar no produto real
            await tx.update(produtos).set({ qtdEstoque: novaQtd }).where(eq(produtos.id, produtoId));
        });

        res.json({ message: 'Estoque ajustado com sucesso', novoEstoque: novaQtd });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao ajustar estoque' });
    }
};
