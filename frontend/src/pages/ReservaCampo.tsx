import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../api/api';

// ─── TIPOS ────────────────────────────────────────────────────────────────────
interface Cliente {
    id: number;
    nomeCompleto: string;
    cpf?: string;
    telefone?: string;
}

interface Reserva {
    id: number;
    dataReserva: string;
    horaInicio: string;
    horaFim: string;
    valorTotal: number;
    status: 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA' | 'CONCLUIDA';
    clienteId: number;
    nomeCliente: string;
    ticketId: number | null;
    usuarioId: number;
    criadoEm: string;
}

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
    CONFIRMADA: { label: 'Confirmada', color: 'text-emerald-400 bg-emerald-400/10', icon: 'check_circle' },
    PENDENTE: { label: 'Pendente', color: 'text-amber-400 bg-amber-400/10', icon: 'pending' },
    CONCLUIDA: { label: 'Concluída', color: 'text-sky-400 bg-sky-400/10', icon: 'task_alt' },
    CANCELADA: { label: 'Cancelada', color: 'text-red-400 bg-red-400/10', icon: 'cancel' },
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function ReservaCampo() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        clienteId: '',
        dataReserva: new Date().toISOString().split('T')[0],
        horaInicio: '08:00',
        horaFim: '09:00',
        valorTotal: '',
    });

    // ── Queries ──
    const { data: reservas = [], isLoading: loadingReservas } = useQuery<Reserva[]>({
        queryKey: ['reservasCampo'],
        queryFn: async () => (await api.get('/reservas-campo')).data,
    });

    const { data: clientes = [] } = useQuery<Cliente[]>({
        queryKey: ['clientes'],
        queryFn: async () => (await api.get('/clientes')).data,
    });

    // ── Mutation: criar reserva ──
    const createMutation = useMutation({
        mutationFn: async () => api.post('/reservas-campo', {
            clienteId: Number(form.clienteId),
            dataReserva: form.dataReserva,
            horaInicio: form.horaInicio,
            horaFim: form.horaFim,
            valorTotal: Number(form.valorTotal),
        }),
        onSuccess: (res) => {
            const { reservaId, ticketId } = res.data;
            toast.success(`Reserva #${reservaId} criada! Ticket #${ticketId} aberto automaticamente.`, { duration: 5000 });
            queryClient.invalidateQueries({ queryKey: ['reservasCampo'] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['caixaRelatorio'] });
            setShowModal(false);
            setForm({ clienteId: '', dataReserva: new Date().toISOString().split('T')[0], horaInicio: '08:00', horaFim: '09:00', valorTotal: '' });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error || 'Erro ao criar reserva');
        },
    });

    // ── Mutation: atualizar status ──
    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            api.patch(`/reservas-campo/${id}/status`, { status }),
        onSuccess: () => {
            toast.success('Status atualizado!');
            queryClient.invalidateQueries({ queryKey: ['reservasCampo'] });
            queryClient.invalidateQueries({ queryKey: ['caixaRelatorio'] });
        },
        onError: () => toast.error('Erro ao atualizar status'),
    });

    // ── Cálculo de duração ──
    const calcDuration = (inicio: string, fim: string) => {
        const [h1, m1] = inicio.split(':').map(Number);
        const [h2, m2] = fim.split(':').map(Number);
        const minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (minutos <= 0) return '—';
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        return h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`;
    };

    const totalReservas = reservas.filter(r => r.status === 'CONFIRMADA' || r.status === 'CONCLUIDA')
        .reduce((acc, r) => acc + r.valorTotal, 0);

    return (
        <div className="flex flex-col gap-md h-full max-w-6xl mx-auto w-full">

            {/* ── Header ── */}
            <header className="flex justify-between items-center bg-surface p-md rounded-xl shadow-sm border border-outline-variant">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center border border-emerald-500/30">
                        <span className="material-symbols-outlined text-emerald-400 text-2xl">sports_soccer</span>
                    </div>
                    <div>
                        <h1 className="font-display-sm text-on-surface">Reserva de Campo</h1>
                        <p className="text-on-surface-variant text-sm">Aluguel do campo de futebol — gera atendimento automático</p>
                    </div>
                </div>
                <button
                    id="btn-nova-reserva"
                    onClick={() => setShowModal(true)}
                    className="btn-primary gap-2 shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nova Reserva
                </button>
            </header>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between min-h-[130px]">
                    <p className="text-sm text-on-surface-variant font-label-bold uppercase flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-emerald-400">sports_soccer</span>
                        Total de Reservas
                    </p>
                    <p className="text-display-sm font-bold text-on-surface mt-2">{reservas.length}</p>
                    <div className="text-xs text-on-surface-variant">Todas as reservas registradas</div>
                </div>
                <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between min-h-[130px]">
                    <p className="text-sm text-on-surface-variant font-label-bold uppercase flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-sky-400">confirmation_number</span>
                        Tickets Gerados
                    </p>
                    <p className="text-display-sm font-bold text-sky-400 mt-2">
                        {reservas.filter(r => r.ticketId !== null).length}
                    </p>
                    <div className="text-xs text-on-surface-variant">Atendimentos abertos automaticamente</div>
                </div>
                <div className="bg-primary-container p-lg rounded-xl border border-primary/20 shadow-sm flex flex-col justify-between min-h-[130px] text-primary">
                    <p className="text-sm font-label-bold uppercase flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">monetization_on</span>
                        Receita de Locações
                    </p>
                    <p className="text-display-sm font-bold mt-2">
                        {totalReservas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <div className="text-xs opacity-80">Confirmadas + concluídas</div>
                </div>
            </div>

            {/* ── Tabela de Reservas ── */}
            <div className="flex-1 bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                {loadingReservas ? (
                    <div className="flex items-center justify-center h-48 text-on-surface-variant">
                        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
                    </div>
                ) : reservas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-6xl opacity-20">sports_soccer</span>
                        <p className="text-sm">Nenhuma reserva registrada ainda. Clique em "Nova Reserva".</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-outline-variant text-left text-on-surface-variant text-xs uppercase">
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Cliente</th>
                                    <th className="px-4 py-3">Data</th>
                                    <th className="px-4 py-3">Horário</th>
                                    <th className="px-4 py-3">Duração</th>
                                    <th className="px-4 py-3">Valor</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Ticket</th>
                                    <th className="px-4 py-3">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservas.map((r) => {
                                    const meta = STATUS_META[r.status] ?? STATUS_META['PENDENTE'];
                                    return (
                                        <tr key={r.id} className="border-b border-outline-variant/50 hover:bg-on-surface/5 transition-colors">
                                            <td className="px-4 py-3 text-on-surface-variant font-mono">#{r.id}</td>
                                            <td className="px-4 py-3 font-medium text-on-surface">{r.nomeCliente}</td>
                                            <td className="px-4 py-3 text-on-surface-variant">
                                                {new Date(r.dataReserva + 'T00:00:00').toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-4 py-3 text-on-surface">{r.horaInicio} – {r.horaFim}</td>
                                            <td className="px-4 py-3 text-on-surface-variant">{calcDuration(r.horaInicio, r.horaFim)}</td>
                                            <td className="px-4 py-3 font-semibold text-on-surface">
                                                {r.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                                                    <span className="material-symbols-outlined text-[14px]">{meta.icon}</span>
                                                    {meta.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.ticketId ? (
                                                    <span className="inline-flex items-center gap-1 text-sky-400 text-xs font-semibold">
                                                        <span className="material-symbols-outlined text-[14px]">support_agent</span>
                                                        #{r.ticketId}
                                                    </span>
                                                ) : (
                                                    <span className="text-on-surface-variant text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.status === 'CONFIRMADA' && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => statusMutation.mutate({ id: r.id, status: 'CONCLUIDA' })}
                                                            className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                                            title="Marcar como Concluída"
                                                        >
                                                            Concluir
                                                        </button>
                                                        <button
                                                            onClick={() => statusMutation.mutate({ id: r.id, status: 'CANCELADA' })}
                                                            className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                            title="Cancelar Reserva"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Modal Nova Reserva ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md border border-outline-variant animate-in fade-in zoom-in-95 duration-200">

                        {/* Header modal */}
                        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-400 text-2xl">sports_soccer</span>
                                <h2 className="font-display-xs text-on-surface">Nova Reserva de Campo</h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Aviso: ticket automático */}
                        <div className="mx-6 mt-4 flex items-start gap-2 bg-sky-400/10 border border-sky-400/20 rounded-lg p-3 text-sky-400 text-xs">
                            <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
                            <span>Um <strong>Ticket de Atendimento</strong> será aberto automaticamente ao confirmar a reserva. O valor será lançado no Caixa.</span>
                        </div>

                        {/* Formulário */}
                        <div className="p-6 flex flex-col gap-4">

                            {/* Cliente */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="sel-cliente" className="text-xs font-semibold text-on-surface-variant uppercase">Cliente *</label>
                                <select
                                    id="sel-cliente"
                                    value={form.clienteId}
                                    onChange={e => setForm(f => ({ ...f, clienteId: e.target.value }))}
                                    className="bg-surface-variant border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">— Selecione um cliente —</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>{c.nomeCompleto}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Data */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="inp-data" className="text-xs font-semibold text-on-surface-variant uppercase">Data da Reserva *</label>
                                <input
                                    id="inp-data"
                                    type="date"
                                    value={form.dataReserva}
                                    onChange={e => setForm(f => ({ ...f, dataReserva: e.target.value }))}
                                    className="bg-surface-variant border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            {/* Horários */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="inp-inicio" className="text-xs font-semibold text-on-surface-variant uppercase">Hora Início *</label>
                                    <input
                                        id="inp-inicio"
                                        type="time"
                                        value={form.horaInicio}
                                        onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))}
                                        className="bg-surface-variant border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="inp-fim" className="text-xs font-semibold text-on-surface-variant uppercase">Hora Fim *</label>
                                    <input
                                        id="inp-fim"
                                        type="time"
                                        value={form.horaFim}
                                        onChange={e => setForm(f => ({ ...f, horaFim: e.target.value }))}
                                        className="bg-surface-variant border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            {/* Duração calculada */}
                            {form.horaInicio && form.horaFim && (
                                <p className="text-xs text-on-surface-variant -mt-2">
                                    ⏱ Duração calculada: <strong className="text-on-surface">{calcDuration(form.horaInicio, form.horaFim)}</strong>
                                </p>
                            )}

                            {/* Valor */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="inp-valor" className="text-xs font-semibold text-on-surface-variant uppercase">Valor Total (R$) *</label>
                                <input
                                    id="inp-valor"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0,00"
                                    value={form.valorTotal}
                                    onChange={e => setForm(f => ({ ...f, valorTotal: e.target.value }))}
                                    className="bg-surface-variant border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            {/* Botões */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-on-surface/5 text-sm transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    id="btn-confirmar-reserva"
                                    disabled={!form.clienteId || !form.dataReserva || !form.valorTotal || createMutation.isPending}
                                    onClick={() => createMutation.mutate()}
                                    className="flex-1 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {createMutation.isPending ? (
                                        <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Criando...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-[18px]">check</span> Confirmar Reserva</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}
