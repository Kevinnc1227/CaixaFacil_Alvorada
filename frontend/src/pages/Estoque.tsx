import React, { useState } from 'react';

const MOCK_STOCK = [
    { id: 1, nome: 'Cerveja Pilsen Lata 350ml', categoria: 'Bebidas', precoVenda: 12.0, qtdEstoque: 150, qtdMinima: 30 },
    { id: 2, nome: 'Água Mineral Sem Gás 500ml', categoria: 'Bebidas', precoVenda: 5.0, qtdEstoque: 80, qtdMinima: 20 },
    { id: 3, nome: 'Coxinha de Frango', categoria: 'Salgados', precoVenda: 8.5, qtdEstoque: 50, qtdMinima: 10 },
    { id: 5, nome: 'Amendoim Japonês', categoria: 'Outros', precoVenda: 6.0, qtdEstoque: 0, qtdMinima: 10 },
];

export default function Estoque() {
    const [stock] = useState(MOCK_STOCK);

    return (
        <div className="flex flex-col gap-md h-full">
            <header className="flex justify-between items-center bg-surface p-md rounded-xl shadow-sm border border-outline-variant">
                <div>
                    <h1 className="font-display-sm text-on-surface">Gerenciamento de Estoque</h1>
                    <p className="text-on-surface-variant text-sm">Controle de inventário e gestão de produtos</p>
                </div>
                <button className="btn-primary gap-2 bg-primary">
                    <span className="material-symbols-outlined text-[20px]">add_box</span>
                    NOVO PRODUTO
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-2">
                <div className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
                    <div className="bg-primary-container p-3 rounded-full text-primary"><span className="material-symbols-outlined">inventory_2</span></div>
                    <div>
                        <p className="text-xs text-on-surface-variant font-label-bold uppercase">Total Itens</p>
                        <p className="text-2xl font-bold text-on-surface">345</p>
                    </div>
                </div>
                <div className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
                    <div className="bg-error-container p-3 rounded-full text-error"><span className="material-symbols-outlined">warning</span></div>
                    <div>
                        <p className="text-xs text-on-surface-variant font-label-bold uppercase">Estoque Crítico</p>
                        <p className="text-2xl font-bold text-error">12</p>
                    </div>
                </div>
                <div className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
                    <div className="bg-secondary-container p-3 rounded-full text-secondary"><span className="material-symbols-outlined">production_quantity_limits</span></div>
                    <div>
                        <p className="text-xs text-on-surface-variant font-label-bold uppercase">Esgotados</p>
                        <p className="text-2xl font-bold text-secondary">3</p>
                    </div>
                </div>
                <div className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
                    <div className="bg-surface-variant p-3 rounded-full text-on-surface"><span className="material-symbols-outlined">category</span></div>
                    <div>
                        <p className="text-xs text-on-surface-variant font-label-bold uppercase">Categorias</p>
                        <p className="text-2xl font-bold text-on-surface">8</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-low sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant">Produto / Categoria</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant">Preço</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant text-center">Em Estoque</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant text-right">Ajustar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stock.map(s => {
                                const criticallyLow = s.qtdEstoque <= s.qtdMinima;
                                return (
                                    <tr key={s.id} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/30">
                                        <td className="p-4">
                                            <div className="font-medium text-on-surface">{s.nome}</div>
                                            <div className="text-xs text-on-surface-variant mt-0.5">{s.categoria}</div>
                                        </td>
                                        <td className="p-4 text-on-surface-variant">
                                            {s.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-bold ${s.qtdEstoque === 0 ? 'text-error' : criticallyLow ? 'text-secondary' : 'text-on-surface'}`}>
                                                {s.qtdEstoque} un.
                                            </span>
                                            {criticallyLow && s.qtdEstoque > 0 && <div className="text-[10px] text-secondary">Baixo! (Min: {s.qtdMinima})</div>}
                                        </td>
                                        <td className="p-4 flex gap-2 justify-end">
                                            <button className="btn-secondary p-2 rounded" title="Dar Entrada (+)"><span className="material-symbols-outlined text-[18px]">add</span></button>
                                            <button className="btn-secondary p-2 rounded" title="Dar Saída (-)"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                                            <button className="btn-secondary p-2 rounded ml-2" title="Editar Info"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
