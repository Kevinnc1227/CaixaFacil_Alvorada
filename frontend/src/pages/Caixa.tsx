import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ResumoFinanceiro {
    totalBrutoDia: number;
    vendasDiretas: number;
    recebidoFichas: number;
    reservasCampo: number;
    pendenteFichasAbertas: number;
    custoTotalProdutos: number;
    lucroBruto: number;
    lucroLiquido: number;
}

interface Metricas {
    qtdPedidos: number;
    qtdFichasEmAberto: number;
    qtdFichasPagas: number;
    qtdReservasAtivas: number;
    qtdItensVendidos: number;
}

interface DetalhesProduto {
    [nome: string]: { qtd: number; custo: number; receita: number };
}

interface RelatorioData {
    resumoFinanceiro: ResumoFinanceiro;
    metricas: Metricas;
    detalhesProdutos: DetalhesProduto;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const brl = (v: number) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const LucroIndicator = ({ valor }: { valor: number }) => {
    const positive = valor >= 0;
    return (
        <span className={`inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full ${positive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
            <span className="material-symbols-outlined text-[14px]">{positive ? 'trending_up' : 'trending_down'}</span>
            {positive ? '+' : ''}{brl(valor)}
        </span>
    );
};

// ─── Modal de Confirmação ─────────────────────────────────────────────────────
function ConfirmModal({
    relatorio,
    onConfirm,
    onCancel,
    isPending,
}: {
    relatorio: RelatorioData;
    onConfirm: () => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    const rf = relatorio.resumoFinanceiro;
    const mt = relatorio.metricas;

    const margemPct = rf.vendasDiretas > 0
        ? ((rf.lucroLiquido / rf.totalBrutoDia) * 100).toFixed(1)
        : '0.0';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div
                className="bg-surface rounded-2xl shadow-2xl border border-outline-variant w-full max-w-2xl mx-4 overflow-hidden"
                style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
                {/* Header do modal */}
                <div className="flex items-center gap-4 p-6 border-b border-outline-variant bg-surface-container">
                    <div className="h-14 w-14 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-amber-400 text-3xl">lock</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-on-surface">Confirmar Fechamento de Caixa</h2>
                        <p className="text-sm text-on-surface-variant mt-0.5">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Resumo financeiro */}
                <div className="p-6 space-y-6">
                    {/* Grid de métricas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Pedidos pagos', value: mt.qtdPedidos, icon: 'receipt_long', color: 'text-primary' },
                            { label: 'Itens vendidos', value: mt.qtdItensVendidos, icon: 'inventory', color: 'text-secondary' },
                            { label: 'Fichas quitadas', value: mt.qtdFichasPagas, icon: 'confirmation_number', color: 'text-tertiary' },
                            { label: 'Fichas abertas', value: mt.qtdFichasEmAberto, icon: 'pending_actions', color: 'text-amber-400' },
                        ].map(m => (
                            <div key={m.label} className="bg-surface-container rounded-xl p-3 text-center">
                                <span className={`material-symbols-outlined text-2xl ${m.color}`}>{m.icon}</span>
                                <p className="text-2xl font-bold text-on-surface mt-1">{m.value}</p>
                                <p className="text-xs text-on-surface-variant">{m.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Resumo financeiro detalhado */}
                    <div className="rounded-xl border border-outline-variant overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-container">
                                    <th className="text-left p-3 text-on-surface-variant font-semibold">Composição da Receita</th>
                                    <th className="text-right p-3 text-on-surface-variant font-semibold">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/50">
                                <tr className="hover:bg-surface-container/50 transition-colors">
                                    <td className="p-3 flex items-center gap-2 text-on-surface">
                                        <span className="material-symbols-outlined text-primary text-[18px]">point_of_sale</span>
                                        Vendas diretas (PDV)
                                    </td>
                                    <td className="p-3 text-right font-mono text-on-surface">{brl(rf.vendasDiretas)}</td>
                                </tr>
                                <tr className="hover:bg-surface-container/50 transition-colors">
                                    <td className="p-3 flex items-center gap-2 text-on-surface">
                                        <span className="material-symbols-outlined text-secondary text-[18px]">confirmation_number</span>
                                        Fichas quitadas
                                    </td>
                                    <td className="p-3 text-right font-mono text-on-surface">{brl(rf.recebidoFichas)}</td>
                                </tr>
                                {rf.reservasCampo > 0 && (
                                    <tr className="hover:bg-surface-container/50 transition-colors">
                                        <td className="p-3 flex items-center gap-2 text-on-surface">
                                            <span className="material-symbols-outlined text-tertiary text-[18px]">sports_soccer</span>
                                            Reservas de campo
                                        </td>
                                        <td className="p-3 text-right font-mono text-on-surface">{brl(rf.reservasCampo)}</td>
                                    </tr>
                                )}
                                <tr className="bg-primary-container/30">
                                    <td className="p-3 font-bold text-on-surface">Total Bruto Recebido</td>
                                    <td className="p-3 text-right font-bold font-mono text-primary">{brl(rf.totalBrutoDia)}</td>
                                </tr>
                                <tr className="hover:bg-surface-container/50 transition-colors">
                                    <td className="p-3 flex items-center gap-2 text-on-surface-variant">
                                        <span className="material-symbols-outlined text-red-400 text-[18px]">remove_shopping_cart</span>
                                        Custo dos produtos vendidos
                                    </td>
                                    <td className="p-3 text-right font-mono text-red-400">- {brl(rf.custoTotalProdutos)}</td>
                                </tr>
                                <tr className="bg-green-500/10">
                                    <td className="p-3 font-bold text-on-surface flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-400 text-[18px]">savings</span>
                                        Lucro Líquido do Dia
                                        <span className="text-xs text-on-surface-variant font-normal">(margem {margemPct}%)</span>
                                    </td>
                                    <td className="p-3 text-right font-bold font-mono text-green-400">{brl(rf.lucroLiquido)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Fichas em aberto - alerta */}
                    {mt.qtdFichasEmAberto > 0 && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                            <span className="material-symbols-outlined text-amber-400 text-xl flex-shrink-0 mt-0.5">warning</span>
                            <div>
                                <p className="font-semibold text-amber-300 text-sm">Atenção: fichas em aberto</p>
                                <p className="text-amber-200/70 text-xs mt-0.5">
                                    {mt.qtdFichasEmAberto} {mt.qtdFichasEmAberto === 1 ? 'ficha ainda está aberta' : 'fichas ainda estão abertas'} ({brl(rf.pendenteFichasAbertas)} pendentes).
                                    Certifique-se de quitar todos os clientes antes de fechar o caixa.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Aviso final */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant">
                        <span className="material-symbols-outlined text-on-surface-variant text-xl flex-shrink-0 mt-0.5">info</span>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                            Esta ação irá <strong className="text-on-surface">consolidar e registrar</strong> o movimento do dia.
                            Após o fechamento, nenhuma venda deste período será alterada. O histórico ficará disponível para auditoria.
                        </p>
                    </div>
                </div>

                {/* Footer com ações */}
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onCancel}
                        disabled={isPending}
                        className="flex-1 btn-outlined py-3 text-base disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className="flex-1 py-3 text-base font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        style={{
                            background: isPending ? '#555' : 'linear-gradient(135deg, #ef4444, #b91c1c)',
                            color: '#fff',
                            boxShadow: isPending ? 'none' : '0 4px 20px rgba(239,68,68,0.4)',
                        }}
                    >
                        <span className="material-symbols-outlined">{isPending ? 'hourglass_top' : 'lock'}</span>
                        {isPending ? 'FECHANDO CAIXA...' : 'SIM, FECHAR CAIXA'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Caixa() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);

    const { data: relatorio, isLoading } = useQuery<RelatorioData>({
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
        queryFn: async () => {
            const res = await api.get('/caixa/relatorio');
            return res.data;
        }
    });

    const closeMutation = useMutation({
        mutationFn: async () => {
            const rf = relatorio!.resumoFinanceiro;
            return api.post('/caixa/fechar', {
                totalVendas: rf.vendasDiretas,
                totalFichas: rf.recebidoFichas,
                totalReservas: rf.reservasCampo,
                totalBruto: rf.totalBrutoDia,
                totalCusto: rf.custoTotalProdutos,
                lucroLiquido: rf.lucroLiquido,
            });
        },
        onSuccess: () => {
            setShowModal(false);
            toast.success('Caixa fechado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['caixaRelatorio'] });
        },
        onError: () => {
            setShowModal(false);
            toast.error('Erro ao fechar caixa (requer permissão admin).');
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl animate-spin">autorenew</span>
                <span className="text-lg">Carregando relatório de caixa...</span>
            </div>
        );
    }

    const rf = relatorio?.resumoFinanceiro;
    const mt = relatorio?.metricas;
    const dp = relatorio?.detalhesProdutos ?? {};

    const margemPct = rf && rf.totalBrutoDia > 0
        ? ((rf.lucroLiquido / rf.totalBrutoDia) * 100).toFixed(1)
        : '0.0';

    return (
        <>
            {showModal && relatorio && (
                <ConfirmModal
                    relatorio={relatorio}
                    onConfirm={() => closeMutation.mutate()}
                    onCancel={() => setShowModal(false)}
                    isPending={closeMutation.isPending}
                />
            )}

            <div className="flex flex-col gap-md h-full max-w-5xl mx-auto w-full">
                {/* Header */}
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
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary gap-2 shadow-lg shadow-primary/20 text-lg px-8"
                        id="btn-fechar-caixa"
                    >
                        <span className="material-symbols-outlined">lock_clock</span>
                        FECHAR CAIXA
                    </button>
                </header>

                {/* Cards de resumo - Linha 1: Receitas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                    {/* Vendas Diretas */}
                    <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between min-h-[140px]">
                        <div>
                            <p className="text-sm text-on-surface-variant font-label-bold uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-primary">point_of_sale</span> PDV
                            </p>
                            <p className="text-2xl font-bold text-on-surface mt-2">{brl(rf?.vendasDiretas ?? 0)}</p>
                        </div>
                        <div className="text-xs text-on-surface-variant">{mt?.qtdPedidos ?? 0} pedidos pagos</div>
                    </div>

                    {/* Fichas */}
                    <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between min-h-[140px]">
                        <div>
                            <p className="text-sm text-on-surface-variant font-label-bold uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-secondary">confirmation_number</span> Fichas
                            </p>
                            <p className="text-2xl font-bold text-secondary mt-2">{brl(rf?.recebidoFichas ?? 0)}</p>
                        </div>
                        <div className="text-xs text-on-surface-variant">{mt?.qtdFichasPagas ?? 0} fichas quitadas</div>
                    </div>

                    {/* Reservas */}
                    <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between min-h-[140px]">
                        <div>
                            <p className="text-sm text-on-surface-variant font-label-bold uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-tertiary">sports_soccer</span> Campo
                            </p>
                            <p className="text-2xl font-bold text-on-surface mt-2">{brl(rf?.reservasCampo ?? 0)}</p>
                        </div>
                        <div className="text-xs text-on-surface-variant">{mt?.qtdReservasAtivas ?? 0} reservas ativas</div>
                    </div>

                    {/* Total Bruto */}
                    <div className="bg-primary-container p-lg rounded-xl border border-primary/20 shadow-sm flex flex-col justify-between min-h-[140px] text-primary">
                        <div>
                            <p className="text-sm font-label-bold uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">monetization_on</span> Total Bruto
                            </p>
                            <p className="text-2xl font-bold mt-2">{brl(rf?.totalBrutoDia ?? 0)}</p>
                        </div>
                        <div className="text-xs opacity-80">Soma de todas as entradas</div>
                    </div>
                </div>

                {/* Cards de Lucro - Linha 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    {/* Custo */}
                    <div className="bg-surface p-lg rounded-xl border border-red-500/20 shadow-sm flex flex-col justify-between min-h-[120px]">
                        <div>
                            <p className="text-sm text-on-surface-variant font-label-bold uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-red-400">remove_shopping_cart</span> Custo dos Produtos
                            </p>
                            <p className="text-2xl font-bold text-red-400 mt-2">{brl(rf?.custoTotalProdutos ?? 0)}</p>
                        </div>
                        <div className="text-xs text-on-surface-variant">Custo de aquisição dos itens vendidos</div>
                    </div>

                    {/* Lucro Bruto */}
                    <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between min-h-[120px]">
                        <div>
                            <p className="text-sm text-on-surface-variant font-label-bold uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-green-400">trending_up</span> Lucro Bruto (PDV)
                            </p>
                            <p className="text-2xl font-bold text-green-400 mt-2">{brl(rf?.lucroBruto ?? 0)}</p>
                        </div>
                        <div className="text-xs text-on-surface-variant">Vendas PDV − custo produtos</div>
                    </div>

                    {/* Lucro Líquido */}
                    <div
                        className="p-lg rounded-xl shadow-sm flex flex-col justify-between min-h-[120px]"
                        style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))', border: '1px solid rgba(34,197,94,0.3)' }}
                    >
                        <div>
                            <p className="text-sm font-label-bold uppercase flex items-center gap-2 text-green-400">
                                <span className="material-symbols-outlined text-[18px]">savings</span> Lucro Líquido Total
                            </p>
                            <p className="text-3xl font-bold text-green-300 mt-2">{brl(rf?.lucroLiquido ?? 0)}</p>
                        </div>
                        <div className="text-xs text-green-400/70">Margem: {margemPct}% sobre receita total</div>
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
                {/* Tabela de produtos vendidos */}
                {Object.keys(dp).length > 0 && (
                    <div className="bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                        <div className="p-md border-b border-outline-variant flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">inventory</span>
                            <h2 className="font-semibold text-on-surface">Produtos Vendidos Hoje</h2>
                            <span className="ml-auto text-xs text-on-surface-variant">{mt?.qtdItensVendidos ?? 0} itens no total</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-surface-container text-on-surface-variant text-xs uppercase">
                                        <th className="text-left p-3">Produto</th>
                                        <th className="text-center p-3">Qtd</th>
                                        <th className="text-right p-3">Receita</th>
                                        <th className="text-right p-3">Custo</th>
                                        <th className="text-right p-3">Lucro</th>
                                        <th className="text-right p-3">Margem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/40">
                                    {Object.entries(dp)
                                        .sort(([, a], [, b]) => b.receita - a.receita)
                                        .map(([nome, d]) => {
                                            const lucro = d.receita - d.custo;
                                            const margem = d.receita > 0 ? ((lucro / d.receita) * 100).toFixed(1) : '0.0';
                                            const isPositive = lucro >= 0;
                                            return (
                                                <tr key={nome} className="hover:bg-surface-container/50 transition-colors">
                                                    <td className="p-3 text-on-surface font-medium">{nome}</td>
                                                    <td className="p-3 text-center text-on-surface-variant">{d.qtd}</td>
                                                    <td className="p-3 text-right font-mono text-on-surface">{brl(d.receita)}</td>
                                                    <td className="p-3 text-right font-mono text-red-400">- {brl(d.custo)}</td>
                                                    <td className="p-3 text-right font-mono">
                                                        <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                                                            {isPositive ? '+' : ''}{brl(lucro)}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                                                            {margem}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Aviso fichas abertas */}
                {(mt?.qtdFichasEmAberto ?? 0) > 0 && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <span className="material-symbols-outlined text-amber-400 text-xl flex-shrink-0 mt-0.5">warning</span>
                        <div>
                            <p className="font-semibold text-amber-300 text-sm">
                                {mt!.qtdFichasEmAberto} {mt!.qtdFichasEmAberto === 1 ? 'ficha em aberto' : 'fichas em aberto'}
                            </p>
                            <p className="text-amber-200/70 text-xs mt-0.5">
                                Valor pendente: {brl(rf?.pendenteFichasAbertas ?? 0)}. Certifique-se de quitar todos os clientes antes de fechar o caixa.
                            </p>
                        </div>
                    </div>
                )}

                {/* Info footer */}
                {Object.keys(dp).length === 0 && (
                    <div className="flex-1 bg-surface rounded-xl shadow-sm border border-outline-variant p-md flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-3">bar_chart</span>
                        <p className="text-on-surface-variant text-sm max-w-sm">
                            Nenhum produto vendido registrado hoje. As métricas de lucro serão exibidas conforme as vendas forem realizadas.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
