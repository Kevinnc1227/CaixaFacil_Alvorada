import { Request, Response } from 'express';
import { db } from '../db/db';
import { usuarios } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middlewares/authMiddleware';

export const listUsuarios = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Retorna todos os usuários (sem a senhaHash). Simplificado no MVP para performance.
        const todosUsuarios = await db.select({
            id: usuarios.id,
            nome: usuarios.nome,
            email: usuarios.email,
            perfil: usuarios.perfil,
            ativo: usuarios.ativo,
            criadoEm: usuarios.criadoEm
        }).from(usuarios);

        res.json(todosUsuarios);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};

export const createUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { nome, email, senha, perfil } = req.body;

        const senhaHash = await bcrypt.hash(senha, 12);

        const [novoUser] = await db.insert(usuarios).values({
            nome,
            email,
            senhaHash,
            perfil
        }).returning({
            id: usuarios.id,
            nome: usuarios.nome,
            email: usuarios.email,
            perfil: usuarios.perfil
        });

        res.status(201).json(novoUser);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};

export const updateUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const { nome, email, perfil, ativo } = req.body;

        const [atualizado] = await db.update(usuarios).set({
            nome,
            email,
            perfil,
            ativo
        }).where(eq(usuarios.id, id)).returning({
            id: usuarios.id,
            nome: usuarios.nome,
            email: usuarios.email,
            perfil: usuarios.perfil,
            ativo: usuarios.ativo
        });

        res.json(atualizado);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};
