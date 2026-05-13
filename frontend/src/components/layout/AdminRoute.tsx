import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminRouteProps {
    children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    // Puxo o estado do usuário lá do meu contexto de autenticação.
    // Isso é vital porque eu preciso saber quem tá logado antes de deixar passar.
    const { user } = useAuth();

    // Se o cara nem logado está, eu chuto ele de volta pra tela de login.
    // O replace: true garante que ele não consiga voltar usando a seta de "voltar" do navegador.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Aqui é a barreira final: se o maluco tá logado mas o perfil dele não é 'ADMINISTRADOR',
    // eu meto essa tela de "Acesso Negado" na cara dele. Ninguém não-autorizado mexe nas configs!
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

    // Se ele passou pelos dois bloqueios (está logado E é administrador),
    // eu renderizo a página (children) que ele queria acessar em paz.
    return <>{children}</>;
}
