import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/api';

export default function Caixa() {
    const queryClient = useQueryClient();

    const { data: relatorio, isLoading } = useQuery({
        queryKey: ['caixaRelatorio'],
        queryFn: async () => { const res = await api.get('/caixa/relatorio'); return res.data?.resumoFinanceiro || {}; }
    });

    const closeMutation = useMutation({
        mutationFn: async () => api.post('/caixa/fechar', { totalVendas: relatorio.vendasDiretas, totalFichas: relatorio.recebidoFichas }),
        onSuccess: () => { toast.success('Caixa fechado!'); queryClient.invalidateQueries({ queryKey: ['caixaRelatorio'] }); },
        onError: () => toast.error('Erro ao fechar caixa (requer permissão admin).')
    });

    const fmt = (val: number | undefined) => (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="flex flex-col gap-5 h-full max-w-5xl mx-auto w-full">
            {/* Header */}
            <header className="cf-page-header flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="cf-page-icon"><span className="material-symbols-outlined text-2xl">account_balance_wallet</span></div>
                    <div>
                        <h1 className="font-sans text-xl font-bold text-cf-text tracking-tight">Fechamento de Caixa</h1>
                        <p className="text-cf-muted text-xs font-mono uppercase tracking-widest mt-0.5 capitalize">{today}</p>
                    </div>
                </div>
                <button
                    onClick={() => closeMutation.mutate()}
                    disabled={closeMutation.isPending || isLoading}
                    className="cf-btn cf-btn-primary px-8 text-base"
                >
                    <span className="material-symbols-outlined">lock_clock</span>
                    {closeMutation.isPending ? 'FECHANDO...' : 'FECHAR CAIXA'}
                </button>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-shrink-0">
                {/* Vendas Diretas */}
                <div className="cf-card p-6 flex flex-col justify-between min-h-[160px]">
                    <div>
                        <p className="text-xs font-mono uppercase tracking-widest text-cf-muted flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
                            Vendas Diretas (PDV)
                        </p>
                        <p className="cf-price-lg mt-3">
                            {isLoading ? <span className="cf-skeleton h-8 w-36 block rounded" /> : fmt(relatorio?.vendasDiretas)}
                        </p>
                    </div>
                    <div className="text-xs text-cf-muted font-mono">Valor recebido à vista no balcão</div>
                </div>

                {/* Fichas */}
                <div className="cf-card p-6 flex flex-col justify-between min-h-[160px]">
                    <div>
                        <p className="text-xs font-mono uppercase tracking-widest text-cf-muted flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-cf-blue">receipt_long</span>
                            Fichas Recebidas
                        </p>
                        <p className="font-mono text-[clamp(1.25rem,2.5vw,1.875rem)] font-bold text-cf-blue leading-none mt-3">
                            {isLoading ? <span className="cf-skeleton h-8 w-36 block rounded" /> : fmt(relatorio?.recebidoFichas)}
                        </p>
                    </div>
                    <div className="text-xs text-cf-muted font-mono">Fichas de clientes quitadas hoje</div>
                </div>

                {/* Total — destaque */}
                <div className="rounded-xl p-6 flex flex-col justify-between min-h-[160px] border"
                    style={{ background: 'var(--cf-accent-glow)', borderColor: 'rgba(212,168,83,0.25)' }}>
                    <div>
                        <p className="text-xs font-mono uppercase tracking-widest text-cf-accent flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">monetization_on</span>
                            Total Bruto do Dia
                        </p>
                        <p className="font-mono text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-cf-accent leading-none mt-3">
                            {isLoading ? <span className="cf-skeleton h-10 w-40 block rounded" /> : fmt(relatorio?.totalBrutoDia)}
                        </p>
                    </div>
                    <div className="text-xs text-cf-accent/70 font-mono">Vendas diretas + fichas recebidas</div>
                </div>
            </div>

            {/* Info Block */}
            <div className="flex-1 cf-card p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-xl bg-cf-surface-high border border-cf-border flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-cf-muted text-3xl">info</span>
                </div>
                <p className="font-sans text-cf-text font-semibold text-lg mb-2 max-w-md">
                    Pronto para fechar o caixa?
                </p>
                <p className="text-cf-muted text-sm max-w-md leading-relaxed">
                    O fechamento de caixa irá consolidar todas as vendas e travar as operações do dia. 
                    Certifique-se de que nenhum cliente com ficha aberta está aguardando atendimento antes de prosseguir.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-mono text-cf-muted uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-cf-green animate-pulse"></div>
                    Sistema operacional
                </div>
            </div>
        </div>
    );
}
