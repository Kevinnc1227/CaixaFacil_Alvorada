 useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../api/api';

export default function Suporte() {
    const queryClient = useQueryClient();
    const [selecionado, setSelecionado] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const currentUser = JSON.parse(localStorage.getItem('alvorada_user') || '{}');

    // 1. Fetch tickets list
    const { data: tickets = [] } = useQuery({
        queryKey: ['tickets'],
        queryFn: async () => {
            const res = await api.get('/tickets');
            return res.data;
        }
    });

    // 2. Fetch messages for selected ticket
    const { data: messages = [] } = useQuery({
        queryKey: ['tickets', selecionado, 'mensagens'],
        queryFn: async () => {
            if (!selecionado) return [];
            const res = await api.get(`/tickets/${selecionado}/mensagens`);
            return res.data;
        },
        enabled: !!selecionado
    });

    // 3. Send message mutation
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
                    {tickets.map((t: any) => (
                        <div
                            key={t.id}
                            onClick={() => setSelecionado(t.id)}
                            className={`p-md border-b border-outline-variant/30 cursor-pointer transition-colors ${selecionado === t.id ? 'bg-surface-container-high border-l-4 border-l-primary' : 'hover:bg-surface-container-lowest'}`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className="font-label-bold text-on-surface">{t.titulo}</span>
                                <span className="text-xs text-on-surface-variant flex-shrink-0">
                                    {new Date(t.criadoEm || t.atualizadoEm || new Date()).toLocaleDateString('pt-BR')}
                                </span>
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
                                <h3 className="font-headline-sm text-on-surface">{tickets.find((t: any) => t.id === selecionado)?.titulo}</h3>
                                <p className="text-xs text-on-surface-variant mt-1">Ticket #{selecionado}</p>
                            </div>
                        </header>
                        <div className="flex-1 overflow-y-auto p-md space-y-4 bg-surface-container-lowest">
                            {/* Mock Chat */}
                            {messages.map((m: any) => {
                                const isMe = m.autorId === currentUser?.id;
                                return (
                                    <div key={m.id} className={`flex flex-col gap-1 max-w-[80%] ${isMe ? 'items-start' : 'items-end ml-auto'}`}>
                                        <span className={`text-[10px] font-bold ${isMe ? 'text-on-surface-variant ml-1' : 'text-secondary mr-1'}`}>
                                            {isMe ? 'Você' : 'Suporte'}
                                        </span>
                                        <div className={`p-3 text-sm rounded-2xl ${isMe ? 'bg-surface-container border border-outline-variant rounded-tl-sm text-on-surface' : 'bg-secondary-container text-white rounded-tr-sm'}`}>
                                            {m.mensagem}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-md border-t border-outline-variant bg-surface">
                            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); sendMessageMutation.mutate(); }}>
                                <input
                                    className="input flex-1"
                                    placeholder="Digite sua resposta..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    disabled={sendMessageMutation.isPending}
                                />
                                <button type="submit" disabled={sendMessageMutation.isPending} className="btn-primary p-3 rounded-lg flex-shrink-0 disabled:opacity-50">
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
