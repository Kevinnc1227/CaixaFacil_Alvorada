 useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../api/api';

export default function Fichas() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Todas');

    const { data: fichasData = [], isLoading } = useQuery({
        queryKey: ['fichas'],
        queryFn: async () => {
            const res = await api.get('/fichas/abertas/lista');
            return res.data;
        }
    });

    const receivedMutation = useMutation({
        mutationFn: async (id: number) => {
            // Assume DINHEIRO for simple MVP
            await api.post(`/fichas/fichas/${id}/fechar`, { formaPagamento: 'DINHEIRO' });
        },
        onSuccess: () => {
            toast.success("Conta fechada e paga com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['fichas'] });
        },
        onError: () => toast.error("Não foi possível fechar a conta.")
    });

    const filteredFichas = fichasData.filter((f: any) => {
        if (filter === 'Em Aberto' && f.status !== 'ABERTA') return false;
        if (filter === 'Pagas' && f.status === 'PAGA') return false;
        if (search) {
            return encodeURIComponent(f.nome || '').toLowerCase().includes(encodeURIComponent(search).toLowerCase()) || (f.cpf || '').includes(search);
        }
        return true;
    });

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
                        <input
                            className="bg-transparent border-none outline-none w-full text-on-surface text-sm"
                            placeholder="Buscar por nome ou CPF..."
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setFilter('Todas')} className={`btn-secondary text-sm ${filter === 'Todas' ? 'bg-secondary text-white' : ''}`}>Todas</button>
                        <button onClick={() => setFilter('Em Aberto')} className={`btn-secondary text-sm px-4 py-2 rounded-md ${filter === 'Em Aberto' ? 'bg-secondary text-white shadow' : ''}`}>Em Aberto</button>
                        <button onClick={() => setFilter('Pagas')} className={`btn-secondary text-sm ${filter === 'Pagas' ? 'bg-secondary text-white' : ''}`}>Pagas</button>
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
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center">Carregando fichas...</td></tr>
                            ) : filteredFichas.map((f: any) => (
                                <tr key={f.id} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/30">
                                    <td className="p-4 font-medium text-on-surface flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center text-xs font-bold uppercase">
                                            {(f.nome || "?").charAt(0)}
                                        </div>
                                        {f.nome}
                                    </td>
                                    <td className="p-4 text-on-surface-variant text-sm">{f.cpf}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${f.status === 'ABERTA' ? 'bg-error-container text-error' : 'bg-primary-container text-primary'}`}>
                                            {f.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-headline-sm text-on-surface">
                                        {f.totalAcumulado?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="p-4 text-center">
                                        {f.status === 'ABERTA' && (
                                            <button
                                                onClick={() => receivedMutation.mutate(f.id)}
                                                disabled={receivedMutation.isPending}
                                                className="btn-primary text-xs py-1.5 px-3 bg-secondary hover:bg-secondary/90 disabled:opacity-50"
                                            >
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
