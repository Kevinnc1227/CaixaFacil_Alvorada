import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/api';

type Produto = { id: number; nome: string; categoria: string; precoVenda: number; qtdEstoque: number; qtdMinima: number; ativo: boolean; };
const CATEGORIAS = ['Bebidas', 'Salgados', 'Doces', 'Combos', 'Outros'];
const FORM_EMPTY = { nome: '', categoria: 'Bebidas', precoVenda: '', qtdEstoque: '', qtdMinima: '' };

export default function Estoque() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<Produto | null>(null);
    const [form, setForm] = useState(FORM_EMPTY);
    const [ajusteModal, setAjusteModal] = useState<Produto | null>(null);
    const [ajusteTipo, setAjusteTipo] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
    const [ajusteQtd, setAjusteQtd] = useState('');
    const [ajusteMotivo, setAjusteMotivo] = useState('');

    const { data: stock = [], isLoading } = useQuery({
        queryKey: ['produtos'],
        queryFn: async () => { const res = await api.get('/produtos'); return res.data; }
    });

    const totalItens = stock.length;
    const criticos = stock.filter((s: Produto) => s.qtdEstoque <= s.qtdMinima && s.qtdEstoque > 0).length;
    const esgotados = stock.filter((s: Produto) => s.qtdEstoque <= 0).length;
    const categorias = new Set(stock.map((s: Produto) => s.categoria)).size;

    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = { nome: form.nome, categoria: form.categoria, precoVenda: parseFloat(String(form.precoVenda)), qtdEstoque: parseInt(String(form.qtdEstoque)), qtdMinima: parseInt(String(form.qtdMinima)) };
            return editTarget ? api.put(`/produtos/${editTarget.id}`, payload) : api.post('/produtos', payload);
        },
        onSuccess: () => { toast.success(editTarget ? 'Produto atualizado!' : 'Produto criado!'); queryClient.invalidateQueries({ queryKey: ['produtos'] }); setShowModal(false); setEditTarget(null); setForm(FORM_EMPTY); },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Erro ao salvar.')
    });

    const ajustarMutation = useMutation({
        mutationFn: async () => {
            if (!ajusteModal) return;
            return api.post(`/produtos/${ajusteModal.id}/estoque`, { quantidade: parseInt(ajusteQtd), tipo: ajusteTipo, motivo: ajusteMotivo || (ajusteTipo === 'ENTRADA' ? 'Entrada de estoque' : 'Saída manual') });
        },
        onSuccess: () => { toast.success('Estoque ajustado!'); queryClient.invalidateQueries({ queryKey: ['produtos'] }); setAjusteModal(null); setAjusteQtd(''); setAjusteMotivo(''); },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Erro ao ajustar.')
    });

    const openCreate = () => { setEditTarget(null); setForm(FORM_EMPTY); setShowModal(true); };
    const openEdit = (p: Produto) => { setEditTarget(p); setForm({ nome: p.nome, categoria: p.categoria, precoVenda: String(p.precoVenda), qtdEstoque: String(p.qtdEstoque), qtdMinima: String(p.qtdMinima) }); setShowModal(true); };
    const openAjuste = (p: Produto, tipo: 'ENTRADA' | 'SAIDA') => { setAjusteModal(p); setAjusteTipo(tipo); setAjusteQtd(''); setAjusteMotivo(''); };

    return (
        <div className="flex flex-col gap-5 h-full">
            <header className="cf-page-header flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="cf-page-icon"><span className="material-symbols-outlined text-2xl">inventory_2</span></div>
                    <div>
                        <h1 className="font-sans text-xl font-bold text-cf-text tracking-tight">Gerenciamento de Estoque</h1>
                        <p className="text-cf-muted text-xs font-mono uppercase tracking-widest mt-0.5">Inventário e gestão de produtos</p>
                    </div>
                </div>
                <button onClick={openCreate} className="cf-btn cf-btn-primary">
                    <span className="material-symbols-outlined text-[18px]">add_box</span>
                    NOVO PRODUTO
                </button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                {[
                    { label: 'Total Itens', value: totalItens, icon: 'inventory_2', color: 'text-cf-accent', bg: 'bg-cf-accent-glow' },
                    { label: 'Crítico', value: criticos, icon: 'warning_amber', color: 'text-cf-yellow', bg: 'bg-cf-yellow-bg' },
                    { label: 'Esgotados', value: esgotados, icon: 'production_quantity_limits', color: 'text-cf-red', bg: 'bg-cf-red-bg' },
                    { label: 'Categorias', value: categorias, icon: 'category', color: 'text-cf-blue', bg: 'bg-cf-blue-bg' },
                ].map(c => (
                    <div key={c.label} className="cf-card p-4 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                            <span className={`material-symbols-outlined text-2xl ${c.color}`}>{c.icon}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-cf-muted">{c.label}</p>
                            <p className={`text-2xl font-bold font-mono leading-none mt-1 ${c.color}`}>{isLoading ? '—' : c.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-1 cf-card overflow-hidden flex flex-col min-h-0">
                <div className="flex-1 overflow-auto cf-scroll">
                    <table className="cf-table">
                        <thead>
                            <tr>
                                <th className="sticky top-0 bg-cf-surface-high z-10">Produto</th>
                                <th className="sticky top-0 bg-cf-surface-high z-10">Preço</th>
                                <th className="sticky top-0 bg-cf-surface-high z-10 text-center">Estoque</th>
                                <th className="sticky top-0 bg-cf-surface-high z-10 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-cf-muted">
                                    <div className="w-8 h-8 border-2 border-cf-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                                </td></tr>
                            ) : stock.length === 0 ? (
                                <tr><td colSpan={4} className="p-12 text-center text-cf-muted/50">
                                    <span className="material-symbols-outlined text-5xl block mb-2">inventory_2</span>
                                    <p className="font-mono text-xs uppercase tracking-wider">Nenhum produto cadastrado</p>
                                </td></tr>
                            ) : stock.map((s: Produto) => {
                                const criticallyLow = s.qtdEstoque > 0 && s.qtdEstoque <= s.qtdMinima;
                                return (
                                    <tr key={s.id} className={!s.ativo ? 'opacity-40' : ''}>
                                        <td>
                                            <div className="font-medium text-cf-text flex items-center gap-2">
                                                {s.nome}
                                                {!s.ativo && <span className="cf-badge cf-badge-muted">INATIVO</span>}
                                            </div>
                                            <div className="text-xs text-cf-muted font-mono mt-0.5">{s.categoria}</div>
                                        </td>
                                        <td><span className="cf-price">{s.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
                                        <td className="text-center">
                                            <span className={`font-bold text-lg font-mono ${s.qtdEstoque === 0 ? 'text-cf-red' : criticallyLow ? 'text-cf-yellow' : 'text-cf-text'}`}>{s.qtdEstoque}</span>
                                            <span className="text-xs text-cf-muted ml-1">un.</span>
                                            {criticallyLow && <div className="text-[10px] text-cf-yellow font-mono mt-0.5">⚠ Mín: {s.qtdMinima}</div>}
                                        </td>
                                        <td className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => openAjuste(s, 'ENTRADA')} className="w-8 h-8 rounded border border-cf-border bg-cf-surface-high text-cf-muted hover:text-cf-green hover:border-cf-green transition-all flex items-center justify-center"><span className="material-symbols-outlined text-[16px]">add</span></button>
                                                <button onClick={() => openAjuste(s, 'SAIDA')} className="w-8 h-8 rounded border border-cf-border bg-cf-surface-high text-cf-muted hover:text-cf-red hover:border-cf-red transition-all flex items-center justify-center"><span className="material-symbols-outlined text-[16px]">remove</span></button>
                                                <button onClick={() => openEdit(s)} className="w-8 h-8 rounded border border-cf-border bg-cf-surface-high text-cf-muted hover:text-cf-accent hover:border-cf-accent transition-all flex items-center justify-center ml-1"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="cf-card-elevated w-full max-w-lg overflow-hidden relative">
                        <div className="h-1 w-full bg-cf-accent absolute top-0 left-0" />
                        <div className="flex items-center justify-between p-5 border-b border-cf-border">
                            <h2 className="font-sans text-xl font-bold text-cf-text tracking-tight">{editTarget ? 'Editar Produto' : 'Novo Produto'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-cf-muted hover:text-cf-red transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">Nome *</label>
                                <input className="cf-input" placeholder="Ex: Coca-Cola 350ml" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">Categoria *</label>
                                    <select className="cf-input" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                                        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">Preço (R$) *</label>
                                    <input className="cf-input" type="number" step="0.01" min="0" placeholder="0,00" value={form.precoVenda} onChange={e => setForm(f => ({ ...f, precoVenda: e.target.value }))} />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">Qtd. Inicial</label>
                                    <input className="cf-input" type="number" min="0" placeholder="0" value={form.qtdEstoque} onChange={e => setForm(f => ({ ...f, qtdEstoque: e.target.value }))} />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">Qtd. Mínima</label>
                                    <input className="cf-input" type="number" min="0" placeholder="5" value={form.qtdMinima} onChange={e => setForm(f => ({ ...f, qtdMinima: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-cf-border bg-cf-surface-high/50">
                            <button onClick={() => setShowModal(false)} className="cf-btn cf-btn-ghost flex-1">Cancelar</button>
                            <button onClick={() => saveMutation.mutate()} disabled={!form.nome || !form.precoVenda || saveMutation.isPending} className="cf-btn cf-btn-primary flex-1">
                                {saveMutation.isPending ? 'Salvando...' : editTarget ? 'Salvar' : 'Criar Produto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {ajusteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="cf-card-elevated w-full max-w-sm overflow-hidden relative">
                        <div className={`h-1 w-full absolute top-0 left-0 ${ajusteTipo === 'ENTRADA' ? 'bg-cf-green' : 'bg-cf-red'}`} />
                        <div className="flex items-center justify-between p-5 border-b border-cf-border">
                            <div>
                                <h2 className={`font-sans text-xl font-bold tracking-tight ${ajusteTipo === 'ENTRADA' ? 'text-cf-green' : 'text-cf-red'}`}>
                                    {ajusteTipo === 'ENTRADA' ? '+ Entrada' : '− Saída'}
                                </h2>
                                <p className="text-xs text-cf-muted font-mono tracking-wider mt-1 uppercase">{ajusteModal.nome}</p>
                            </div>
                            <button onClick={() => setAjusteModal(null)} className="text-cf-muted hover:text-cf-red transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div className="bg-cf-surface-high border border-cf-border rounded-lg p-4 text-center">
                                <p className="text-xs text-cf-muted font-mono uppercase tracking-widest">Estoque atual</p>
                                <p className="text-3xl font-bold font-mono text-cf-text mt-1">{ajusteModal.qtdEstoque} <span className="text-cf-muted text-base font-normal">un.</span></p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">Quantidade *</label>
                                <input className="cf-input text-center text-xl font-bold font-mono" type="number" min="1" placeholder="0" value={ajusteQtd} onChange={e => setAjusteQtd(e.target.value)} autoFocus />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-mono uppercase tracking-widest text-cf-muted">Motivo</label>
                                <input className="cf-input" placeholder={ajusteTipo === 'ENTRADA' ? 'Ex: Compra de fornecedor' : 'Ex: Produto vencido'} value={ajusteMotivo} onChange={e => setAjusteMotivo(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-cf-border bg-cf-surface-high/50">
                            <button onClick={() => setAjusteModal(null)} className="cf-btn cf-btn-ghost flex-1">Cancelar</button>
                            <button onClick={() => ajustarMutation.mutate()} disabled={!ajusteQtd || parseInt(ajusteQtd) <= 0 || ajustarMutation.isPending}
                                className={`cf-btn flex-1 ${ajusteTipo === 'SAIDA' ? 'cf-btn-danger' : 'cf-btn-primary'}`}>
                                {ajustarMutation.isPending ? 'Salvando...' : ajusteTipo === 'ENTRADA' ? 'Confirmar Entrada' : 'Confirmar Saída'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
