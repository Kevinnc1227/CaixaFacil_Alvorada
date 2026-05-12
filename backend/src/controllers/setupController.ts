import { Request, Response } from 'express';
import { db } from '../db/db';
import { organizacoes } from '../db/schema';
import { eq } from 'drizzle-orm';

// GET /api/setup/:token — retorna dados da org (sem auth)
export const getSetupInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        const org = await db.select().from(organizacoes)
            .where(eq(organizacoes.setupToken, token))
            .get();

        if (!org) {
            res.status(404).json({ error: 'Link de setup inválido ou expirado' });
            return;
        }

        if (org.setupConcluido) {
            res.status(409).json({ error: 'Setup já foi concluído para esta organização' });
            return;
        }

        res.json({
            id: org.id,
            nome: org.nome,
            temaPreferido: org.temaPreferido,
            avisoRecibo: org.avisoRecibo,
        });
    } catch (error) {
        console.error('getSetupInfo error:', error);
        res.status(500).json({ error: 'Erro ao buscar informações de setup' });
    }
};

// PATCH /api/setup/:token — salva preferências e conclui setup
export const completeSetup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { temaPreferido, avisoRecibo } = req.body;

        const org = await db.select().from(organizacoes)
            .where(eq(organizacoes.setupToken, token))
            .get();

        if (!org) {
            res.status(404).json({ error: 'Link de setup inválido ou expirado' });
            return;
        }

        if (org.setupConcluido) {
            res.status(409).json({ error: 'Setup já foi concluído' });
            return;
        }

        await db.update(organizacoes)
            .set({
                temaPreferido: temaPreferido || org.temaPreferido,
                avisoRecibo: avisoRecibo || org.avisoRecibo,
                setupConcluido: true,
            })
            .where(eq(organizacoes.setupToken, token));

        res.json({ message: 'Setup concluído com sucesso! Você já pode fazer login.' });
    } catch (error) {
        console.error('completeSetup error:', error);
        res.status(500).json({ error: 'Erro ao concluir setup' });
    }
};
