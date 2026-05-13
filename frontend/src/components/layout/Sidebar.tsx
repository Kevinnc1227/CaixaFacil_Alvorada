import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Defino logo de cara todas as minhas rotas num array pra facilitar a iteração ali embaixo.
// Se eu precisar adicionar um módulo novo amanhã, é só adicionar uma linha aqui.
const navItems = [
    { path: '/pdv', label: 'PDV', icon: 'point_of_sale' },
    { path: '/estoque', label: 'Estoque', icon: 'inventory_2' },
    { path: '/fichas', label: 'Fichas', icon: 'confirmation_number' },
    { path: '/reserva-campo', label: 'Campo', icon: 'sports_soccer' },
    { path: '/caixa', label: 'Fechamento', icon: 'account_balance_wallet' },
    { path: '/suporte', label: 'Suporte', icon: 'support_agent' },
    { path: '/config', label: 'Ajustes', icon: 'settings' },
];

export default function Sidebar() {
    // Puxo o usuário logado do contexto, porque eu preciso mostrar o botão "Operadores" só pros admins.
    const { user } = useAuth();

    return (
        // A sidebar é escondida em telas pequenas (hidden) e exibida em telas médias (md:flex).
        // Travei a largura nela pegando a variável css (--cf-sidebar-w).
        <nav className="hidden md:flex flex-col bg-cf-surface h-screen w-[var(--cf-sidebar-w,240px)] border-r border-cf-border pt-4 pb-6 z-20 flex-shrink-0">
            
            {/* Header da Sidebar (Logo) */}
            <div className="px-6 mb-8 mt-2">
                <h1 className="font-sans text-2xl font-black tracking-tighter text-cf-text">
                    Caixa<span className="text-cf-accent">Facil</span>
                </h1>
                {/* Só um detalhezinho visual bacana de uma barrinha */}
                <div className="h-1 w-8 bg-cf-accent mt-2 rounded-full" />
            </div>

            {/* A lista de rotas com scrollbar (caso fique muitas no futuro) */}
            <div className="flex-1 overflow-y-auto space-y-1 mt-4 cf-scroll">
                
                {/* Faço o map nas minhas rotas dinamicamente */}
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        // O React Router me dá esse boolean 'isActive', aí eu consigo aplicar o estilo de selecionado no menu rapidinho
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 mx-3 my-1 font-sans text-sm font-semibold rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-cf-surface-highest text-cf-accent border-l-4 border-cf-accent shadow-sm'
                                : 'text-cf-muted hover:text-cf-text hover:bg-cf-surface-high border-l-4 border-transparent'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Esse ícone vai preencher (fill) apenas se a rota estiver ativa. Um detalhe premium de UI. */}
                                <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>{item.icon}</span>
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}

                {/* Bloco condicional vital de Segurança Visual: 
                    Esse botão "Operadores" só renderiza se o user for efetivamente um ADMINISTRADOR.
                    (A api/backend também checa as rotas, claro, mas na UI a gente esconde logo). */}
                {user?.perfil === 'ADMINISTRADOR' && (
                    <NavLink
                        to="/config/operadores"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 mx-3 my-1 font-sans text-sm font-semibold rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-cf-surface-highest text-cf-accent border-l-4 border-cf-accent shadow-sm'
                                : 'text-cf-muted hover:text-cf-text hover:bg-cf-surface-high border-l-4 border-transparent'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>admin_panel_settings</span>
                                Operadores
                            </>
                        )}
                    </NavLink>
                )}
            </div>

            {/* Footer da Sidebar */}
            <div className="px-6 mt-auto flex flex-col gap-4">
                {/* Link pra voltar pro site principal (Landing Page) que construímos com terminal e afins */}
                <Link to="/" className="cf-btn cf-btn-ghost w-full flex justify-between items-center text-xs">
                    Voltar ao site
                    <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                </Link>
                {/* Uma assinatura bem discreta só para branding */}
                <div className="text-[10px] text-cf-muted-light/50 font-mono tracking-widest uppercase">
                    K-HUB Soluções
                </div>
            </div>
        </nav>
    );
}
