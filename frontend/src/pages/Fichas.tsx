import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../api/api';

type Ficha = {
    id: number;
    clienteId: number;
    nome: string;
    cpf: string;
    status: 'ABERTA' | 'PAGA';
    totalAcumulado: number;
};

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
        queryFn: async () => {
            const res = await api.get('/fichas/abertas/lista');
            return res.data;
        }
    });

    const criarClienteMutation = useMutation({
        mutationFn: async () => {
            return api.post('/fichas', novoForm);
        },
        onSuccess: () => {
            toast.success('Cliente e ficha criados com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['fichas'] });
            setShowNovoCliente(false);
            setNovoForm({ nomeCompleto: '', cpf: '', telefone: '', observacoes: '' });
        },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Erro ao cadastrar cliente.')
    });

    const fecharMutation = useMutation({
        mutationFn: async () => {
            if (!showFechar) return;
            // Route: POST /api/fichas/fichas/:id/fechar (registered as /api/fichas with alias /api/clientes)
            await api.post(`/fichas/fichas/${showFechar.id}/fechar`, { formaPagamento: formaPgto });
        },
        onSuccess: () => {
            toast.success('Conta fechada e recebida!');
            queryClient.invalidateQueries({ queryKey: ['fichas'] });
            setShowFechar(null);
        },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Não foi possível fechar a conta.')
    });

    const filteredFichas = fichasData.filter((f: Ficha) => {
        if (filter === 'Em Aberto' && f.status !== 'ABERTA') return false;
        if (filter === 'Pagas' && f.status !== 'PAGA') return false;
        if (search) {
            const s = search.toLowerCase();
            return (f.nome || '').toLowerCase().includes(s) || (f.cpf || '').includes(s);
        }
        return true;
    });

    const totalAberto = fichasData.filter((f: Ficha) => f.status === 'ABERTA').reduce((a: number, f: Ficha) => a + (f.totalAcumulado || 0), 0);

    return (
        <div className="flex flex-col gap-md h-full">
            <header className="flex justify-between items-center bg-surface p-md rounded-xl shadow-sm border border-outline-variant">
                <div>
                    <h1 className="font-display-sm text-on-surface">Fichas de Clientes</h1>
                    <p className="text-on-surface-variant text-sm">
                        {fichasData.filter((f: Ficha) => f.status === 'ABERTA').length} fichas abertas •{' '}
                        <span className="text-secondary font-semibold">
                            {totalAberto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} pendente
                        </span>
                    </p>
                </div>
                <button onClick={() => setShowNovoCliente(true)} className="btn-primary gap-2">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    NOVO CLIENTE
                </button>
            </header>

            <div className="flex-1 bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
                <div className="p-md flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-surface-container-low border-b border-outline-variant">
                    <div className="flex items-center bg-surface rounded-md px-3 py-2 border border-outline-variant flex-1 max-w-sm">
                        <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                        <input
                            className="bg-transparent border-none outline-none w-full text-on-surface text-sm"
                            placeholder="Buscar por nome ou CPF..."
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['Todas', 'Em Aberto', 'Pagas'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-label-bold transition-colors border ${filter === f
                                    ? 'bg-secondary text-white border-secondary shadow'
                                    : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-bright'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-lowest sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant">Cliente</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant hidden sm:table-cell">CPF / Doc</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant">Status</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant text-right">Acumulado</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Carregando fichas...</td></tr>
                            ) : filteredFichas.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">
                                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">assignment</span>
                                    Nenhuma ficha encontrada.
                                </td></tr>
                            ) : filteredFichas.map((f: Ficha) => (
                                <tr key={f.id} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/30">
                                    <td className="p-4 font-medium text-on-surface">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center text-xs font-bold uppercase flex-shrink-0">
                                                {(f.nome || '?').charAt(0)}
                                            </div>
                                            {f.nome}
                                        </div>
                                    </td>
                                    <td className="p-4 text-on-surface-variant text-sm hidden sm:table-cell">{f.cpf || '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${f.status === 'ABERTA'
                                            ? 'bg-error-container text-error'
                                            : 'bg-primary-container text-primary'}`}>
                                            {f.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-headline-sm text-on-surface">
                                        {(f.totalAcumulado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="p-4 text-center">
                                        {f.status === 'ABERTA' && (
                                            <button
                                                onClick={() => { setShowFechar(f); setFormaPgto('DINHEIRO'); }}
                                                className="btn-primary text-xs py-1.5 px-3 bg-secondary hover:bg-secondary/90"
                                            >
                                                RECEBER & FECHAR
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-md border-b border-outline-variant">
                            <h2 className="font-headline-sm text-on-surface">Cadastrar Novo Cliente</h2>
                            <button onClick={() => setShowNovoCliente(false)} className="text-on-surface-variant hover:text-error p-2 rounded-lg transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-md flex flex-col gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-bold text-on-surface text-sm">Nome Completo *</label>
                                <input
                                    className="input"
                                    placeholder="Ex: João da Silva"
                                    value={novoForm.nomeCompleto}
                                    onChange={e => setNovoForm(f => ({ ...f, nomeCompleto: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-md">
                                <div className="flex flex-col gap-xs flex-1">
                                    <label className="font-label-bold text-on-surface text-sm">CPF / Doc</label>
                                    <input
                                        className="input"
                                        placeholder="000.000.000-00"
                                        value={novoForm.cpf}
                                        onChange={e => setNovoForm(f => ({ ...f, cpf: e.target.value }))}
                                    />
                                </div>
                                <div className="flex flex-col gap-xs flex-1">
                                    <label className="font-label-bold text-on-surface text-sm">Telefone</label>
                                    <input
                                        className="input"
                                        placeholder="(47) 99999-9999"
                                        value={novoForm.telefone}
                                        onChange={e => setNovoForm(f => ({ ...f, telefone: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-bold text-on-surface text-sm">Observações</label>
                                <textarea
                                    className="input h-20 resize-none"
                                    placeholder="Sócio nº... / Time favorito..."
                                    value={novoForm.observacoes}
                                    onChange={e => setNovoForm(f => ({ ...f, observacoes: e.target.value }))}
                                />
                            </div>
                            <div className="bg-surface-container-low rounded-lg p-3 flex items-center gap-2 text-xs text-on-surface-variant">
                                <span className="material-symbols-outlined text-[16px]">info</span>
                                Uma ficha de consumo será aberta automaticamente para o cliente.
                            </div>
                        </div>
                        <div className="flex gap-md p-md border-t border-outline-variant">
                            <button onClick={() => setShowNovoCliente(false)} className="btn-secondary flex-1">Cancelar</button>
                            <button
                                onClick={() => criarClienteMutation.mutate()}
                                disabled={!novoForm.nomeCompleto || criarClienteMutation.isPending}
                                className="btn-primary flex-1 disabled:opacity-50"
                            >
                                {criarClienteMutation.isPending ? 'Cadastrando...' : 'Cadastrar Cliente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Fechar Ficha */}
            {showFechar && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-sm">
                        <div className="flex items-center justify-between p-md border-b border-outline-variant">
                            <h2 className="font-headline-sm text-on-surface">Fechar Conta</h2>
                            <button onClick={() => setShowFechar(null)} className="text-on-surface-variant hover:text-error p-2 rounded-lg transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-md flex flex-col gap-md">
                            <div className="bg-surface-container-low rounded-xl p-md text-center">
                                <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center text-lg font-bold uppercase mx-auto mb-2">
                                    {(showFechar.nome || '?').charAt(0)}
                                </div>
                                <p className="font-headline-sm text-on-surface">{showFechar.nome}</p>
                                <p className="text-2xl font-bold text-secondary mt-1">
                                    {(showFechar.totalAcumulado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                                <p className="text-xs text-on-surface-variant">Total a receber</p>
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-bold text-on-surface text-sm">Forma de Pagamento</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {FORMAS.map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFormaPgto(f)}
                                            className={`p-3 rounded-xl border text-sm font-bold transition-all ${formaPgto === f
                                                ? 'bg-secondary text-white border-secondary shadow-inner'
                                                : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-secondary'}`}
                                        >
                                            {f === 'CARTAO' ? '💳 CARTÃO' : f === 'PIX' ? '📱 PIX' : '💵 DINHEIRO'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-md p-md border-t border-outline-variant">
                            <button onClick={() => setShowFechar(null)} className="btn-secondary flex-1">Cancelar</button>
                            <button
                                onClick={() => fecharMutation.mutate()}
                                disabled={fecharMutation.isPending}
                                className="btn-primary flex-1 bg-secondary hover:bg-secondary/90 disabled:opacity-50"
                            >
                                {fecharMutation.isPending ? 'Fechando...' : 'Confirmar Recebimento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
