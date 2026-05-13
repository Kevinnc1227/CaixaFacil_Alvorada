import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/db';
import { usuarios, organizacoes } from '../db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'khub-dev-secret-change-in-production';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        perfil: string;
        organizacaoId: number | null;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: number;
            perfil: string;
            organizacaoId: number | null;
        };

        // Verifica o banco de dados para garantir que o usuário e a organização estão ativos
        const user = await db.select().from(usuarios).where(eq(usuarios.id, decoded.id)).get();

        if (!user || !user.ativo) {
            res.status(401).json({ error: 'Usuário não encontrado ou desativado' });
            return;
        }

        if (user.organizacaoId) {
            const org = await db.select().from(organizacoes).where(eq(organizacoes.id, user.organizacaoId)).get();
            if (!org || !org.ativo) {
                res.status(401).json({ error: 'Organização não encontrada ou desativada' });
                return;
            }
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token inválido ou expirado' });
            return;
        }
        next(error);
    }
};

// Restringe a qualquer conjunto de perfis
export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.perfil)) {
            res.status(403).json({ error: 'Acesso negado para este perfil' });
            return;
        }
        next();
    };
};

// Atalho para SUPERADMIN exclusivo
export const requireSuperAdmin = requireRole(['SUPERADMIN']);
