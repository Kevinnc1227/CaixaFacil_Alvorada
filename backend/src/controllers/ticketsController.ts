import { Response } from 'express';
import { db } from '../db/db';
import { tickets, mensagensTicket } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

export const listTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId     = req.user!.organizacaoId!;
        const usuarioId = req.user!.id;
        const perfil    = req.user!.perfil;

        let todosTickets;
        if (perfil === 'ADMINISTRADOR' || perfil === 'SUPORTE') {
            todosTickets = await db.select().from(tickets)
                .where(eq(tickets.organizacaoId, orgId))
                .orderBy(desc(tickets.id));
        } else {
            todosTickets = await db.select().from(tickets)
                .where(and(eq(tickets.organizacaoId, orgId), eq(tickets.usuarioId, usuarioId)))
                .orderBy(desc(tickets.id));
        }

        res.json(todosTickets);
    } catch (error) {
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
        const messages = await db.select().from(mensagensTicket)
            .where(eq(mensagensTicket.ticketId, ticketId))
            .orderBy(mensagensTicket.id);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar mensagens' });
    }
};

export const addMessageToTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticketId = Number(req.params.id);
        const { mensagem } = req.body;
        const autorId  = req.user!.id;
        const perfil   = req.user!.perfil;

        const [novaMensagem] = await db.insert(mensagensTicket).values({
            ticketId, autorId, mensagem
        }).returning();

        if (perfil === 'SUPORTE' || perfil === 'ADMINISTRADOR') {
            const [t] = await db.select({ status: tickets.status }).from(tickets).where(eq(tickets.id, ticketId));
            if (t && t.status === 'ABERTO') {
                await db.update(tickets).set({ status: 'EM_ANDAMENTO', atualizadoEm: new Date() }).where(eq(tickets.id, ticketId));
            } else {
                await db.update(tickets).set({ atualizadoEm: new Date() }).where(eq(tickets.id, ticketId));
            }
        } else {
            await db.update(tickets).set({ atualizadoEm: new Date() }).where(eq(tickets.id, ticketId));
        }

        res.status(201).json(novaMensagem);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar mensagem' });
    }
};

export const fecharTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticketId = Number(req.params.id);
        const [atualizado] = await db.update(tickets)
            .set({ status: 'RESOLVIDO', atualizadoEm: new Date() })
            .where(eq(tickets.id, ticketId))
            .returning();
        res.json(atualizado);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fechar chamado' });
    }
};
