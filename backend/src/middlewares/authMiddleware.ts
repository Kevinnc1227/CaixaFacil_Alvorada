import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-alvorada-key-1975';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        perfil: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; perfil: string };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.perfil)) {
            res.status(403).json({ error: 'Acesso negado para este perfil' });
            return;
        }
        next();
    };
};
