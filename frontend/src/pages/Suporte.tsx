import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../api/api';

const CATEGORIAS_TICKET = ['Bug', 'Sugestão', 'Financeiro', 'Estoque', 'Outros'];

export default function Suporte() {
    const queryClient = useQueryClient();
    const [selecionado, setSelecionado] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [showNovoTicket, setShowNovoTicket] = useState(false);
    const [ticketForm, setTicketForm] = useState({ titulo: '', categoria: 'Bug', descricao: '' });
    const currentUser = JSON.parse(localStorage.getItem('alvorada_user') || '{}');

    const { data: tickets = [] } = useQuery({
        queryKey: ['tickets'],
        queryFn: async () => {
            const res = await api.get('/tickets');
            return res.data;
        }
    });

    const { data: messages = [] } = useQuery({
        queryKey: ['tickets', selecionado, 'mensagens'],
        queryFn: async () => {
            if (!selecionado) return [];
            const res = await api.get(`/tickets/${selecionado}/mensagens`);
            return res.data;
        },
        enabled: !!selecionado,
        refetchInterval: selecionado ? 5000 : false // auto-refresh mensagens a cada 5s
    });

    const criarTicketMutation = useMutation({
        mutationFn: async () => {
            return api.post('/tickets', ticketForm);
        },
        onSuccess: (res) => {
            toast.success('Ticket aberto com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setSelecionado(res.data.id);
            setShowNovoTicket(false);
            setTicketForm({ titulo: '', categoria: 'Bug', descricao: '' });
        },
        onError: () => toast.error('Erro ao abrir ticket.')
    });

    const sendMessageMutation = useMutation({
        mutationFn: async () => {
            if (!newMessage.trim()) return;
            return api.post(`/tickets/${selecionado}/mensagens`, { mensagem: newMessage });
        },
        onSuccess: () => {
            setNewMessage('');
            queryClient.invalidateQueries({ queryKey: ['tickets', selecionado, 'mensagens'] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: () => toast.error('Erro ao enviar mensagem.')
    });

    const fecharTicketMutation = useMutation({
        mutationFn: async (id: number) => {
            return api.post(`/tickets/${id}/fechar`, {});
        },
        onSuccess: () => {
            toast.success('Ticket marcado como resolvido!');
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: () => toast.error('Erro ao fechar ticket.')
    });

    const selectedTicket = tickets.find((t: any) => t.id === selecionado);

    const statusColor: Record<string, string> = {
        ABERTO: 'bg-error-container text-error',
        EM_ANDAMENTO: 'bg-secondary-container text-secondary',
        RESOLVIDO: 'bg-primary-container text-primary',
    };

    return (
        <div className="flex flex-col md:flex-row gap-md h-full">
            {/* Ticket List */}
            <div className="flex-1 flex flex-col bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden max-w-xs md:max-w-sm">
                <header className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low flex-shrink-0">
                    <div>
                        <h2 className="font-display-xs text-on-surface">Tickets</h2>
                        <p className="text-xs text-on-surface-variant">{tickets.filter((t: any) => t.status !== 'RESOLVIDO').length} abertos</p>
                    </div>
                    <button onClick={() => setShowNovoTicket(true)} className="btn-primary text-sm px-4 py-2">
                        + NOVO
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-40 p-4 text-center">
                            <span className="material-symbols-outlined text-4xl mb-2">forum</span>
                            <p className="text-sm">Nenhum ticket. Abra um chamado clicando em "+ Novo".</p>
                        </div>
                    ) : tickets.map((t: any) => (
                        <div
                            key={t.id}
                            onClick={() => setSelecionado(t.id)}
                            className={`p-md border-b border-outline-variant/30 cursor-pointer transition-colors ${selecionado === t.id
                                ? 'bg-surface-container-high border-l-4 border-l-secondary'
                                : 'hover:bg-surface-container-lowest'}`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className="font-label-bold text-on-surface line-clamp-1 flex-1 pr-2">{t.titulo}</span>
                                <span className="text-xs text-on-surface-variant flex-shrink-0">
                                    {new Date(t.atualizadoEm || t.criadoEm || Date.now()).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[t.status] || 'bg-surface-variant text-on-surface-variant'}`}>
                                    {t.status?.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-on-surface-variant">#{t.id} • {t.categoria}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Panel */}
            <div className="flex-[2] flex flex-col bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                {!selecionado ? (
                    <div className="flex-1 flex items-center justify-center text-on-surface-variant opacity-50 flex-col gap-4">
                        <span className="material-symbols-outlined text-[64px]">forum</span>
                        <p className="font-label-bold">Selecione um ticket para ver as interações</p>
                    </div>
                ) : (
                    <>
                        <header className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center flex-shrink-0">
                            <div>
                                <h3 className="font-headline-sm text-on-surface line-clamp-1">{selectedTicket?.titulo}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[selectedTicket?.status] || ''}`}>
                                        {selectedTicket?.status?.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-on-surface-variant">#{selecionado} • {selectedTicket?.categoria}</span>
                                </div>
                            </div>
                            {selectedTicket?.status !== 'RESOLVIDO' && (
                                <button
                                    onClick={() => fecharTicketMutation.mutate(selecionado)}
                                    disabled={fecharTicketMutation.isPending}
                                    className="btn-secondary text-xs px-3 py-2 hover:bg-primary-container hover:text-primary disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[16px] mr-1">check_circle</span>
                                    Resolver
                                </button>
                            )}
                        </header>

                        <div className="flex-1 overflow-y-auto p-md space-y-4 bg-surface-container-lowest">
                            {messages.length === 0 ? (
                                <div className="text-center text-on-surface-variant opacity-40 py-6 text-sm">Nenhuma mensagem ainda...</div>
                            ) : messages.map((m: any) => {
                                const isMe = m.autorId === currentUser?.id;
                                return (
                                    <div key={m.id} className={`flex flex-col gap-1 max-w-[80%] ${isMe ? 'items-start' : 'items-end ml-auto'}`}>
                                        <span className={`text-[10px] font-bold ${isMe ? 'text-on-surface-variant ml-1' : 'text-secondary mr-1'}`}>
                                            {isMe ? (currentUser?.nome || 'Você') : 'Suporte'}
                                        </span>
                                        <div className={`p-3 text-sm rounded-2xl leading-relaxed ${isMe
                                            ? 'bg-surface-container border border-outline-variant rounded-tl-sm text-on-surface'
                                            : 'bg-secondary text-white rounded-tr-sm'}`}>
                                            {m.mensagem}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedTicket?.status !== 'RESOLVIDO' && (
                            <div className="p-md border-t border-outline-variant bg-surface flex-shrink-0">
                                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); sendMessageMutation.mutate(); }}>
                                    <input
                                        className="input flex-1"
                                        placeholder="Digite sua mensagem..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        disabled={sendMessageMutation.isPending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                                        className="btn-primary p-3 rounded-lg flex-shrink-0 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined">send</span>
                                    </button>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Novo Ticket */}
            {showNovoTicket && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-md border-b border-outline-variant">
                            <h2 className="font-headline-sm text-on-surface">Abrir Novo Ticket</h2>
                            <button onClick={() => setShowNovoTicket(false)} className="text-on-surface-variant hover:text-error p-2 rounded-lg transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-md flex flex-col gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-bold text-on-surface text-sm">Título / Assunto *</label>
                                <input
                                    className="input"
                                    placeholder="Ex: Produto X com estoque incorreto"
                                    value={ticketForm.titulo}
                                    onChange={e => setTicketForm(f => ({ ...f, titulo: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-bold text-on-surface text-sm">Categoria</label>
                                <select
                                    className="input"
                                    value={ticketForm.categoria}
                                    onChange={e => setTicketForm(f => ({ ...f, categoria: e.target.value }))}
                                >
                                    {CATEGORIAS_TICKET.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-bold text-on-surface text-sm">Descrição *</label>
                                <textarea
                                    className="input h-28 resize-none"
                                    placeholder="Descreva o problema com o máximo de detalhes possíveis..."
                                    value={ticketForm.descricao}
                                    onChange={e => setTicketForm(f => ({ ...f, descricao: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex gap-md p-md border-t border-outline-variant">
                            <button onClick={() => setShowNovoTicket(false)} className="btn-secondary flex-1">Cancelar</button>
                            <button
                                onClick={() => criarTicketMutation.mutate()}
                                disabled={!ticketForm.titulo || !ticketForm.descricao || criarTicketMutation.isPending}
                                className="btn-primary flex-1 disabled:opacity-50"
                            >
                                {criarTicketMutation.isPending ? 'Abrindo...' : 'Abrir Ticket'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
