import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const THEMES = [
    { id: 'amber-dark', label: 'Âmbar', desc: 'Padrão K-HUB', color: '#D4A853' },
    { id: 'ocean-dark', label: 'Oceano', desc: 'Azul profundo', color: '#38BDF8' },
    { id: 'rose-dark', label: 'Rosa', desc: 'Moderno e vibrante', color: '#FB7185' },
    { id: 'emerald-dark', label: 'Esmeralda', desc: 'Verde natureza', color: '#34D399' },
];

export default function Config() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.perfil === 'ADMINISTRADOR';

    // Dados do clube (estado local para edição)
    const [nomeClube, setNomeClube] = useState('Alvorada Esporte Clube');
    const [cnpj, setCnpj] = useState('00.000.000/0001-00');
    const [avisoRecibo, setAvisoRecibo] = useState('Obrigado por fortalecer o esporte local!');
    const [editando, setEditando] = useState(false);

    // Só busca usuários se for admin (para evitar erro 403)
    const { data: usuarios = [], isLoading } = useQuery({
        queryKey: ['usuarios'],
        queryFn: async () => {
            const res = await api.get('/usuarios');
            return res.data.filter((u: any) => u.perfil !== 'SUPORTE');
        },
        enabled: isAdmin
    });

    const handleSalvarDados = () => {
        if (!isAdmin) return;
        // Aqui integraríamos com a API quando existir o endpoint
        toast.success('Dados do clube salvos com sucesso!');
        setEditando(false);
    };

    return (
        <div className="flex flex-col gap-5 h-full max-w-4xl mx-auto w-full overflow-auto cf-scroll pb-8">
            {/* Header */}
            <header className="cf-page-header flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="cf-page-icon"><span className="material-symbols-outlined text-2xl">settings</span></div>
                    <div>
                        <h1 className="font-sans text-xl font-bold text-cf-text tracking-tight">Configurações do Sistema</h1>
                        <p className="text-cf-muted text-xs font-mono uppercase tracking-widest mt-0.5">
                            {isAdmin ? 'Gerencie operadores, tema e dados do clube' : 'Visualize as configurações do sistema'}
                        </p>
                    </div>
                </div>

                {/* Badge do perfil */}
                <span className={`cf-badge ${
                    user?.perfil === 'ADMINISTRADOR' ? 'cf-badge-amber' :
                    user?.perfil === 'SUPORTE' ? 'cf-badge-blue' :
                    'cf-badge-muted'
                }`}>
                    {user?.perfil}
                </span>
            </header>

            {/* Theme Selector */}
            <section className="cf-card overflow-hidden flex-shrink-0">
                <div className="p-4 border-b border-cf-border bg-cf-surface-high flex items-center gap-3">
                    <span className="material-symbols-outlined text-cf-accent">palette</span>
                    <div>
                        <h2 className="font-sans font-bold text-cf-text">Tema da Interface</h2>
                        <p className="text-xs text-cf-muted font-mono mt-0.5">Personalize a cor de destaque do sistema</p>
                    </div>
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {THEMES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id as any)}
                            className={`rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all ${theme === t.id ? 'border-cf-accent bg-cf-accent-glow' : 'border-cf-border bg-cf-surface-high hover:border-cf-accent/40'}`}
                        >
                            <div className="w-10 h-10 rounded-full border-4 border-white/10 shadow-lg" style={{ background: t.color }} />
                            <div className="text-center">
                                <p className={`font-bold text-sm ${theme === t.id ? 'text-cf-accent' : 'text-cf-text'}`}>{t.label}</p>
                                <p className="text-xs text-cf-muted mt-0.5">{t.desc}</p>
                            </div>
                            {theme === t.id && (
                                <span className="material-symbols-outlined text-cf-accent text-[18px]">check_circle</span>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* Users Table (somente ADMIN) */}
            {isAdmin && (
                <section className="cf-card overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b border-cf-border bg-cf-surface-high flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-cf-accent">manage_accounts</span>
                            <div>
                                <h2 className="font-sans font-bold text-cf-text">Operadores e Usuários</h2>
                                <p className="text-xs text-cf-muted font-mono mt-0.5">Gerencie o acesso ao sistema</p>
                            </div>
                        </div>
                        <button
                            className="cf-btn cf-btn-ghost text-xs py-2 px-3 min-h-0 h-8"
                            onClick={() => navigate('/config/operadores')}
                        >
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                            GERENCIAR
                        </button>
                    </div>
                    <div className="overflow-auto cf-scroll">
                        <table className="cf-table">
                            <thead>
                                <tr>
                                    <th className="bg-cf-surface-high">Nome / E-mail</th>
                                    <th className="bg-cf-surface-high">Perfil</th>
                                    <th className="bg-cf-surface-high text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    // Extraindo do ternário aninhado para evitar violação SonarCloud
                                    if (isLoading) {
                                        return (
                                            <tr><td colSpan={3} className="p-8 text-center"><div className="w-8 h-8 border-2 border-cf-accent border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                                        );
                                    }
                                    if (usuarios.length === 0) {
                                        return (
                                            <tr><td colSpan={3} className="p-8 text-center text-cf-muted/40">
                                                <p className="font-mono text-xs uppercase tracking-wider">Nenhum usuário encontrado</p>
                                            </td></tr>
                                        );
                                    }
                                    return usuarios.map((u: any) => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded bg-cf-surface-high border border-cf-border flex items-center justify-center text-cf-muted font-bold text-sm flex-shrink-0">
                                                        {(u.nome || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-cf-text">{u.nome}</div>
                                                        <div className="text-xs text-cf-muted font-mono">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`cf-badge ${u.perfil === 'ADMINISTRADOR' ? 'cf-badge-amber' : 'cf-badge-muted'}`}>{u.perfil}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`cf-badge ${u.ativo ? 'cf-badge-green' : 'cf-badge-red'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Dados do Clube */}
            <section className="cf-card overflow-hidden flex-shrink-0">
                <div className="p-4 border-b border-cf-border bg-cf-surface-high flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-cf-accent">corporate_fare</span>
                        <div>
                            <h2 className="font-sans font-bold text-cf-text">Dados do Clube</h2>
                            <p className="text-xs text-cf-muted font-mono mt-0.5">Informações institucionais do clube</p>
                        </div>
                    </div>
                    {isAdmin && !editando && (
                        <button className="cf-btn cf-btn-ghost text-xs py-2 px-3 min-h-0 h-8" onClick={() => setEditando(true)}>
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            EDITAR
                        </button>
                    )}
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="cfg-nome-clube" className="text-xs font-mono uppercase tracking-widest text-cf-muted">Nome Oficial</label>
                        <input
                            id="cfg-nome-clube"
                            className="cf-input"
                            value={nomeClube}
                            onChange={e => setNomeClube(e.target.value)}
                            disabled={!isAdmin || !editando}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="cfg-cnpj" className="text-xs font-mono uppercase tracking-widest text-cf-muted">CNPJ</label>
                        <input
                            id="cfg-cnpj"
                            className="cf-input"
                            value={cnpj}
                            onChange={e => setCnpj(e.target.value)}
                            disabled={!isAdmin || !editando}
                        />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <label htmlFor="cfg-aviso" className="text-xs font-mono uppercase tracking-widest text-cf-muted">Aviso no Recibo de Ficha</label>
                        <input
                            id="cfg-aviso"
                            className="cf-input"
                            value={avisoRecibo}
                            onChange={e => setAvisoRecibo(e.target.value)}
                            disabled={!isAdmin || !editando}
                        />
                    </div>
                    {!isAdmin && (
                        <div className="md:col-span-2 flex items-center gap-2 mt-1 text-cf-muted">
                            <span className="material-symbols-outlined text-[18px]">lock</span>
                            <span className="text-xs font-mono">Apenas administradores podem editar os dados do clube.</span>
                        </div>
                    )}
                </div>
                {isAdmin && editando && (
                    <div className="p-4 bg-cf-surface-high border-t border-cf-border flex justify-end gap-3">
                        <button className="cf-btn cf-btn-ghost" onClick={() => setEditando(false)}>Cancelar</button>
                        <button className="cf-btn cf-btn-primary" onClick={handleSalvarDados}>SALVAR ALTERAÇÕES</button>
                    </div>
                )}
            </section>

            {/* Sobre o Sistema */}
            <section className="cf-card p-6 flex-shrink-0">
                <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-cf-accent">info</span>
                    <h2 className="font-sans font-bold text-cf-text">Sobre o Sistema</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-cf-surface-high border border-cf-border rounded-lg p-4">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-cf-muted">Plataforma</p>
                        <p className="font-bold text-cf-text mt-1">K-HUB Gestão PDV</p>
                        <p className="text-xs text-cf-muted mt-0.5">Sistema de ponto de venda SaaS</p>
                    </div>
                    <div className="bg-cf-surface-high border border-cf-border rounded-lg p-4">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-cf-muted">Desenvolvido por</p>
                        <p className="font-bold text-cf-text mt-1">K-HUB Soluções</p>
                        <p className="text-xs text-cf-muted mt-0.5">Agência Digital · Inovação e Tecnologia</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
