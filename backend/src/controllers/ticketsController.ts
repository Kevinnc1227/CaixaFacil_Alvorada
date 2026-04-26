import { Request, Response } from 'express';
import { db } from '../db/db';
import { tickets, mensagensTicket } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/authMiddleware';

export const listTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const usuarioId = req.user!.id;
        const perfil = req.user!.perfil;

        let todosTickets;

        if (perfil === 'ADMINISTRADOR' || perfil === 'SUPORTE') {
            todosTickets = await db.select().from(tickets).orderBy(desc(tickets.id));
        } else {
            // Operador so ve os chamados dele
            todosTickets = await db.select().from(tickets).where(eq(tickets.usuarioId, usuarioId)).orderBy(desc(tickets.id));
        }

        res.json(todosTickets);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar tickets' });
    }
};

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const usuarioId = req.user!.id;
        const { titulo, categoria, descricao } = req.body;

        const [novoTicket] = await db.insert(tickets).values({
            usuarioId,
            titulo,
            categoria,
            descricao
        }).returning();

        // Primeira mensagem do chat é a própria descrição originadora
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
        const messages = await db.select().from(mensagensTicket).where(eq(mensagensTicket.ticketId, ticketId)).orderBy(mensagensTicket.id);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar mensagens' });
    }
};

export const addMessageToTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticketId = Number(req.params.id);
        const { mensagem } = req.body;
        const autorId = req.user!.id;
        const perfil = req.user!.perfil;

        const [novaMensagem] = await db.insert(mensagensTicket).values({
            ticketId,
            autorId,
            mensagem
        }).returning();

        // Se suporte ou admin responder, marca ticket como EM ANDAMENTO se estava ABERTO
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
}

export const fecharTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const ticketId = Number(req.params.id);

        const [atualizado] = await db.update(tickets).set({ status: 'RESOLVIDO', atualizadoEm: new Date() }).where(eq(tickets.id, ticketId)).returning();
        res.json(atualizado);
    } catch (error) {
        res.status(500).json({ error: "Erro ao fechar chamado" });
    }
}
