import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db/db';
import { clientes, fichas, pedidos, usuarios, reservasCampo, itensPedido } from '../db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

export const listClientes = async (req: Request, res: Response): Promise<void> => {
    try {
        const todosClientes = await db.select().from(clientes).orderBy(desc(clientes.id));
        res.json(todosClientes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar clientes' });
    }
};

export const listTodasFichas = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await db.select({
            id: fichas.id,
            clienteId: clientes.id,
            nome: clientes.nomeCompleto,
            cpf: clientes.cpf,
            status: fichas.status,
            totalAcumulado: fichas.totalAcumulado
        }).from(fichas).innerJoin(clientes, eq(fichas.clienteId, clientes.id)).orderBy(desc(fichas.id));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar fichas' });
    }
};

export const createCliente = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { nomeCompleto, cpf, telefone, observacoes } = req.body;

        const [novoCliente] = await db.insert(clientes).values({
            nomeCompleto,
            cpf,
            telefone,
            observacoes
        }).returning();

        const [novaFicha] = await db.insert(fichas).values({
            clienteId: novoCliente.id,
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
        const clienteId = Number(req.params.id);
        const [novaFicha] = await db.insert(fichas).values({
            clienteId,
            status: 'ABERTA',
            totalAcumulado: 0
        }).returning();

        res.status(201).json(novaFicha);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao abrir ficha' });
    }
}

export const getFichasByCliente = async (req: Request, res: Response): Promise<void> => {
    try {
        const clienteId = Number(req.params.id);
        const clienteFichas = await db.select().from(fichas).where(eq(fichas.clienteId, clienteId)).orderBy(desc(fichas.id));
        res.json(clienteFichas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar fichas do cliente' });
    }
};

export const fecharFicha = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const fichaId = Number(req.params.id);
        const { formaPagamento } = req.body;

        const [fichaAtualizada] = await db.update(fichas).set({
            status: 'PAGA',
            formaPagamento,
            fechadaEm: new Date()
        }).where(eq(fichas.id, fichaId)).returning();

        res.json(fichaAtualizada);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fechar ficha' });
    }
};

export const deleteCliente = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const clienteId = Number(req.params.id);
        const { adminEmail, adminPassword } = req.body;

        console.log(`[deleteCliente] Tentando excluir cliente ID: ${clienteId} por admin: ${adminEmail}`);

        if (!adminEmail || !adminPassword) {
            res.status(400).json({ error: 'Credenciais administrativas são necessárias para esta ação' });
            return;
        }

        const admin = await db.select().from(usuarios)
            .where(eq(usuarios.email, adminEmail))
            .get();

        if (!admin) {
            console.warn(`[deleteCliente] Admin não encontrado: ${adminEmail}`);
            res.status(403).json({ error: 'Administrador não encontrado.' });
            return;
        }

        if (admin.perfil !== 'ADMINISTRADOR' || !admin.ativo) {
            console.warn(`[deleteCliente] Usuário ${adminEmail} não tem permissão ou não está ativo.`);
            res.status(403).json({ error: 'Acesso negado. Apenas administradores ativos podem excluir clientes.' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(adminPassword, admin.senhaHash);
        if (!isPasswordValid) {
            console.warn(`[deleteCliente] Senha incorreta para admin: ${adminEmail}`);
            res.status(401).json({ error: 'Senha administrativa incorreta' });
            return;
        }

        db.transaction((tx) => {
            const fichasCliente = tx.select().from(fichas).where(eq(fichas.clienteId, clienteId)).all();
            const fichaIds = fichasCliente.map(f => f.id);

            if (fichaIds.length > 0) {
                const pedidosCliente = tx.select().from(pedidos).where(inArray(pedidos.fichaId, fichaIds)).all();
                const pedidoIds = pedidosCliente.map(p => p.id);

                if (pedidoIds.length > 0) {
                    tx.delete(itensPedido).where(inArray(itensPedido.pedidoId, pedidoIds)).run();
                    tx.delete(pedidos).where(inArray(pedidos.id, pedidoIds)).run();
                }

                tx.delete(fichas).where(eq(fichas.clienteId, clienteId)).run();
            }

            tx.delete(reservasCampo).where(eq(reservasCampo.clienteId, clienteId)).run();
            tx.delete(clientes).where(eq(clientes.id, clienteId)).run();
        });

        console.log(`[deleteCliente] Cliente ${clienteId} excluído com sucesso.`);
        res.json({ message: 'Cliente e todos os seus registros foram excluídos com sucesso' });
    } catch (error) {
        console.error('[deleteCliente] Erro fatal ao excluir cliente:', error);
        res.status(500).json({ error: 'Erro interno ao processar a exclusão.' });
    }
};
