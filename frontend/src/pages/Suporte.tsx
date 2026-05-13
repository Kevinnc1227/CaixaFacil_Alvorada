import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/api';

const CATEGORIAS_TICKET = ['Bug', 'Sugestão', 'Financeiro', 'Estoque', 'Outros'];

export default function Suporte() {
    const queryClient = useQueryClient();
    const [selecionado, setSelecionado] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [showNovoTicket, setShowNovoTicket] = useState(false);
    const [ticketForm, setTicketForm] = useState({ titulo: '', categoria: 'Bug', descricao: '' });
    const currentUser = JSON.parse(localStorage.getItem('caixafacil_user') || localStorage.getItem('alvorada_user') || '{}');

    const { data: tickets = [] } = useQuery({
        queryKey: ['tickets'],
        queryFn: async () => { const res = await api.get('/tickets'); return res.data; }
    });

    const { data: messages = [] } = useQuery({
        queryKey: ['tickets', selecionado, 'mensagens'],
        queryFn: async () => { if (!selecionado) return []; const res = await api.get(`/tickets/${selecionado}/mensagens`); return res.data; },
        enabled: !!selecionado,
        refetchInterval: selecionado ? 5000 : false
    });

    const criarTicketMutation = useMutation({
        mutationFn: async () => api.post('/tickets', ticketForm),
        onSuccess: (res) => { toast.success('Ticket aberto!'); queryClient.invalidateQueries({ queryKey: ['tickets'] }); setSelecionado(res.data.id); setShowNovoTicket(false); setTicketForm({ titulo: '', categoria: 'Bug', descricao: '' }); },
        onError: () => toast.error('Erro ao abrir ticket.')
    });

    const sendMessageMutation = useMutation({
        mutationFn: async () => { if (!newMessage.trim()) return; return api.post(`/tickets/${selecionado}/mensagens`, { mensagem: newMessage }); },
        onSuccess: () => { setNewMessage(''); queryClient.invalidateQueries({ queryKey: ['tickets', selecionado, 'mensagens'] }); queryClient.invalidateQueries({ queryKey: ['tickets'] }); },
        onError: () => toast.error('Erro ao enviar mensagem.')
    });

    const fecharTicketMutation = useMutation({
        mutationFn: async (id: number) => api.post(`/tickets/${id}/fechar`, {}),
        onSuccess: () => { toast.success('Ticket resolvido!'); queryClient.invalidateQueries({ queryKey: ['tickets'] }); },
        onError: () => toast.error('Erro ao fechar ticket.')
    });

    const selectedTicket = tickets.find((t: any) => t.id === selecionado);

    const statusBadge = (status: string) => {
        if (status === 'ABERTO') return 'cf-badge cf-badge-red';
        if (status === 'EM_ANDAMENTO') return 'cf-badge cf-badge-yellow';
        return 'cf-badge cf-badge-green';
    };

    return (
        <div className="flex flex-col md:flex-row gap-5 h-full">
            {/* Ticket List */}
            <div className="w-full md:w-72 lg:w-80 flex flex-col cf-card overflow-hidden flex-shrink-0">
                <div className="p-4 border-b border-cf-border bg-cf-surface-high flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="font-sans font-bold text-cf-text">Chamados</h2>
                        <p className="text-xs text-cf-muted font-mono mt-0.5">{tickets.filter((t: any) => t.status !== 'RESOLVIDO').length} abertos</p>
                    </div>
                    <button onClick={() => setShowNovoTicket(true)} className="cf-btn cf-btn-primary text-xs py-2 px-3 min-h-0 h-8">
                        + NOVO
                    </button>
                </div>
                <div className="flex-1 overflow-auto cf-scroll">
                    {tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-cf-muted/40 p-6 text-center gap-3">
                            <span className="material-symbols-outlined text-4xl">forum</span>
                            <p className="text-xs font-mono uppercase tracking-wider">Nenhum chamado aberto</p>
                        </div>
                    ) : tickets.map((t: any) => (
                        <button key={t.id} onClick={() => setSelecionado(t.id)} className={`w-full text-left p-4 border-b border-cf-border/50 transition-all ${selecionado === t.id ? 'bg-cf-surface-high border-l-2 border-l-cf-accent' : 'hover:bg-cf-surface-high/50'}`}>
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <span className="font-medium text-cf-text text-sm line-clamp-1 flex-1">{t.titulo}</span>
                                <span className="text-[10px] text-cf-muted font-mono flex-shrink-0">#{t.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={statusBadge(t.status)}>{t.status?.replace('_', ' ')}</span>
                                <span className="text-[10px] text-cf-muted">{t.categoria}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col cf-card overflow-hidden min-h-0">
                {!selecionado ? (
                    <div className="flex-1 flex items-center justify-center flex-col gap-4 text-cf-muted/40">
                        <span className="material-symbols-outlined text-[64px]">forum</span>
                        <p className="font-mono text-xs uppercase tracking-widest">Selecione um chamado para ver as mensagens</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-cf-border bg-cf-surface-high flex items-center justify-between flex-shrink-0">
                            <div>
                                <h3 className="font-sans font-bold text-cf-text line-clamp-1">{selectedTicket?.titulo}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={statusBadge(selectedTicket?.status)}>{selectedTicket?.status?.replace('_', ' ')}</span>
                                    <span className="text-xs text-cf-muted font-mono">#{selecionado} · {selectedTicket?.categoria}</span>
                                </div>
                            </div>
                            {selectedTicket?.status !== 'RESOLVIDO' && selecionado !== null && (
                                <button onClick={() => fecharTicketMutation.mutate(selecionado)} disabled={fecharTicketMutation.isPending}
                                    className="cf-btn cf-btn-ghost text-xs py-2 px-3 min-h-0 h-8 text-cf-green hover:border-cf-green">
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    RESOLVER
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto cf-scroll p-4 space-y-4 bg-cf-bg">
                            {messages.length === 0 ? (
                                <div className="text-center text-cf-muted/40 py-8">
                                    <p className="font-mono text-xs uppercase tracking-wider">Nenhuma mensagem ainda</p>
                                </div>
                            ) : messages.map((m: any) => {
                                const isMe = m.autorId === currentUser?.id;
                                return (
                                    <div key={m.id} className={`flex flex-col gap-1 max-w-[75%] ${isMe ? '' : 'items-end ml-auto'}`}>
                                        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isMe ? 'text-cf-muted ml-1' : 'text-cf-accent mr-1'}`}>
                                            {isMe ? (currentUser?.nome || 'Você') : 'Suporte K-HUB'}
                                        </span>
                                        <div className={`p-3 text-sm rounded-xl leading-relaxed ${isMe
                                            ? 'bg-cf-surface-high border border-cf-border rounded-tl-none text-cf-text'
                                            : 'bg-cf-accent text-cf-accent-text rounded-tr-none'}`}>
                                            {m.mensagem}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedTicket?.status !== 'RESOLVIDO' && (
                            <div className="p-4 border-t border-cf-border bg-cf-surface flex-shrink-0">
                                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); sendMessageMutation.mutate(); }}>
                                    <input className="cf-input flex-1" placeholder="Digite sua mensagem..." value={newMessage} onChange={e => setNewMessage(e.target.value)} disabled={sendMessageMutation.isPending} />
                                    <button type="submit" disabled={!newMessage.trim() || sendMessageMutation.isPending} className="cf-btn cf-btn-primary px-4 min-h-0 h-10 flex-shrink-0">
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
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="cf-card-elevated w-full max-w-md overflow-hidden relative">
                        <div className="h-1 w-full bg-cf-accent absolute top-0 left-0" />
                        <div className="flex items-center justify-between p-5 border-b border-cf-border">
                            <div>
                                <h2 className="font-sans text-xl font-bold text-cf-text tracking-tight">Abrir Chamado</h2>
                                <p className="text-xs text-cf-muted font-mono tracking-wider uppercase mt-1">Nossa equipe irá responder em breve</p>
                            </div>
                            <button onClick={() => setShowNovoTicket(false)} className="text-cf-muted hover:text-cf-red transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="ticket-titulo" className="text-xs font-mono uppercase tracking-widest text-cf-muted">Assunto *</label>
                                <input id="ticket-titulo" className="cf-input" placeholder="Ex: Produto X com estoque incorreto" value={ticketForm.titulo} onChange={e => setTicketForm(f => ({ ...f, titulo: e.target.value }))} autoFocus />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="ticket-categoria" className="text-xs font-mono uppercase tracking-widest text-cf-muted">Categoria</label>
                                <select id="ticket-categoria" className="cf-input" value={ticketForm.categoria} onChange={e => setTicketForm(f => ({ ...f, categoria: e.target.value }))}>
                                    {CATEGORIAS_TICKET.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="ticket-descricao" className="text-xs font-mono uppercase tracking-widest text-cf-muted">Descrição *</label>
                                <textarea id="ticket-descricao" className="cf-input h-28 resize-none" placeholder="Descreva o problema com o máximo de detalhes..." value={ticketForm.descricao} onChange={e => setTicketForm(f => ({ ...f, descricao: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-cf-border bg-cf-surface-high/50">
                            <button onClick={() => setShowNovoTicket(false)} className="cf-btn cf-btn-ghost flex-1">Cancelar</button>
                            <button onClick={() => criarTicketMutation.mutate()} disabled={!ticketForm.titulo || !ticketForm.descricao || criarTicketMutation.isPending} className="cf-btn cf-btn-primary flex-1">
                                {criarTicketMutation.isPending ? 'Abrindo...' : 'Abrir Chamado'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
