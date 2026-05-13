import { Response } from 'express';
import { db } from '../db/db';
import { usuarios } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middlewares/authMiddleware';

// Lista usuários da mesma organização do usuário autenticado
export const listUsuarios = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const lista = await db.select({
            id: usuarios.id,
            nome: usuarios.nome,
            email: usuarios.email,
            username: usuarios.username,
            perfil: usuarios.perfil,
            ativo: usuarios.ativo,
            criadoEm: usuarios.criadoEm,
        }).from(usuarios).where(eq(usuarios.organizacaoId, orgId));
        res.json(lista);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};

// Cria novo usuário dentro da mesma organização
export const createUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const { nome, email, username, senha, perfil } = req.body;

        const senhaHash = await bcrypt.hash(senha, 12);

        const [novoUser] = await db.insert(usuarios).values({
            nome, email, username, senhaHash, perfil,
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
            res.status(409).json({ error: 'E-mail ou username já está em uso' });
            return;
        }
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};

// Atualiza usuário — garante que pertence à mesma org
export const updateUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orgId = req.user!.organizacaoId!;
        const id    = Number(req.params.id);
        const { nome, email, username, perfil, ativo } = req.body;

        const [atualizado] = await db.update(usuarios).set({
            nome, email, username, perfil, ativo
        }).where(and(eq(usuarios.id, id), eq(usuarios.organizacaoId, orgId)))
            .returning({
                id: usuarios.id,
                nome: usuarios.nome,
                email: usuarios.email,
                username: usuarios.username,
                perfil: usuarios.perfil,
                ativo: usuarios.ativo,
            });

        res.json(atualizado);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};
