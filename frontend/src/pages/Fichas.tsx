import React, { useState } from 'react';

const MOCK_MEMBER_TABS = [
    { id: 1, nome: 'João Pedro da Silva', cpf: '000.000.000-00', totalAcumulado: 45.00, status: 'ABERTA' },
    { id: 2, nome: 'Maria Oliveira', cpf: '111.111.111-11', totalAcumulado: 120.50, status: 'ABERTA' },
    { id: 3, nome: 'Carlos Souza', cpf: '222.222.222-22', totalAcumulado: 0.00, status: 'PAGA' },
    { id: 4, nome: 'Ana Costa', cpf: '333.333.333-33', totalAcumulado: 15.00, status: 'ABERTA' },
];

export default function Fichas() {
    const [fichas] = useState(MOCK_MEMBER_TABS);

    return (
        <div className="flex flex-col gap-md h-full">
            <header className="flex justify-between items-center bg-surface p-md rounded-xl shadow-sm border border-outline-variant">
                <div>
                    <h1 className="font-display-sm text-on-surface">Fichas de Clientes</h1>
                    <p className="text-on-surface-variant text-sm">Controle de contas e pagamentos pendentes</p>
                </div>
                <button className="btn-primary gap-2">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    NOVO CLIENTE
                </button>
            </header>

            <div className="flex-1 bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
                <div className="p-md flex items-center gap-4 bg-surface-container-low border-b border-outline-variant">
                    <div className="flex items-center bg-surface rounded-md px-3 py-2 border border-outline-variant flex-1 max-w-sm">
                        <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                        <input className="bg-transparent border-none outline-none w-full text-on-surface text-sm" placeholder="Buscar por nome ou CPF..." />
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary text-sm">Todas</button>
                        <button className="btn-primary text-sm px-4 py-2 bg-secondary text-white rounded-md shadow">Em Aberto</button>
                        <button className="btn-secondary text-sm">Pagas</button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-lowest sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant">Cliente</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant">CPF / Doc</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant">Status</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant text-right">Acumulado</th>
                                <th className="p-4 font-label-bold text-on-surface-variant border-b border-outline-variant text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fichas.map(f => (
                                <tr key={f.id} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/30">
                                    <td className="p-4 font-medium text-on-surface flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center text-xs font-bold">
                                            {f.nome.charAt(0)}
                                        </div>
                                        {f.nome}
                                    </td>
                                    <td className="p-4 text-on-surface-variant text-sm">{f.cpf}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${f.status === 'ABERTA' ? 'bg-error-container text-error' : 'bg-primary-container text-primary'}`}>
                                            {f.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-headline-sm text-on-surface">
                                        {f.totalAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="p-4 text-center">
                                        {f.status === 'ABERTA' && (
                                            <button className="btn-primary text-xs py-1.5 px-3 bg-secondary hover:bg-secondary/90">
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
        </div>
    );
}
