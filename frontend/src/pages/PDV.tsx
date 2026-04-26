import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../api/api';

export default function PDV() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('Todos');
    const [search, setSearch] = useState('');

    // Carrinho local state [{ produto, qtd }]
    const [cart, setCart] = useState<{ produto: any; qtd: number }[]>([]);

    const { data: produtos = [], isLoading } = useQuery({
        queryKey: ['produtos'],
        queryFn: async () => {
            const res = await api.get('/produtos');
            return res.data;
        }
    });

    const filteredProducts = produtos.filter((p: any) => {
        const matchCategory = filter === 'Todos' || p.categoria === filter;
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch && p.ativo;
    });

    const addToCart = (product: any) => {
        if (product.qtdEstoque <= 0) return; // Block sold out
        setCart(prev => {
            const existing = prev.find(item => item.produto.id === product.id);
            if (existing) {
                return prev.map(item => item.produto.id === product.id ? { ...item, qtd: item.qtd + 1 } : item);
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

    const checkoutMutation = useMutation({
        mutationFn: async () => {
            const itens = cart.map(item => ({ produtoId: item.produto.id, quantidade: item.qtd }));
            // Supondo checkout apenas 'PAGAR_AGORA' ou direto no balcão por padrão no botão verde
            const res = await api.post('/pedidos', { tipo: 'PAGAR_AGORA', itens });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Pedido fechado com sucesso!");
            clearCart();
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao fechar pedido");
        }
    });

    return (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden gap-xs md:gap-md h-full">
            {/* Product Grid (Left Canvas) */}
            <section className="flex-[2] md:flex-[2.5] lg:flex-[3] flex flex-col bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm relative h-full">

                <div className="flex flex-col gap-2 p-md border-b border-outline-variant bg-surface-variant flex-shrink-0">
                    {/* Mobile Search */}
                    <div className="flex md:hidden items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant">
                        <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                        <input
                            className="bg-transparent border-none outline-none text-body-md text-on-surface w-full p-0"
                            placeholder="Buscar produto..."
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {['Todos', 'Bebidas', 'Salgados', 'Doces', 'Combos'].map(cat => (
                            <button
                                key={cat} onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-lg font-label-bold whitespace-nowrap transition-colors border ${filter === cat
                                    ? 'bg-secondary-container text-white border-secondary-container shadow-inner'
                                    : 'bg-surface-container-high border-outline-variant text-on-surface hover:bg-surface-bright'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-md grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md content-start">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center py-8 text-on-surface-variant">Carregando produtos...</div>
                    ) : filteredProducts.map((produto: any) => {
                        const isEsgotado = produto.qtdEstoque <= 0;
                        return (
                            <button
                                key={produto.id}
                                onClick={() => addToCart(produto)}
                                disabled={isEsgotado}
                                className={`flex flex-col bg-surface-container-lowest border rounded-lg overflow-hidden group text-left transition-all duration-150 relative ${isEsgotado ? 'border-outline-variant opacity-50 cursor-not-allowed' : 'border-outline-variant hover:border-secondary hover:bg-surface-container-low active:scale-[0.98]'
                                    }`}
                            >
                                {isEsgotado && <div className="absolute top-2 right-2 bg-error-container text-on-error-container text-[10px] font-bold px-2 py-0.5 rounded-full z-20">ESGOTADO</div>}
                                <div className="h-28 w-full bg-surface-variant relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-surface-variant to-surface-dim"></div>
                                    <span className="material-symbols-outlined text-outline text-4xl relative z-10">{produto.categoria === 'Bebidas' ? 'water_drop' : 'fastfood'}</span>
                                </div>
                                <div className="p-sm flex flex-col gap-xs z-10 relative bg-surface-container-lowest">
                                    <span className="font-label-bold text-on-surface line-clamp-1" title={produto.nome}>{produto.nome}</span>
                                    <span className="font-headline-md text-secondary-fixed-dim mt-1">
                                        {produto.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Cart (Right Canvas) */}
            <aside className="flex-1 flex flex-col bg-surface-container rounded-xl border border-outline-variant shadow-lg min-w-[320px] max-w-[420px] overflow-hidden h-full">
                <div className="flex items-center justify-between p-md border-b border-outline-variant bg-surface-container-high flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-on-surface">shopping_cart</span>
                        <h2 className="font-headline-md text-on-surface">Pedido Atual</h2>
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
                    ) : (
                        cart.map(item => (
                            <div key={item.produto.id} className="flex items-center p-md border-b border-outline-variant/50 min-h-[72px] hover:bg-surface-container-high transition-colors">
                                <div className="flex-1 pr-2">
                                    <div className="font-label-bold text-on-surface line-clamp-1">{item.produto.nome}</div>
                                    <div className="text-sm text-on-surface-variant">{item.produto.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-surface-dim rounded border border-outline-variant h-8">
                                        <button onClick={() => updateQtd(item.produto.id, -1)} className="w-8 h-full flex items-center justify-center text-on-surface-variant hover:text-white"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                                        <span className="w-6 text-center font-label-bold text-on-surface">{item.qtd}</span>
                                        <button onClick={() => updateQtd(item.produto.id, 1)} className="w-8 h-full flex items-center justify-center text-on-surface-variant hover:text-white"><span className="material-symbols-outlined text-[18px]">add</span></button>
                                    </div>
                                    <div className="font-headline-md text-on-surface text-right w-[90px]">
                                        {(item.produto.precoVenda * item.qtd).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout Footer */}
                <div className="bg-surface-container-highest border-t border-outline-variant p-md flex flex-col gap-md flex-shrink-0 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-end">
                        <span className="text-lg text-on-surface-variant font-lexend">Total</span>
                        <span className="font-stat-lg text-secondary tracking-tight">
                            {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                    <button
                        onClick={() => checkoutMutation.mutate()}
                        disabled={cart.length === 0 || checkoutMutation.isPending}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined fill text-[28px]">payments</span>
                        {checkoutMutation.isPending ? 'PROCESSANDO...' : 'FECHAR PEDIDO'}
                    </button>
                </div>
            </aside>
        </div>
    );
}
