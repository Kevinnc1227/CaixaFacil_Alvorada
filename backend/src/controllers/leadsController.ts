import { Request, Response } from 'express';
import { db } from '../db/db';
import { leads } from '../db/schema';
import { eq } from 'drizzle-orm';
import { enviarEmailNovoLead } from '../services/emailService';
import { AuthRequest } from '../middlewares/authMiddleware';

// POST /api/leads — rota pública (Landing Page)
export const createLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nomeNegocio, email, telefone, mensagem } = req.body;

        if (!nomeNegocio || !email) {
            res.status(400).json({ error: 'Nome do negócio e e-mail são obrigatórios' });
            return;
        }

        const [novoLead] = await db.insert(leads).values({
            nomeNegocio,
            email,
            telefone: telefone || null,
            mensagem: mensagem || null,
        }).returning();

        // Dispara e-mail (async, não bloqueia a resposta)
        enviarEmailNovoLead({ nomeNegocio, email, telefone, mensagem }).catch(console.error);

        res.status(201).json({
            message: 'Solicitação recebida com sucesso! Entraremos em contato em breve.',
            id: novoLead.id,
        });
    } catch (error) {
        console.error('createLead error:', error);
        res.status(500).json({ error: 'Erro ao registrar solicitação' });
    }
};

// GET /api/leads — SUPERADMIN only
export const listLeads = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const todosLeads = await db.select().from(leads).orderBy(leads.criadoEm);
        res.json(todosLeads);
    } catch (error) {
        console.error('listLeads error:', error);
        res.status(500).json({ error: 'Erro ao listar leads' });
    }
};

// PATCH /api/leads/:id — SUPERADMIN only
export const updateLeadStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        const validStatuses = ['PENDENTE', 'CONTATADO', 'CONVERTIDO', 'DESCARTADO'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Status inválido' });
            return;
        }

        const [atualizado] = await db.update(leads)
            .set({ status })
            .where(eq(leads.id, id))
            .returning();

        res.json(atualizado);
    } catch (error) {
        console.error('updateLeadStatus error:', error);
        res.status(500).json({ error: 'Erro ao atualizar lead' });
    }
};
