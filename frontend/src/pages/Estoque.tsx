import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../api/api';

type Produto = {
    id: number;
    nome: string;
    categoria: string;
    precoVenda: number;
    qtdEstoque: number;
    qtdMinima: number;
    ativo: boolean;
};

const CATEGORIAS = ['Bebidas', 'Salgados', 'Doces', 'Combos', 'Outros'];

const FORM_EMPTY = {
    nome: '',
    categoria: 'Bebidas',
    precoVenda: '',
    qtdEstoque: '',
    qtdMinima: '',
};

export default function Estoque() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<Produto | null>(null);
    const [form, setForm] = useState(FORM_EMPTY);

    // Filtros da tabela
    const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'CRITICO' | 'ESGOTADO'>('TODOS');
    const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');

    // Ajuste de estoque
    const [ajusteModal, setAjusteModal] = useState<Produto | null>(null);
    const [ajusteTipo, setAjusteTipo] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
    const [ajusteQtd, setAjusteQtd] = useState('');
    const [ajusteMotivo, setAjusteMotivo] = useState('');

    const { data: stock = [], isLoading } = useQuery({
        queryKey: ['produtos'],
        queryFn: async () => {
            const res = await api.get('/produtos');
            return res.data;
        }
    });

    const totalItens = stock.length;
    const criticos = stock.filter((s: Produto) => s.qtdEstoque <= s.qtdMinima && s.qtdEstoque > 0).length;
    const esgotados = stock.filter((s: Produto) => s.qtdEstoque <= 0).length;
    const categorias = new Set(stock.map((s: Produto) => s.categoria)).size;
    const listaCategorias = Array.from(new Set(stock.map((s: Produto) => s.categoria))) as string[];

    const filteredStock = stock.filter((s: Produto) => {
        if (filtroStatus === 'CRITICO' && !(s.qtdEstoque <= s.qtdMinima && s.qtdEstoque > 0)) return false;
        if (filtroStatus === 'ESGOTADO' && s.qtdEstoque <= 0 === false) return false; // Fixed: esgotado check
        if (filtroCategoria !== 'TODAS' && s.categoria !== filtroCategoria) return false;
        return true;
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            const parsedPreco = parseFloat(String(form.precoVenda).replace(',', '.'));
            const payload = {
                nome: form.nome,
                categoria: form.categoria,
                precoVenda: isNaN(parsedPreco) ? 0 : parsedPreco,
                qtdEstoque: parseInt(String(form.qtdEstoque)) || 0,
                qtdMinima: parseInt(String(form.qtdMinima)) || 0,
            };
            if (editTarget) {
                return api.put(`/produtos/${editTarget.id}`, payload);
            }
            return api.post('/produtos', payload);
        },
        onSuccess: () => {
            toast.success(editTarget ? 'Produto atualizado!' : 'Produto criado!');
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            setShowModal(false);
            setEditTarget(null);
            setForm(FORM_EMPTY);
        },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Erro ao salvar produto.')
    });

    const ajustarMutation = useMutation({
        mutationFn: async () => {
            if (!ajusteModal) return;
            return api.post(`/produtos/${ajusteModal.id}/estoque`, {
                quantidade: parseInt(ajusteQtd),
                tipo: ajusteTipo,
                motivo: ajusteMotivo || (ajusteTipo === 'ENTRADA' ? 'Entrada de estoque' : 'Saída manual'),
            });
        },
        onSuccess: () => {
            toast.success('Estoque ajustado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            setAjusteModal(null);
            setAjusteQtd('');
            setAjusteMotivo('');
        },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Erro ao ajustar estoque.')
    });

    const openCreate = () => {
        setEditTarget(null);
        setForm(FORM_EMPTY);
        setShowModal(true);
    };

    const openEdit = (p: Produto) => {
        setEditTarget(p);
        setForm({
            nome: p.nome,
            categoria: p.categoria,
            precoVenda: String(p.precoVenda),
            qtdEstoque: String(p.qtdEstoque),
            qtdMinima: String(p.qtdMinima),
        });
        setShowModal(true);
    };

    const openAjuste = (p: Produto, tipo: 'ENTRADA' | 'SAIDA') => {
        setAjusteModal(p);
        setAjusteTipo(tipo);
        setAjusteQtd('');
        setAjusteMotivo('');
    };

    return (
        <div className="flex flex-col gap-md h-full">
            <header className="flex justify-between items-center bg-surface p-md rounded-xl shadow-sm border border-outline-variant">
                <div>
                    <h1 className="font-display-sm text-on-surface">Gerenciamento de Estoque</h1>
                    <p className="text-on-surface-variant text-sm">Controle de inventário e gestão de produtos</p>
                </div>
                <button onClick={openCreate} className="btn-primary gap-2 bg-primary">
                    <span className="material-symbols-outlined text-[20px]">add_box</span>
                    NOVO PRODUTO
                </button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-2">
                {[
                    { id: 'TODOS', label: 'Total Itens', value: totalItens, icon: 'inventory_2', color: 'primary' },
                    { id: 'CRITICO', label: 'Estoque Crítico', value: criticos, icon: 'warning', color: 'error' },
                    { id: 'ESGOTADO', label: 'Esgotados', value: esgotados, icon: 'production_quantity_limits', color: 'secondary' },
                    { id: 'CATEGORIAS', label: 'Categorias', value: categorias, icon: 'category', color: 'on-surface' },
                ].map(card => (
                    <div 
                        key={card.label} 
                        onClick={() => card.id !== 'CATEGORIAS' ? setFiltroStatus(card.id as any) : null}
                        className={`bg-surface p-md rounded-xl border ${card.id !== 'CATEGORIAS' && filtroStatus === card.id ? `border-${card.color} ring-2 ring-${card.color}/20` : 'border-outline-variant'} shadow-sm flex items-center gap-4 ${card.id !== 'CATEGORIAS' ? 'cursor-pointer hover:bg-surface-container-low transition-all' : ''}`}
                    >
                        <div className={`bg-${card.color}-container p-3 rounded-full text-${card.color}`}>
                            <span className="material-symbols-outlined">{card.icon}</span>
                        </div>
                        <div className="flex-1 w-full min-w-0">
                            <p className="text-xs text-on-surface-variant font-label-bold uppercase truncate">{card.label}</p>
                            {card.id === 'CATEGORIAS' ? (
                                <select 
                                    className="bg-transparent text-xl font-bold text-on-surface outline-none cursor-pointer mt-1 w-full truncate"
                                    value={filtroCategoria}
                                    onChange={(e) => setFiltroCategoria(e.target.value)}
                                >
                                    <option value="TODAS">Todas ({categorias})</option>
                                    {listaCategorias.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className={`text-2xl font-bold text-${card.color}`}>{isLoading ? '-' : card.value}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-1 bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-low sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant">Produto / Categoria</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant">Preço</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant text-center">Em Estoque</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">Carregando estoque...</td></tr>
                            ) : filteredStock.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">
                                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">inventory_2</span>
                                    {stock.length === 0 ? 'Nenhum produto cadastrado. Clique em "Novo Produto" para começar.' : 'Nenhum produto encontrado com os filtros atuais.'}
                                </td></tr>
                            ) : filteredStock.map((s: Produto) => {
                                const criticallyLow = s.qtdEstoque > 0 && s.qtdEstoque <= s.qtdMinima;
                                return (
                                    <tr key={s.id} className={`hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/30 ${!s.ativo ? 'opacity-40' : ''}`}>
                                        <td className="p-4">
                                            <div className="font-medium text-on-surface flex items-center gap-2">
                                                {s.nome}
                                                {!s.ativo && <span className="text-[10px] bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full">INATIVO</span>}
                                            </div>
                                            <div className="text-xs text-on-surface-variant mt-0.5">{s.categoria}</div>
                                        </td>
                                        <td className="p-4 text-on-surface-variant">
                                            {s.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-bold text-lg ${s.qtdEstoque === 0 ? 'text-error' : criticallyLow ? 'text-secondary' : 'text-on-surface'}`}>
                                                {s.qtdEstoque}
                                            </span>
                                            <span className="text-xs text-on-surface-variant ml-1">un.</span>
                                            {criticallyLow && <div className="text-[10px] text-secondary">⚠ Mín: {s.qtdMinima}</div>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => openAjuste(s, 'ENTRADA')}
                                                    className="btn-secondary p-2 rounded-lg hover:bg-primary-container hover:text-primary transition-colors"
                                                    title="Dar Entrada (+)"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                                </button>
                                                <button
                                                    onClick={() => openAjuste(s, 'SAIDA')}
                                                    className="btn-secondary p-2 rounded-lg hover:bg-error-container hover:text-error transition-colors"
                                                    title="Dar Saída (-)"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">remove</span>
                                                </button>
                                                <button
                                                    onClick={() => openEdit(s)}
                                                    className="btn-secondary p-2 rounded-lg ml-1"
                                                    title="Editar Produto"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Criar / Editar Produto */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-md border-b border-outline-variant">
                            <h2 className="font-headline-sm text-on-surface">{editTarget ? 'Editar Produto' : 'Novo Produto'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-error p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-md flex flex-col gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-bold text-on-surface text-sm">Nome do Produto *</label>
                                <input
                                    className="input"
                                    placeholder="Ex: Coca-Cola 350ml"
                                    value={form.nome}
                                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                                />
                            </div>
                            <div className="flex gap-md">
                                <div className="flex flex-col gap-xs flex-1">
                                    <label className="font-label-bold text-on-surface text-sm">Categoria *</label>
                                    <select
                                        className="input"
                                        value={form.categoria}
                                        onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                                    >
                                        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-xs flex-1">
                                    <label className="font-label-bold text-on-surface text-sm">Preço de Venda (R$) *</label>
                                    <input
                                        className="input"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        value={form.precoVenda}
                                        onChange={e => setForm(f => ({ ...f, precoVenda: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-md">
                                <div className="flex flex-col gap-xs flex-1">
                                    <label className="font-label-bold text-on-surface text-sm">Qtd. Inicial em Estoque</label>
                                    <input
                                        className="input"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={form.qtdEstoque}
                                        onChange={e => setForm(f => ({ ...f, qtdEstoque: e.target.value }))}
                                    />
                                </div>
                                <div className="flex flex-col gap-xs flex-1">
                                    <label className="font-label-bold text-on-surface text-sm">Qtd. Mínima (alerta)</label>
                                    <input
                                        className="input"
                                        type="number"
                                        min="0"
                                        placeholder="5"
                                        value={form.qtdMinima}
                                        onChange={e => setForm(f => ({ ...f, qtdMinima: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-md p-md border-t border-outline-variant">
                            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                            <button
                                onClick={() => saveMutation.mutate()}
                                disabled={!form.nome || !form.precoVenda || saveMutation.isPending}
                                className="btn-primary flex-1 disabled:opacity-50"
                            >
                                {saveMutation.isPending ? 'Salvando...' : editTarget ? 'Salvar Alterações' : 'Criar Produto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ajuste de Estoque */}
            {ajusteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-sm">
                        <div className="flex items-center justify-between p-md border-b border-outline-variant">
                            <div>
                                <h2 className="font-headline-sm text-on-surface">
                                    {ajusteTipo === 'ENTRADA' ? '+ Entrada de Estoque' : '- Saída de Estoque'}
                                </h2>
                                <p className="text-xs text-on-surface-variant mt-0.5">{ajusteModal.nome}</p>
                            </div>
                            <button onClick={() => setAjusteModal(null)} className="text-on-surface-variant hover:text-error p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-md flex flex-col gap-md">
                            <div className="bg-surface-container-low rounded-lg p-3 text-center">
                                <p className="text-xs text-on-surface-variant">Estoque atual</p>
                                <p className="text-2xl font-bold text-on-surface">{ajusteModal.qtdEstoque} un.</p>
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-bold text-on-surface text-sm">Quantidade *</label>
                                <input
                                    className="input text-center text-xl font-bold"
                                    type="number"
                                    min="1"
                                    placeholder="0"
                                    value={ajusteQtd}
                                    onChange={e => setAjusteQtd(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-bold text-on-surface text-sm">Motivo (opcional)</label>
                                <input
                                    className="input"
                                    placeholder={ajusteTipo === 'ENTRADA' ? 'Ex: Compra de fornecedor' : 'Ex: Produto vencido'}
                                    value={ajusteMotivo}
                                    onChange={e => setAjusteMotivo(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-md p-md border-t border-outline-variant">
                            <button onClick={() => setAjusteModal(null)} className="btn-secondary flex-1">Cancelar</button>
                            <button
                                onClick={() => ajustarMutation.mutate()}
                                disabled={!ajusteQtd || parseInt(ajusteQtd) <= 0 || ajustarMutation.isPending}
                                className={`btn-primary flex-1 disabled:opacity-50 ${ajusteTipo === 'SAIDA' ? 'bg-error border-error hover:bg-error/80' : ''}`}
                            >
                                {ajustarMutation.isPending ? 'Salvando...' : ajusteTipo === 'ENTRADA' ? 'Confirmar Entrada' : 'Confirmar Saída'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
