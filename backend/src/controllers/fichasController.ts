import { Response } from 'express';
import { db } from '../db/db';
import { clientes, fichas } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

export const listClientes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const todosClientes = await db.select().from(clientes)
            .where(eq(clientes.organizacaoId, orgId))
            .orderBy(desc(clientes.id));
        res.json(todosClientes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar clientes' });
    }
};

export const listTodasFichas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const result = await db.select({
            id: fichas.id,
            clienteId: clientes.id,
            nome: clientes.nomeCompleto,
            cpf: clientes.cpf,
            status: fichas.status,
            totalAcumulado: fichas.totalAcumulado
        }).from(fichas)
            .innerJoin(clientes, eq(fichas.clienteId, clientes.id))
            .where(eq(fichas.organizacaoId, orgId))
            .orderBy(desc(fichas.id));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar fichas' });
    }
};

export const createCliente = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const { nomeCompleto, cpf, telefone, observacoes } = req.body;

        const [novoCliente] = await db.insert(clientes).values({
            nomeCompleto, cpf, telefone, observacoes,
            organizacaoId: orgId,
        }).returning();

        // Abre ficha automaticamente junto com o cadastro do cliente
        const [novaFicha] = await db.insert(fichas).values({
            clienteId: novoCliente.id,
            organizacaoId: orgId,
            status: 'ABERTA',
            totalAcumulado: 0
        }).returning();

        res.status(201).json({ cliente: novoCliente, ficha: novaFicha });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar cliente' });
    }
};

export const createFicha = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const clienteId = Number(req.params.id);

        const [novaFicha] = await db.insert(fichas).values({
            clienteId,
            organizacaoId: orgId,
            status: 'ABERTA',
            totalAcumulado: 0
        }).returning();

        res.status(201).json(novaFicha);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao abrir ficha' });
    }
};

export const getFichasByCliente = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const clienteId = Number(req.params.id);
        const clienteFichas = await db.select().from(fichas)
            .where(and(eq(fichas.clienteId, clienteId), eq(fichas.organizacaoId, orgId)))
            .orderBy(desc(fichas.id));
        res.json(clienteFichas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar fichas do cliente' });
    }
};

export const fecharFicha = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const fichaId = Number(req.params.id);
        const { formaPagamento } = req.body;

        const [fichaAtualizada] = await db.update(fichas).set({
            status: 'PAGA',
            formaPagamento,
            fechadaEm: new Date()
        }).where(and(eq(fichas.id, fichaId), eq(fichas.organizacaoId, orgId)))
            .returning();

        res.json(fichaAtualizada);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fechar ficha' });
    }
};
