import React from 'react';

export default function Caixa() {
    return (
        <div className="flex flex-col gap-md h-full max-w-5xl mx-auto w-full">
            <header className="flex justify-between items-center bg-surface p-md rounded-xl shadow-sm border border-outline-variant">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
                    </div>
                    <div>
                        <h1 className="font-display-sm text-on-surface">Fechamento de Caixa</h1>
                        <p className="text-on-surface-variant text-sm">Resultados do dia: {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
                <button className="btn-primary gap-2 shadow-lg shadow-primary/20 text-lg px-8">
                    <span className="material-symbols-outlined">lock_clock</span>
                    FECHAR CAIXA AGORA
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                {/* Card Vendas */}
                <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between min-h-[160px]">
                    <div>
                        <p className="text-sm text-on-surface-variant font-label-bold uppercase flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">point_of_sale</span> Vendas Diretas (PDV)
                        </p>
                        <p className="text-display-sm font-bold text-on-surface mt-2">R$ 1.250,00</p>
                    </div>
                    <div className="text-xs text-on-surface-variant">Valor recebido à vista no balcão</div>
                </div>

                {/* Card Fichas */}
                <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between min-h-[160px]">
                    <div>
                        <p className="text-sm text-on-surface-variant font-label-bold uppercase flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-secondary">confirmation_number</span> Fichas Recebidas
                        </p>
                        <p className="text-display-sm font-bold text-secondary mt-2">R$ 480,50</p>
                    </div>
                    <div className="text-xs text-on-surface-variant">Fichas de clientes quitadas hoje</div>
                </div>

                {/* Card Total */}
                <div className="bg-primary-container p-lg rounded-xl border border-primary/20 shadow-sm flex flex-col justify-between min-h-[160px] text-primary">
                    <div>
                        <p className="text-sm font-label-bold uppercase flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">monetization_on</span> Total Bruto Entradas
                        </p>
                        <p className="text-display-md font-bold mt-2">R$ 1.730,50</p>
                    </div>
                    <div className="text-xs opacity-80">Soma das vendas diretas + fichas</div>
                </div>
            </div>

            <div className="flex-1 bg-surface rounded-xl shadow-sm border border-outline-variant p-md flex flex-col items-center justify-center text-center mt-4">
                <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-4">info</span>
                <p className="text-on-surface-variant font-body-lg max-w-md">
                    O fechamento de caixa irá consolidar as vendas e travar as operações do dia. Certifique-se de que nenhum cliente com ficha aberta está aguardando fechamento antes de prosseguir.
                </p>
            </div>
        </div>
    );
}
