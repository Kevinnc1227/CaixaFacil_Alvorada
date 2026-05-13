import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq, or } from 'drizzle-orm';
import { db } from '../db/db';
import { usuarios } from '../db/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'khub-dev-secret-change-in-production';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        // Aceita email OU username no campo "identificador"
        const { identificador, senha } = req.body;

        if (!identificador || !senha) {
            res.status(400).json({ error: 'Identificador e senha são obrigatórios' });
            return;
        }

        // Busca por email OU por username
        const userRecord = await db
            .select()
            .from(usuarios)
            .where(
                or(
                    eq(usuarios.email, identificador),
                    eq(usuarios.username, identificador)
                )
            )
            .get();

        if (!userRecord) {
            res.status(401).json({ error: 'Credenciais inválidas' });
            return;
        }

        if (!userRecord.ativo) {
            res.status(403).json({ error: 'Usuário desativado. Entre em contato com o suporte.' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(senha, userRecord.senhaHash);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Credenciais inválidas' });
            return;
        }

        const token = jwt.sign(
            {
                id: userRecord.id,
                perfil: userRecord.perfil,
                organizacaoId: userRecord.organizacaoId ?? null,
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                id: userRecord.id,
                nome: userRecord.nome,
                email: userRecord.email,
                username: userRecord.username,
                perfil: userRecord.perfil,
                organizacaoId: userRecord.organizacaoId,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

export const verifyAdminCredentials = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, senha } = req.body;

        const userRecord = await db.select().from(usuarios).where(eq(usuarios.email, email)).get();

        if (!userRecord || userRecord.perfil !== 'ADMINISTRADOR' || !userRecord.ativo) {
            res.status(401).json({ error: 'Credenciais administrativas inválidas ou permissão insuficiente' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(senha, userRecord.senhaHash);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Credenciais administrativas inválidas' });
            return;
        }

        res.json({ success: true, message: 'Administrador verificado' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao verificar credenciais' });
    }
};
