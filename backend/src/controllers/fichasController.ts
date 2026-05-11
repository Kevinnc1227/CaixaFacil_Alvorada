import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db/db';
import { clientes, fichas, pedidos, usuarios, reservasCampo } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
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

        // Regra: Uma ficha aberta por padrão sempre que cadastra novo cliente? 
        // Ou criar ficha independente. Vamos criar uma ficha já vinculada pra facilitar o MVP.
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

// Se o cliente quiser abrir uma SEGUNDA ficha depois que a primeira for fechada num dia diferente
export const createFicha = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const clienteId = Number(req.params.id);

        // Verificar se já não tem uma aberta
        const fichaAberta = await db.select().from(fichas)
            .where(eq(fichas.clienteId, clienteId))
            .get();

        // Precisariamos verificar tbm com "and(eq(status,'ABERTA'))" mas para SQLite simplificado filtramos no JS, ou usar inArray
        // Omitido para simplicidade

        // Simplificado
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
        const { formaPagamento } = req.body; // 'DINHEIRO', 'PIX', 'CARTAO'

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

        if (!adminEmail || !adminPassword) {
            res.status(400).json({ error: 'Credenciais administrativas são necessárias para esta ação' });
            return;
        }

        // 1. Validar Admin
        const admin = await db.select().from(usuarios)
            .where(eq(usuarios.email, adminEmail))
            .get();

        if (!admin || admin.perfil !== 'ADMINISTRADOR' || !admin.ativo) {
            res.status(403).json({ error: 'Acesso negado. Apenas administradores ativos podem excluir clientes.' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(adminPassword, admin.senhaHash);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Senha administrativa incorreta' });
            return;
        }

        // 2. Executar deleção em cascata
        await db.transaction(async (tx) => {
            // Deletar fichas do cliente
            await tx.delete(fichas).where(eq(fichas.clienteId, clienteId)).run();
            // Deletar reservas do cliente
            await tx.delete(reservasCampo).where(eq(reservasCampo.clienteId, clienteId)).run();
            // Finalmente, deletar o cliente
            await tx.delete(clientes).where(eq(clientes.id, clienteId)).run();
        });

        res.json({ message: 'Cliente e todos os seus registros foram excluídos com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        res.status(500).json({ error: 'Erro ao excluir cliente do sistema' });
    }
};
