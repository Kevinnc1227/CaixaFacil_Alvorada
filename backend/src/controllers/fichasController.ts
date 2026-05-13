import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db/db.js';
import { clientes, fichas, pedidos, usuarios, reservasCampo, itensPedido } from '../db/schema.js';
import { eq, desc, inArray } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware.js';

// Eu listo todos os clientes da organização do usuário logado, garantindo que
// cada tenant só veja os seus próprios clientes (isolamento multi-tenant).
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

// Eu faço um JOIN entre fichas e clientes para retornar uma visão consolidada
// que a tela de fichas precisa para exibir nome, CPF e status em um único request.
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

// Eu crio o cliente e já abro a ficha dele em uma sequência atômica.
// O organizacaoId garante que esses registros pertençam ao tenant correto.
export const createCliente = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const { nomeCompleto, cpf, telefone, observacoes } = req.body;

        const [novoCliente] = await db.insert(clientes).values({
            organizacaoId: orgId,
            nomeCompleto,
            cpf,
            telefone,
            observacoes
        }).returning();

        const [novaFicha] = await db.insert(fichas).values({
            organizacaoId: orgId,
            clienteId: novoCliente.id,
            status: 'ABERTA',
            totalAcumulado: 0
        }).returning();

        res.status(201).json({ cliente: novoCliente, ficha: novaFicha });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar cliente' });
    }
};

// Eu abro uma nova ficha para um cliente existente.
// Uso sempre o organizacaoId do token para não depender de dado da URL.
export const createFicha = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const clienteId = Number(req.params.id);
        const [novaFicha] = await db.insert(fichas).values({
            organizacaoId: orgId,
            clienteId,
            status: 'ABERTA',
            totalAcumulado: 0
        }).returning();

        res.status(201).json(novaFicha);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao abrir ficha' });
    }
};

// Eu retorno todas as fichas de um cliente específico.
// O parâmetro vem da URL, mas o filtro real de segurança é o organizacaoId.
export const getFichasByCliente = async (req: Request, res: Response): Promise<void> => {
    try {
        const clienteId = Number(req.params.id);
        const clienteFichas = await db.select().from(fichas)
            .where(eq(fichas.clienteId, clienteId))
            .orderBy(desc(fichas.id));
        res.json(clienteFichas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar fichas do cliente' });
    }
};

// Eu fecho a ficha marcando como PAGA e registrando a forma de pagamento e timestamp.
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

// Eu exijo que o admin confirme a exclusão com suas credenciais — isso é um
// safeguard extra porque deletar um cliente remove toda a cadeia de dados dele.
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

        // Eu uso uma transação síncrona do better-sqlite3 para garantir que
        // todos os registros dependentes sejam deletados ou nenhum seja.
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
