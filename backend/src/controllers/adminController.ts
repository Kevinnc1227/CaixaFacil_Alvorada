import { Response } from 'express';
import { db } from '../db/db';
import { organizacoes, usuarios } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { AuthRequest } from '../middlewares/authMiddleware';

// ─── ORGANIZAÇÕES ─────────────────────────────────────────────────────────────

// GET /api/admin/organizacoes
export const listOrganizacoes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgs = await db.select().from(organizacoes).orderBy(organizacoes.criadoEm);
        res.json(orgs);
    } catch (error) {
        console.error('[adminController] listOrganizacoes:', error);
        res.status(500).json({ error: 'Erro ao listar organizações' });
    }
};

// POST /api/admin/organizacoes
export const createOrganizacao = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { nome, slug, emailContato, telefone, cnpj } = req.body;

        if (!nome || !slug) {
            res.status(400).json({ error: 'Nome e slug são obrigatórios' });
            return;
        }

        const setupToken = crypto.randomUUID();

        const [novaOrg] = await db.insert(organizacoes).values({
            nome, slug, emailContato, telefone, cnpj, setupToken,
        }).returning();

        res.status(201).json({
            ...novaOrg,
            setupLink: `http://localhost:5173/setup/${setupToken}`,
        });
    } catch (error: any) {
        if (error?.message?.includes('UNIQUE')) {
            res.status(409).json({ error: 'Slug já está em uso por outra organização' });
            return;
        }
        res.status(500).json({ error: 'Erro ao criar organização' });
    }
};

// PATCH /api/admin/organizacoes/:id
export const updateOrganizacao = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const { nome, emailContato, telefone, cnpj, ativo } = req.body;

        const [atualizado] = await db.update(organizacoes)
            .set({ nome, emailContato, telefone, cnpj, ativo })
            .where(eq(organizacoes.id, id))
            .returning();

        res.json(atualizado);
    } catch (error) {
        console.error('[adminController] updateOrganizacao:', error);
        res.status(500).json({ error: 'Erro ao atualizar organização' });
    }
};

// POST /api/admin/organizacoes/:id/reset-setup — regenera o setup token
export const resetSetupToken = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const novoToken = crypto.randomUUID();

        await db.update(organizacoes)
            .set({ setupToken: novoToken, setupConcluido: false })
            .where(eq(organizacoes.id, id));

        res.json({
            setupToken: novoToken,
            setupLink: `http://localhost:5173/setup/${novoToken}`,
        });
    } catch (error) {
        console.error('[adminController] resetSetupToken:', error);
        res.status(500).json({ error: 'Erro ao resetar setup token' });
    }
};

// ─── USUÁRIOS DA ORGANIZAÇÃO ─────────────────────────────────────────────────

// GET /api/admin/organizacoes/:id/usuarios
export const listUsuariosByOrg = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = Number(req.params.id);
        const users = await db.select({
            id: usuarios.id,
            nome: usuarios.nome,
            email: usuarios.email,
            username: usuarios.username,
            perfil: usuarios.perfil,
            ativo: usuarios.ativo,
            criadoEm: usuarios.criadoEm,
        }).from(usuarios).where(eq(usuarios.organizacaoId, orgId));
        res.json(users);
    } catch (error) {
        console.error('[adminController] listUsuariosByOrg:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};

// POST /api/admin/organizacoes/:id/usuarios
export const createUsuarioForOrg = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = Number(req.params.id);
        const { nome, email, username, senha, perfil } = req.body;

        if (!nome || !email || !senha) {
            res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
            return;
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        const [novoUser] = await db.insert(usuarios).values({
            nome, email, username, senhaHash,
            perfil: perfil || 'ADMINISTRADOR',
            organizacaoId: orgId,
        }).returning({
            id: usuarios.id,
            nome: usuarios.nome,
            email: usuarios.email,
            username: usuarios.username,
            perfil: usuarios.perfil,
        });

        res.status(201).json(novoUser);
    } catch (error: any) {
        if (error?.message?.includes('UNIQUE')) {
            res.status(409).json({ error: 'E-mail ou username já em uso' });
            return;
        }
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};
