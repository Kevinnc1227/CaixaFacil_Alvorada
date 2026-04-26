import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { usuarios } from '../db/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-alvorada-key-1975';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email e senha são obrigatórios' });
            return;
        }

        const userRecord = await db.select().from(usuarios).where(eq(usuarios.email, email)).get();

        if (!userRecord) {
            res.status(401).json({ error: 'Credenciais inválidas' });
            return;
        }

        if (!userRecord.ativo) {
            res.status(403).json({ error: 'Usuário desativado' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, userRecord.senhaHash);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Credenciais inválidas' });
            return;
        }

        const token = jwt.sign(
            { id: userRecord.id, perfil: userRecord.perfil },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                id: userRecord.id,
                nome: userRecord.nome,
                email: userRecord.email,
                perfil: userRecord.perfil
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};
