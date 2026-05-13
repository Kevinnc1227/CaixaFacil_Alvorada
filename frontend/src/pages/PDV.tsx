import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/api';

type Produto = { id: number; nome: string; categoria: string; precoVenda: number; qtdEstoque: number; ativo: boolean; };
type CartItem = { produto: Produto; qtd: number; };
type Ficha = { id: number; nome: string; totalAcumulado: number; status: string; };

const CATEGORIAS = ['Todos', 'Bebidas', 'Salgados', 'Doces', 'Combos'];

export default function PDV() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('Todos');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);

    const [showFichaModal, setShowFichaModal] = useState(false);
    const [fichaId, setFichaId] = useState<number | null>(null);

    // Mobile cart
    const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);

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
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden gap-4 h-full relative z-10">
            {/* Product Grid */}
            <section className="flex-[2] md:flex-[2.5] lg:flex-[3] flex flex-col cf-card overflow-hidden h-full">
                <div className="flex flex-col gap-3 p-4 border-b border-cf-border bg-cf-surface-high flex-shrink-0">
                    <div className="relative">
                        <span className="material-symbols-outlined text-cf-muted absolute left-3 top-1/2 -translate-y-1/2">search</span>
                        <input
                            className="cf-input pl-10"
                            placeholder="Buscar produto ou código..."
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto cf-scroll pb-1">
                        {CATEGORIAS.map(cat => (
                            <button
                                key={cat} onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-full font-sans text-xs font-bold whitespace-nowrap transition-all border ${filter === cat
                                    ? 'bg-cf-accent text-cf-accent-text border-cf-accent shadow-[0_0_10px_rgba(212,168,83,0.3)]'
                                    : 'bg-cf-surface border-cf-border text-cf-muted hover:text-cf-text hover:border-cf-border-strong'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start cf-scroll">
                    {isLoading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-10 h-10 border-2 border-cf-accent border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-cf-muted font-mono uppercase tracking-widest text-xs">Carregando catálogo...</span>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-cf-muted/50">
                            <span className="material-symbols-outlined text-5xl mb-2">search_off</span>
                            <p className="font-mono text-sm uppercase tracking-wider">0 Resultados</p>
                        </div>
                    ) : filteredProducts.map((produto: Produto) => {
                        const isEsgotado = produto.qtdEstoque <= 0;
                        const inCart = cart.find(i => i.produto.id === produto.id);
                        return (
                            <button
                                key={produto.id}
                                onClick={() => addToCart(produto)}
                                disabled={isEsgotado}
                                className={`flex flex-col bg-cf-surface border rounded-xl overflow-hidden group text-left transition-all duration-150 relative ${isEsgotado
                                    ? 'border-cf-border opacity-40 cursor-not-allowed grayscale'
                                    : inCart
                                        ? 'border-cf-accent bg-cf-accent-glow ring-1 ring-cf-accent'
                                        : 'border-cf-border hover:border-cf-accent hover:shadow-cf-accent active:scale-[0.97]'}`}
                            >
                                {isEsgotado && (
                                    <div className="absolute top-2 right-2 cf-badge cf-badge-red z-20">
                                        Esgotado
                                    </div>
                                )}
                                {inCart && !isEsgotado && (
                                    <div className="absolute top-2 right-2 bg-cf-accent text-cf-accent-text text-xs font-bold w-6 h-6 rounded-full z-20 flex items-center justify-center shadow-[0_0_10px_rgba(212,168,83,0.5)]">
                                        {inCart.qtd}
                                    </div>
                                )}

                                {/* Image Placeholder Area */}
                                <div className="h-24 w-full bg-cf-surface-high border-b border-cf-border relative flex items-center justify-center">
                                    <span className="material-symbols-outlined text-cf-muted text-4xl group-hover:text-cf-accent transition-colors">
                                        {produto.categoria === 'Bebidas' ? 'water_drop' : produto.categoria === 'Doces' ? 'cake' : 'fastfood'}
                                    </span>
                                </div>

                                {/* Info Area */}
                                <div className="p-3 flex flex-col gap-1 z-10 w-full relative bg-cf-surface">
                                    <span className="font-sans text-sm font-semibold text-cf-text line-clamp-1" title={produto.nome}>{produto.nome}</span>
                                    <span className="cf-price mt-1">
                                        {produto.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[10px] text-cf-muted-light">Estoque: {produto.qtdEstoque}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Cart Header & Content */}
            <aside className="flex-1 flex flex-col cf-card shadow-cf-lg min-w-[300px] max-w-[420px] overflow-hidden h-full">
                <div className="flex items-center justify-between p-4 border-b border-cf-border bg-cf-surface-high flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-cf-accent">shopping_cart</span>
                        <h2 className="font-sans font-bold text-cf-text text-lg tracking-tight">
                            Comanda
            {/* Mobile View Cart Button */}
            {!isCartMobileOpen && (
                <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
                    <button
                        onClick={() => setIsCartMobileOpen(true)}
                        className="w-full bg-secondary text-white rounded-xl p-4 shadow-lg flex items-center justify-between font-label-bold"
                    >
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined">shopping_cart</span>
                            Ver Carrinho ({cart.reduce((a, i) => a + i.qtd, 0)})
                        </div>
                        <span className="font-headline-sm">
                            {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </button>
                </div>
            )}

            {/* Cart */}
            <aside className={`
                ${isCartMobileOpen ? 'fixed inset-0 z-40 bg-surface' : 'hidden md:flex'} 
                flex-1 flex-col bg-surface-container rounded-none md:rounded-xl border-0 md:border border-outline-variant shadow-lg md:min-w-[300px] md:max-w-[420px] overflow-hidden h-full md:relative
            `}>
                <div className="flex items-center justify-between p-md border-b border-outline-variant bg-surface-container-high flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {isCartMobileOpen && (
                            <button onClick={() => setIsCartMobileOpen(false)} className="md:hidden text-on-surface mr-2 p-1">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                        )}
                        <span className="material-symbols-outlined text-on-surface hidden md:block">shopping_cart</span>
                        <h2 className="font-headline-md text-on-surface">
                            Pedido Atual
                            {cart.length > 0 && (
                                <span className="ml-3 bg-cf-accent text-cf-accent-text text-xs px-2 py-0.5 rounded-full">{cart.reduce((a, i) => a + i.qtd, 0)} itens</span>
                            )}
                        </h2>
                    </div>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="text-cf-muted hover:text-cf-red transition-colors p-1" title="Limpar Tudo">
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto cf-scroll">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-cf-muted opacity-40 p-8 text-center gap-4">
                            <span className="material-symbols-outlined text-6xl">qr_code_scanner</span>
                            <p className="font-mono text-sm uppercase tracking-widest max-w-[200px]">Aguardando Inserção de Produtos</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.produto.id} className="flex items-center p-4 border-b border-cf-border/50 hover:bg-cf-surface-high transition-colors">
                            <div className="flex-1 pr-3">
                                <div className="font-sans font-semibold text-cf-text text-sm line-clamp-1">{item.produto.nome}</div>
                                <div className="text-xs text-cf-muted-light mt-0.5">{item.produto.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} un.</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-cf-bg rounded border border-cf-border h-8 overflow-hidden">
                                    <button onClick={() => updateQtd(item.produto.id, -1)} className="w-8 h-full flex items-center justify-center text-cf-muted hover:text-cf-text hover:bg-cf-surface-highest transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">remove</span>
                                    </button>
                                    <span className="w-8 text-center font-mono text-sm text-cf-text">{item.qtd}</span>
                                    <button onClick={() => updateQtd(item.produto.id, 1)} className="w-8 h-full flex items-center justify-center text-cf-muted hover:text-cf-text hover:bg-cf-surface-highest transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">add</span>
                                    </button>
                                </div>
                                <div className="cf-price text-right w-[80px]">
                                    {(item.produto.precoVenda * item.qtd).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Checkout Footer */}
                <div className="bg-cf-surface border-t border-cf-border p-5 flex flex-col gap-4 flex-shrink-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-mono uppercase tracking-widest text-cf-muted">Total a Pagar</span>
                        <span className="cf-price-lg leading-none">
                            {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setShowFichaModal(true); setFichaId(null); }}
                            disabled={cart.length === 0 || checkoutMutation.isPending || fichaCheckoutMutation.isPending}
                            className="cf-btn cf-btn-secondary flex-1"
                        >
                            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                            FICHA
                        </button>
                        <button
                            onClick={() => checkoutMutation.mutate()}
                            disabled={cart.length === 0 || checkoutMutation.isPending || fichaCheckoutMutation.isPending}
                            className="cf-btn cf-btn-primary flex-[2]"
                        >
                            <span className="material-symbols-outlined text-[20px]">payments</span>
                            {checkoutMutation.isPending ? 'ENVIANDO...' : 'PAGAR AGORA'}
                        </button>
                    </div>
                    </div>
            </aside>

            {/* Modal Lançar na Ficha */}
            {showFichaModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="cf-card-elevated w-full max-w-md overflow-hidden relative">
                        {/* Fake top border accent */}
                        <div className="h-1 w-full bg-cf-accent absolute top-0 left-0" />

                        <div className="flex items-center justify-between p-5 border-b border-cf-border">
                            <div>
                                <h2 className="font-sans text-xl font-bold text-cf-text tracking-tight">Associar à Ficha</h2>
                                <p className="text-xs text-cf-muted font-mono tracking-wider uppercase mt-1">Direcionar PENDÊNCIA</p>
                            </div>
                            <button onClick={() => setShowFichaModal(false)} className="text-cf-muted hover:text-cf-red transition-colors p-2 rounded-lg">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="bg-cf-surface-high border border-cf-border rounded-lg p-4 mb-5 flex justify-between items-center">
                                <span className="text-xs font-mono uppercase tracking-widest text-cf-muted">Valor Total</span>
                                <span className="font-mono text-lg font-bold text-cf-accent">
                                    {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>

                            {fichasAbertas.length === 0 ? (
                                <div className="text-center py-10">
                                    <span className="material-symbols-outlined text-4xl block mb-2 text-cf-border-strong">assignment</span>
                                    <p className="text-sm text-cf-muted">Nenhuma ficha em aberto disponível.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto cf-scroll pr-1">
                                    {fichasAbertas.map((f: Ficha) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setFichaId(f.id)}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left ${fichaId === f.id
                                                ? 'bg-cf-accent-glow border-cf-accent'
                                                : 'bg-cf-bg border-cf-border hover:border-cf-accent/50'}`}
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-mono font-bold text-sm ${fichaId === f.id ? 'bg-cf-accent text-cf-accent-text' : 'bg-cf-surface-high text-cf-text border border-cf-border'}`}>
                                                    {f.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="font-sans font-semibold text-sm text-cf-text truncate">{f.nome}</span>
                                                    <span className="text-[10px] text-cf-muted-light font-mono truncate">ID: #{f.id.toString().padStart(4, '0')}</span>
                                                </div>
                                                <div className="ml-auto text-right">
                                                    <div className="text-xs text-cf-text">Atual</div>
                                                    <div className="text-xs font-mono text-cf-muted">
                                                        {(f.totalAcumulado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 p-5 border-t border-cf-border bg-cf-surface-high/50">
                            <button onClick={() => setShowFichaModal(false)} className="cf-btn cf-btn-ghost flex-1">Cancelar</button>
                            <button
                                onClick={() => fichaCheckoutMutation.mutate()}
                                disabled={!fichaId || fichaCheckoutMutation.isPending}
                                className="cf-btn cf-btn-primary flex-1"
                            >
                                {fichaCheckoutMutation.isPending ? 'Aguarde...' : 'Confirmar Ficha'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
