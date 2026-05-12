import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/api';

type Ficha = { id: number; clienteId: number; nome: string; cpf: string; status: 'ABERTA' | 'PAGA'; totalAcumulado: number; };
const FORMAS = ['DINHEIRO', 'PIX', 'CARTAO'];

export default function Fichas() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Todas');
    const [showNovoCliente, setShowNovoCliente] = useState(false);
    const [showFechar, setShowFechar] = useState<Ficha | null>(null);
    const [formaPgto, setFormaPgto] = useState('DINHEIRO');
    const [novoForm, setNovoForm] = useState({ nomeCompleto: '', cpf: '', telefone: '', observacoes: '' });

    const { data: fichasData = [], isLoading } = useQuery({
        queryKey: ['fichas'],
        queryFn: async () => { const res = await api.get('/fichas/abertas/lista'); return res.data; }
    });

    const criarClienteMutation = useMutation({
        mutationFn: async () => api.post('/fichas', novoForm),
        onSuccess: () => { toast.success('Cliente cadastrado!'); queryClient.invalidateQueries({ queryKey: ['fichas'] }); setShowNovoCliente(false); setNovoForm({ nomeCompleto: '', cpf: '', telefone: '', observacoes: '' }); },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Erro ao cadastrar.')
    });

    const fecharMutation = useMutation({
        mutationFn: async () => { if (!showFechar) return; await api.post(`/fichas/fichas/${showFechar.id}/fechar`, { formaPagamento: formaPgto }); },
        onSuccess: () => { toast.success('Conta fechada!'); queryClient.invalidateQueries({ queryKey: ['fichas'] }); setShowFechar(null); },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Não foi possível fechar.')
    });

    const filteredFichas = fichasData.filter((f: Ficha) => {
        if (filter === 'Em Aberto' && f.status !== 'ABERTA') return false;
        if (filter === 'Pagas' && f.status !== 'PAGA') return false;
        if (search) { const s = search.toLowerCase(); return (f.nome || '').toLowerCase().includes(s) || (f.cpf || '').includes(s); }
        return true;
    });

    const totalAberto = fichasData.filter((f: Ficha) => f.status === 'ABERTA').reduce((a: number, f: Ficha) => a + (f.totalAcumulado || 0), 0);
    const countAberto = fichasData.filter((f: Ficha) => f.status === 'ABERTA').length;

    return (
        <div className="flex flex-col gap-5 h-full">
            <header className="cf-page-header flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="cf-page-icon"><span className="material-symbols-outlined text-2xl">receipt_long</span></div>
                    <div>
                        <h1 className="font-sans text-xl font-bold text-cf-text tracking-tight">Fichas de Clientes</h1>
                        <p className="text-cf-muted text-xs font-mono uppercase tracking-widest mt-0.5">
                            {countAberto} em aberto · <span className="text-cf-accent">{totalAberto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} pendente</span>
                        </p>
                    </div>
                </div>
                <button onClick={() => setShowNovoCliente(true)} className="cf-btn cf-btn-primary">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    NOVO CLIENTE
                </button>
            </header>

            <div className="flex-1 cf-card overflow-hidden flex flex-col min-h-0">
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-cf-border bg-cf-surface-high flex-shrink-0">
                    <div className="relative flex-1 max-w-sm">
                        <span className="material-symbols-outlined text-cf-muted absolute left-3 top-1/2 -translate-y-1/2">search</span>
                        <input className="cf-input pl-10" placeholder="Buscar por nome ou CPF..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        {['Todas', 'Em Aberto', 'Pagas'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-xs font-bold font-sans whitespace-nowrap transition-all border ${filter === f ? 'bg-cf-accent text-cf-accent-text border-cf-accent' : 'bg-cf-surface border-cf-border text-cf-muted hover:border-cf-accent/50'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-auto cf-scroll">
                    <table className="cf-table">
                        <thead>
                            <tr>
                                <th className="sticky top-0 bg-cf-surface-high z-10">Cliente</th>
                                <th className="sticky top-0 bg-cf-surface-high z-10 hidden sm:table-cell">CPF / Doc</th>
                                <th className="sticky top-0 bg-cf-surface-high z-10">Status</th>
                                <th className="sticky top-0 bg-cf-surface-high z-10 text-right">Acumulado</th>
                                <th className="sticky top-0 bg-cf-surface-high z-10 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center"><div className="w-8 h-8 border-2 border-cf-accent border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                            ) : filteredFichas.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-cf-muted/50">
                                    <span className="material-symbols-outlined text-5xl block mb-2">assignment</span>
                                    <p className="font-mono text-xs uppercase tracking-wider">Nenhuma ficha encontrada</p>
                                </td></tr>
                            ) : filteredFichas.map((f: Ficha) => (
                                <tr key={f.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded bg-cf-accent-glow border border-cf-accent/20 flex items-center justify-center text-cf-accent text-sm font-bold font-mono flex-shrink-0">
                                                {(f.nome || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-cf-text">{f.nome}</span>
                                        </div>
                                    </td>
                                    <td className="text-cf-muted text-sm font-mono hidden sm:table-cell">{f.cpf || '—'}</td>
                                    <td>
                                        <span className={`cf-badge ${f.status === 'ABERTA' ? 'cf-badge-red' : 'cf-badge-green'}`}>{f.status}</span>
                                    </td>
                                    <td className="text-right"><span className="cf-price">{(f.totalAcumulado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
                                    <td className="text-center">
                                        {f.status === 'ABERTA' && (
                                            <button onClick={() => { setShowFechar(f); setFormaPgto('DINHEIRO'); }} className="cf-btn cf-btn-primary text-xs py-1.5 px-3 min-h-0 h-8">
                                                RECEBER
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Novo Cliente */}
            {showNovoCliente && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="cf-card-elevated w-full max-w-md overflow-hidden relative">
                        <div className="h-1 w-full bg-cf-accent absolute top-0 left-0" />
                        <div className="flex items-center justify-between p-5 border-b border-cf-border">
                            <div>
                                <h2 className="font-sans text-xl font-bold text-cf-text tracking-tight">Novo Cliente</h2>
                                <p className="text-xs text-cf-muted font-mono tracking-wider uppercase mt-1">Cadastrar e abrir ficha</p>
                            </div>
                            <button onClick={() => setShowNovoCliente(false)} className="text-cf-muted hover:text-cf-red transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">Nome Completo *</label>
                                <input className="cf-input" placeholder="Ex: João da Silva" value={novoForm.nomeCompleto} onChange={e => setNovoForm(f => ({ ...f, nomeCompleto: e.target.value }))} autoFocus />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">CPF / Doc</label>
                                    <input className="cf-input" placeholder="000.000.000-00" value={novoForm.cpf} onChange={e => setNovoForm(f => ({ ...f, cpf: e.target.value }))} />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">Telefone</label>
                                    <input className="cf-input" placeholder="(47) 99999-9999" value={novoForm.telefone} onChange={e => setNovoForm(f => ({ ...f, telefone: e.target.value }))} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">Observações</label>
                                <textarea className="cf-input h-20 resize-none" placeholder="Observações opcionais..." value={novoForm.observacoes} onChange={e => setNovoForm(f => ({ ...f, observacoes: e.target.value }))} />
                            </div>
                            <div className="bg-cf-accent-glow border border-cf-accent/20 rounded-lg p-3 flex items-center gap-2 text-xs text-cf-accent">
                                <span className="material-symbols-outlined text-[16px]">info</span>
                                Uma ficha será aberta automaticamente para o cliente.
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-cf-border bg-cf-surface-high/50">
                            <button onClick={() => setShowNovoCliente(false)} className="cf-btn cf-btn-ghost flex-1">Cancelar</button>
                            <button onClick={() => criarClienteMutation.mutate()} disabled={!novoForm.nomeCompleto || criarClienteMutation.isPending} className="cf-btn cf-btn-primary flex-1">
                                {criarClienteMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Fechar Ficha */}
            {showFechar && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="cf-card-elevated w-full max-w-sm overflow-hidden relative">
                        <div className="h-1 w-full bg-cf-green absolute top-0 left-0" />
                        <div className="flex items-center justify-between p-5 border-b border-cf-border">
                            <h2 className="font-sans text-xl font-bold text-cf-text tracking-tight">Fechar Conta</h2>
                            <button onClick={() => setShowFechar(null)} className="text-cf-muted hover:text-cf-red transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div className="bg-cf-surface-high border border-cf-border rounded-xl p-5 text-center">
                                <div className="w-14 h-14 rounded-lg bg-cf-accent-glow border border-cf-accent/20 flex items-center justify-center text-cf-accent text-xl font-bold font-mono mx-auto mb-3">
                                    {(showFechar.nome || '?').charAt(0).toUpperCase()}
                                </div>
                                <p className="font-sans text-lg font-bold text-cf-text">{showFechar.nome}</p>
                                <p className="cf-price-lg mt-2">{(showFechar.totalAcumulado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                <p className="text-xs text-cf-muted font-mono mt-1 uppercase tracking-widest">Total a receber</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">Forma de Pagamento</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {FORMAS.map(f => (
                                        <button key={f} onClick={() => setFormaPgto(f)}
                                            className={`p-3 rounded-lg border text-xs font-bold transition-all ${formaPgto === f ? 'bg-cf-accent text-cf-accent-text border-cf-accent' : 'bg-cf-surface-high border-cf-border text-cf-muted hover:border-cf-accent/50'}`}>
                                            {f === 'CARTAO' ? '💳 CARTÃO' : f === 'PIX' ? '📱 PIX' : '💵 DINHEIRO'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-cf-border bg-cf-surface-high/50">
                            <button onClick={() => setShowFechar(null)} className="cf-btn cf-btn-ghost flex-1">Cancelar</button>
                            <button onClick={() => fecharMutation.mutate()} disabled={fecharMutation.isPending} className="cf-btn cf-btn-primary flex-1">
                                {fecharMutation.isPending ? 'Fechando...' : 'Confirmar Recebimento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
