import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const navItems = [
    { path: '/pdv', label: 'PDV', icon: 'point_of_sale' },
    { path: '/estoque', label: 'Estoque', icon: 'inventory_2' },
    { path: '/fichas', label: 'Fichas', icon: 'confirmation_number' },
    { path: '/caixa', label: 'Fechamento', icon: 'account_balance_wallet' },
    { path: '/suporte', label: 'Suporte', icon: 'support_agent' },
    { path: '/config', label: 'Ajustes', icon: 'settings' },
];

export default function Sidebar() {
    return (
        <nav className="hidden md:flex flex-col bg-cf-surface h-screen w-[var(--cf-sidebar-w,240px)] border-r border-cf-border pt-4 pb-6 z-20 flex-shrink-0">
            <div className="px-6 mb-8 mt-2">
                <h1 className="font-sans text-2xl font-black tracking-tighter text-cf-text">
                    Caixa<span className="text-cf-accent">Facil</span>
                </h1>
                <div className="h-1 w-8 bg-cf-accent mt-2 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 mt-4 cf-scroll">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 mx-3 my-1 font-sans text-sm font-semibold rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-cf-surface-highest text-cf-accent border-l-4 border-cf-accent shadow-sm'
                                : 'text-cf-muted hover:text-cf-text hover:bg-cf-surface-high border-l-4 border-transparent'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>{item.icon}</span>
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            <div className="px-6 mt-auto flex flex-col gap-4">
                <Link to="/" className="cf-btn cf-btn-ghost w-full flex justify-between items-center text-xs">
                    Voltar ao site
                    <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                </Link>
                <div className="text-[10px] text-cf-muted-light/50 font-mono tracking-widest uppercase">
                    K-HUB Soluções
                </div>
            </div>
        </nav>
    );
}
