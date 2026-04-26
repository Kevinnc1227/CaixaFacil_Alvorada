import React, { useState } from 'react';

const MOCK_TICKETS = [
    { id: 1, titulo: 'Esqueci a senha do operador 2', categoria: 'SENHA', status: 'ABERTO', data: 'Hoje, 14:30' },
    { id: 2, titulo: 'Produto não aparece no PDV', categoria: 'SISTEMA', status: 'EM_ANDAMENTO', data: 'Hoje, 10:15' },
    { id: 3, titulo: 'Sugestão: Atalhos no teclado', categoria: 'SUGESTAO', status: 'RESOLVIDO', data: 'Ontem, 16:45' },
];

export default function Suporte() {
    const [tickets] = useState(MOCK_TICKETS);
    const [selecionado, setSelecionado] = useState<number | null>(null);

    return (
        <div className="flex flex-col md:flex-row gap-md h-full">
            <div className="flex-1 flex flex-col bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden h-full">
                <header className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                    <div>
                        <h2 className="font-display-xs text-on-surface">Meus Tickets</h2>
                        <p className="text-xs text-on-surface-variant">Histórico de chamados de suporte</p>
                    </div>
                    <button className="btn-primary text-sm px-4 py-2">NOVO TICKET</button>
                </header>
                <div className="flex-1 overflow-y-auto">
                    {tickets.map(t => (
                        <div
                            key={t.id}
                            onClick={() => setSelecionado(t.id)}
                            className={`p-md border-b border-outline-variant/30 cursor-pointer transition-colors ${selecionado === t.id ? 'bg-surface-container-high border-l-4 border-l-primary' : 'hover:bg-surface-container-lowest'}`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className="font-label-bold text-on-surface">{t.titulo}</span>
                                <span className="text-xs text-on-surface-variant">{t.data}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${t.status === 'ABERTO' ? 'bg-error-container text-error' : t.status === 'RESOLVIDO' ? 'bg-primary-container text-primary' : 'bg-secondary-container text-secondary'}`}>
                                    {t.status.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-on-surface-variant font-lexend">#{t.id} • {t.categoria}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-[2] flex flex-col bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden h-full">
                {!selecionado ? (
                    <div className="flex-1 flex items-center justify-center text-on-surface-variant opacity-50 flex-col gap-4">
                        <span className="material-symbols-outlined text-[64px]">forum</span>
                        <p className="font-label-bold">Selecione um ticket para ver as interações</p>
                    </div>
                ) : (
                    <>
                        <header className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                            <div>
                                <h3 className="font-headline-sm text-on-surface">{tickets.find(t => t.id === selecionado)?.titulo}</h3>
                                <p className="text-xs text-on-surface-variant mt-1">Ticket #{selecionado} • Aberto hoje</p>
                            </div>
                        </header>
                        <div className="flex-1 overflow-y-auto p-md space-y-4 bg-surface-container-lowest">
                            {/* Mock Chat */}
                            <div className="flex flex-col items-start gap-1 max-w-[80%]">
                                <span className="text-[10px] text-on-surface-variant font-bold ml-1">Você</span>
                                <div className="bg-surface-container border border-outline-variant p-3 rounded-2xl rounded-tl-sm text-sm text-on-surface">
                                    Estou com o operador da conta fechada no terminal X e ele n lembra a senha... tem como resetar rápido? A fila ta enorme.
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 max-w-[80%] ml-auto">
                                <span className="text-[10px] text-secondary font-bold mr-1">Suporte Técnico</span>
                                <div className="bg-secondary-container text-white p-3 rounded-2xl rounded-tr-sm text-sm">
                                    Olá! Já estou verificando. Vou resetar para 'alvorada123' provisoriamente, peça para ele logar e alterar em seguida nas configurações. OK?
                                </div>
                            </div>
                        </div>
                        <div className="p-md border-t border-outline-variant bg-surface">
                            <div className="flex gap-2">
                                <input className="input flex-1" placeholder="Digite sua resposta..." />
                                <button className="btn-primary p-3 rounded-lg"><span className="material-symbols-outlined">send</span></button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
