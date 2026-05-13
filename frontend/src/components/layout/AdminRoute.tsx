import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminRouteProps {
    children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.perfil !== 'ADMINISTRADOR') {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="bg-surface-container rounded-xl p-8 border border-outline-variant shadow-lg text-center max-w-md w-full">
                    <span className="material-symbols-outlined text-6xl text-error mb-4 block">gpp_bad</span>
                    <h2 className="font-headline-lg text-on-surface mb-2">Acesso Negado</h2>
                    <p className="text-on-surface-variant font-body-lg">
                        Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar operadores.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
