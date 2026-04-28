import React from 'react';
import { NavLink } from 'react-router-dom';

export const navItems = [
    { path: '/pdv', label: 'PDV', icon: 'point_of_sale' },
    { path: '/estoque', label: 'Estoque', icon: 'inventory_2' },
    { path: '/fichas', label: 'Fichas', icon: 'confirmation_number' },
    { path: '/reserva-campo', label: 'Campo', icon: 'sports_soccer' },
    { path: '/caixa', label: 'Fechamento', icon: 'account_balance_wallet' },
    { path: '/suporte', label: 'Suporte', icon: 'support_agent' },
    { path: '/config', label: 'Ajustes', icon: 'settings' },
];

export default function Sidebar() {
    return (
        <nav className="hidden md:flex flex-col bg-slate-950 h-screen w-64 border-r border-white/10 pt-4 pb-6 z-20 flex-shrink-0">
            <div className="px-6 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    <span className="material-symbols-outlined text-white">sports_soccer</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-red-600 tracking-tighter">Alvorada OS</h1>
                    <p className="text-xs text-slate-400 font-lexend">Stadium Operations</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 mx-2 my-1 font-lexend text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-secondary-container text-white shadow-lg shadow-red-900/20 active-scale'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
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
        </nav>
    );
}
