import { Response } from 'express';
import { db } from '../db/db';
import { tickets, mensagensTicket, usuarios } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

export const listTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId     = req.user!.organizacaoId;
        const usuarioId = req.user!.id;
        const perfil    = req.user!.perfil;

        let todosTickets;
        const isSupport = perfil === 'SUPORTE' || perfil === 'SUPERADMIN';

        const baseQuery = db.select({
            id: tickets.id,
            organizacaoId: tickets.organizacaoId,
            usuarioId: tickets.usuarioId,
            titulo: tickets.titulo,
            categoria: tickets.categoria,
            descricao: tickets.descricao,
            status: tickets.status,
            criadoEm: tickets.criadoEm,
            atualizadoEm: tickets.atualizadoEm,
            usuarioNome: usuarios.nome,
            usuarioPerfil: usuarios.perfil,
        })
        .from(tickets)
        .leftJoin(usuarios, eq(tickets.usuarioId, usuarios.id));

        if (isSupport) {
            if (orgId) {
                todosTickets = await baseQuery
                    .where(eq(tickets.organizacaoId, orgId))
                    .orderBy(desc(tickets.id));
            } else {
                todosTickets = await baseQuery
                    .orderBy(desc(tickets.id));
            }
        } else {
            if (orgId) {
                todosTickets = await baseQuery
                    .where(and(eq(tickets.organizacaoId, orgId), eq(tickets.usuarioId, usuarioId)))
                    .orderBy(desc(tickets.id));
            } else {
                todosTickets = await baseQuery
                    .where(eq(tickets.usuarioId, usuarioId))
                    .orderBy(desc(tickets.id));
            }
        }

        res.json(todosTickets);
    } catch (error) {
        console.error('Erro ao listar tickets:', error);
        res.status(500).json({ error: 'Erro ao listar tickets' });
    }
};

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId     = req.user!.organizacaoId!;
        const usuarioId = req.user!.id;
        const { titulo, categoria, descricao } = req.body;

        const [novoTicket] = await db.insert(tickets).values({
            usuarioId, titulo, categoria, descricao,
            organizacaoId: orgId,
        }).returning();

        await db.insert(mensagensTicket).values({
            ticketId: novoTicket.id,
            autorId: usuarioId,
            mensagem: descricao
        });

        res.status(201).json(novoTicket);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao abrir ticket' });
    }
};

export const getTicketMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticketId = Number(req.params.id);
        const orgId     = req.user!.organizacaoId;
        const usuarioId = req.user!.id;
        const perfil    = req.user!.perfil;

        const ticket = await db.select().from(tickets).where(eq(tickets.id, ticketId)).get();
        if (!ticket) {
            res.status(404).json({ error: 'Chamado não encontrado' });
            return;
        }

        const isSupport = perfil === 'SUPORTE' || perfil === 'SUPERADMIN';
        if (!isSupport) {
            if (ticket.usuarioId !== usuarioId || (orgId && ticket.organizacaoId !== orgId)) {
                res.status(403).json({ error: 'Acesso negado a este chamado' });
                return;
            }
        }

        const messages = await db.select({
            id: mensagensTicket.id,
            ticketId: mensagensTicket.ticketId,
            autorId: mensagensTicket.autorId,
            mensagem: mensagensTicket.mensagem,
            criadoEm: mensagensTicket.criadoEm,
            autorNome: usuarios.nome,
            autorPerfil: usuarios.perfil,
        })
        .from(mensagensTicket)
        .leftJoin(usuarios, eq(mensagensTicket.autorId, usuarios.id))
        .where(eq(mensagensTicket.ticketId, ticketId))
        .orderBy(mensagensTicket.id);

        res.json(messages);
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        res.status(500).json({ error: 'Erro ao carregar mensagens' });
    }
};

export const addMessageToTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticketId = Number(req.params.id);
        const { mensagem } = req.body;
        const autorId  = req.user!.id;
        const orgId    = req.user!.organizacaoId;
        const perfil   = req.user!.perfil;

        const ticket = await db.select().from(tickets).where(eq(tickets.id, ticketId)).get();
        if (!ticket) {
            res.status(404).json({ error: 'Chamado não encontrado' });
            return;
        }

        const isSupport = perfil === 'SUPORTE' || perfil === 'SUPERADMIN';
        if (!isSupport) {
            if (ticket.usuarioId !== autorId || (orgId && ticket.organizacaoId !== orgId)) {
                res.status(403).json({ error: 'Acesso negado a este chamado' });
                return;
            }
        }

        const [novaMensagem] = await db.insert(mensagensTicket).values({
            ticketId, autorId, mensagem
        }).returning();

        if (isSupport) {
            if (ticket.status === 'ABERTO') {
                await db.update(tickets).set({ status: 'EM_ANDAMENTO', atualizadoEm: new Date() }).where(eq(tickets.id, ticketId));
            } else {
                await db.update(tickets).set({ atualizadoEm: new Date() }).where(eq(tickets.id, ticketId));
            }
        } else {
            await db.update(tickets).set({ atualizadoEm: new Date() }).where(eq(tickets.id, ticketId));
        }

        res.status(201).json(novaMensagem);
    } catch (error) {
        console.error('Erro ao adicionar mensagem:', error);
        res.status(500).json({ error: 'Erro ao adicionar mensagem' });
    }
};

export const fecharTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticketId = Number(req.params.id);
        const orgId    = req.user!.organizacaoId;
        const usuarioId = req.user!.id;
        const perfil    = req.user!.perfil;

        const ticket = await db.select().from(tickets).where(eq(tickets.id, ticketId)).get();
        if (!ticket) {
            res.status(404).json({ error: 'Chamado não encontrado' });
            return;
        }

        const isSupport = perfil === 'SUPORTE' || perfil === 'SUPERADMIN';
        if (!isSupport) {
            if (ticket.usuarioId !== usuarioId || (orgId && ticket.organizacaoId !== orgId)) {
                res.status(403).json({ error: 'Acesso negado a este chamado' });
                return;
            }
        }

        const [atualizado] = await db.update(tickets)
            .set({ status: 'RESOLVIDO', atualizadoEm: new Date() })
            .where(eq(tickets.id, ticketId))
            .returning();
        res.json(atualizado);
    } catch (error) {
        console.error('Erro ao fechar chamado:', error);
        res.status(500).json({ error: 'Erro ao fechar chamado' });
    }
};
