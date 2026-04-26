import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../api/api';

type Produto = { id: number; nome: string; categoria: string; precoVenda: number; qtdEstoque: number; ativo: boolean; };
type CartItem = { produto: Produto; qtd: number; };
type Ficha = { id: number; nome: string; totalAcumulado: number; status: string; };

const CATEGORIAS = ['Todos', 'Bebidas', 'Salgados', 'Doces', 'Combos'];

export default function PDV() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('Todos');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);

    // Modal lançar na ficha
    const [showFichaModal, setShowFichaModal] = useState(false);
    const [fichaId, setFichaId] = useState<number | null>(null);

    const { data: produtos = [], isLoading } = useQuery({
        queryKey: ['produtos'],
        queryFn: async () => {
            const res = await api.get('/produtos');
            return res.data;
        }
    });

    const { data: fichasAbertas = [] } = useQuery<Ficha[]>({
        queryKey: ['fichas'],
        queryFn: async () => {
            const res = await api.get('/fichas/abertas/lista');
            return (res.data as Ficha[]).filter(f => f.status === 'ABERTA');
        },
        enabled: showFichaModal
    });

    const filteredProducts = produtos.filter((p: Produto) => {
        const matchCategory = filter === 'Todos' || p.categoria === filter;
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch && p.ativo;
    });

    const addToCart = (product: Produto) => {
        if (product.qtdEstoque <= 0) return;
        setCart(prev => {
            const existing = prev.find(item => item.produto.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.produto.id === product.id ? { ...item, qtd: item.qtd + 1 } : item
                );
            }
            return [...prev, { produto: product, qtd: 1 }];
        });
    };

    const updateQtd = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.produto.id === id) {
                const newQtd = Math.max(0, item.qtd + delta);
                return { ...item, qtd: newQtd };
            }
            return item;
        }).filter(item => item.qtd > 0));
    };

    const clearCart = () => setCart([]);
    const subtotal = cart.reduce((acc, item) => acc + (item.produto.precoVenda * item.qtd), 0);

    const buildPayload = (tipo: string, fichaIdParam?: number) => ({
        tipo,
        fichaId: fichaIdParam || null,
        total: subtotal,
        itens: cart.map(item => ({
            produtoId: item.produto.id,
            quantidade: item.qtd,
            precoUnitario: item.produto.precoVenda
        }))
    });

    const checkoutMutation = useMutation({
        mutationFn: async () => api.post('/pedidos', buildPayload('PAGAR_AGORA')),
        onSuccess: () => {
            toast.success('Pedido pago com sucesso!');
            clearCart();
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
        },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Erro ao fechar pedido')
    });

    const fichaCheckoutMutation = useMutation({
        mutationFn: async () => {
            if (!fichaId) { toast.error('Selecione uma ficha!'); return; }
            return api.post('/pedidos', buildPayload('LANCAR_FICHA', fichaId));
        },
        onSuccess: () => {
            toast.success('Lançado na ficha com sucesso!');
            clearCart();
            setShowFichaModal(false);
            setFichaId(null);
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            queryClient.invalidateQueries({ queryKey: ['fichas'] });
        },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Erro ao lançar na ficha')
    });

    return (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden gap-xs md:gap-md h-full">
            {/* Product Grid */}
            <section className="flex-[2] md:flex-[2.5] lg:flex-[3] flex flex-col bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm h-full">
                <div className="flex flex-col gap-2 p-md border-b border-outline-variant bg-surface-variant flex-shrink-0">
                    <div className="flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant">
                        <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                        <input
                            className="bg-transparent border-none outline-none text-body-md text-on-surface w-full p-0"
                            placeholder="Buscar produto..."
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {CATEGORIAS.map(cat => (
                            <button
                                key={cat} onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-lg font-label-bold whitespace-nowrap transition-colors border ${filter === cat
                                    ? 'bg-secondary-container text-white border-secondary-container shadow-inner'
                                    : 'bg-surface-container-high border-outline-variant text-on-surface hover:bg-surface-bright'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-md grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md content-start">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center py-8 text-on-surface-variant">Carregando produtos...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-on-surface-variant/50">
                            <span className="material-symbols-outlined text-5xl mb-2">search_off</span>
                            <p className="text-sm">Nenhum produto encontrado</p>
                        </div>
                    ) : filteredProducts.map((produto: Produto) => {
                        const isEsgotado = produto.qtdEstoque <= 0;
                        const inCart = cart.find(i => i.produto.id === produto.id);
                        return (
                            <button
                                key={produto.id}
                                onClick={() => addToCart(produto)}
                                disabled={isEsgotado}
                                className={`flex flex-col bg-surface-container-lowest border rounded-lg overflow-hidden group text-left transition-all duration-150 relative ${isEsgotado
                                    ? 'border-outline-variant opacity-50 cursor-not-allowed'
                                    : inCart
                                        ? 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                                        : 'border-outline-variant hover:border-secondary hover:bg-surface-container-low active:scale-[0.98]'}`}
                            >
                                {isEsgotado && (
                                    <div className="absolute top-2 right-2 bg-error-container text-on-error-container text-[10px] font-bold px-2 py-0.5 rounded-full z-20">
                                        ESGOTADO
                                    </div>
                                )}
                                {inCart && !isEsgotado && (
                                    <div className="absolute top-2 right-2 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full z-20 flex items-center justify-center">
                                        {inCart.qtd}
                                    </div>
                                )}
                                <div className="h-28 w-full bg-surface-variant relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-surface-variant to-surface-dim"></div>
                                    <span className="material-symbols-outlined text-outline text-4xl relative z-10">
                                        {produto.categoria === 'Bebidas' ? 'water_drop' : produto.categoria === 'Doces' ? 'cake' : 'fastfood'}
                                    </span>
                                </div>
                                <div className="p-sm flex flex-col gap-xs z-10 relative bg-surface-container-lowest">
                                    <span className="font-label-bold text-on-surface line-clamp-1" title={produto.nome}>{produto.nome}</span>
                                    <span className="font-headline-md text-secondary-fixed-dim mt-1">
                                        {produto.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                    <span className="text-[10px] text-on-surface-variant">{produto.qtdEstoque} em estoque</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Cart */}
            <aside className="flex-1 flex flex-col bg-surface-container rounded-xl border border-outline-variant shadow-lg min-w-[300px] max-w-[420px] overflow-hidden h-full">
                <div className="flex items-center justify-between p-md border-b border-outline-variant bg-surface-container-high flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-on-surface">shopping_cart</span>
                        <h2 className="font-headline-md text-on-surface">
                            Pedido Atual
                            {cart.length > 0 && (
                                <span className="ml-2 bg-secondary text-white text-xs px-2 py-0.5 rounded-full">{cart.reduce((a, i) => a + i.qtd, 0)}</span>
                            )}
                        </h2>
                    </div>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-md hover:bg-white/5" title="Limpar">
                            <span className="material-symbols-outlined">delete_sweep</span>
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-50 p-6 text-center">
                            <span className="material-symbols-outlined text-5xl mb-2">production_quantity_limits</span>
                            <p className="font-label-bold">Toque nos produtos para adicionar ao carrinho</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.produto.id} className="flex items-center p-md border-b border-outline-variant/50 hover:bg-surface-container-high transition-colors">
                            <div className="flex-1 pr-2">
                                <div className="font-label-bold text-on-surface line-clamp-1">{item.produto.nome}</div>
                                <div className="text-sm text-on-surface-variant">{item.produto.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-surface-dim rounded border border-outline-variant h-8">
                                    <button onClick={() => updateQtd(item.produto.id, -1)} className="w-8 h-full flex items-center justify-center text-on-surface-variant hover:text-white">
                                        <span className="material-symbols-outlined text-[18px]">remove</span>
                                    </button>
                                    <span className="w-6 text-center font-label-bold text-on-surface">{item.qtd}</span>
                                    <button onClick={() => updateQtd(item.produto.id, 1)} className="w-8 h-full flex items-center justify-center text-on-surface-variant hover:text-white">
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                    </button>
                                </div>
                                <div className="font-headline-md text-on-surface text-right w-[86px]">
                                    {(item.produto.precoVenda * item.qtd).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Checkout Footer */}
                <div className="bg-surface-container-highest border-t border-outline-variant p-md flex flex-col gap-md flex-shrink-0 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-end">
                        <span className="text-lg text-on-surface-variant font-lexend">Total</span>
                        <span className="font-stat-lg text-secondary tracking-tight">
                            {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setShowFichaModal(true); setFichaId(null); }}
                            disabled={cart.length === 0 || checkoutMutation.isPending || fichaCheckoutMutation.isPending}
                            className="btn-secondary flex-1 gap-1 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                            FICHA
                        </button>
                        <button
                            onClick={() => checkoutMutation.mutate()}
                            disabled={cart.length === 0 || checkoutMutation.isPending || fichaCheckoutMutation.isPending}
                            className="btn-primary flex-[2] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined fill text-[22px]">payments</span>
                            {checkoutMutation.isPending ? 'PROCESSANDO...' : 'PAGAR AGORA'}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Modal Lançar na Ficha */}
            {showFichaModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-md border-b border-outline-variant">
                            <div>
                                <h2 className="font-headline-sm text-on-surface">Lançar na Ficha</h2>
                                <p className="text-xs text-on-surface-variant">Selecione o cliente</p>
                            </div>
                            <button onClick={() => setShowFichaModal(false)} className="text-on-surface-variant hover:text-error p-2 rounded-lg transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-md">
                            <div className="bg-surface-container-low rounded-lg p-3 mb-4 flex justify-between">
                                <span className="text-sm text-on-surface-variant">Total a lançar</span>
                                <span className="font-bold text-secondary">
                                    {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>

                            {fichasAbertas.length === 0 ? (
                                <div className="text-center py-6 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">assignment</span>
                                    <p className="text-sm">Nenhuma ficha aberta. Cadastre um cliente na aba Fichas.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                                    {fichasAbertas.map((f: Ficha) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setFichaId(f.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${fichaId === f.id
                                                ? 'bg-secondary/10 border-secondary'
                                                : 'bg-surface-container border-outline-variant hover:border-secondary/50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center text-xs font-bold">
                                                    {f.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-label-bold text-on-surface">{f.nome}</span>
                                            </div>
                                            <span className="text-sm text-on-surface-variant">
                                                {(f.totalAcumulado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-md p-md border-t border-outline-variant">
                            <button onClick={() => setShowFichaModal(false)} className="btn-secondary flex-1">Cancelar</button>
                            <button
                                onClick={() => fichaCheckoutMutation.mutate()}
                                disabled={!fichaId || fichaCheckoutMutation.isPending}
                                className="btn-primary flex-1 disabled:opacity-50"
                            >
                                {fichaCheckoutMutation.isPending ? 'Lançando...' : 'Confirmar Lançamento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
