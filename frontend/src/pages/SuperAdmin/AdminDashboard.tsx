import { useEffect, useState } from 'react';
import { Building2, MailOpen, Plus, Search } from 'lucide-react';
import api from '../../api/api';

interface Stats {
    totalOrgs: number;
    orgsAtivas: number;
    totalLeads: number;
    leadsPendentes: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/api/admin/organizacoes'),
            api.get('/api/leads'),
        ]).then(([orgsRes, leadsRes]) => {
            const orgs  = orgsRes.data;
            const leads = leadsRes.data;
            setStats({
                totalOrgs: orgs.length,
                orgsAtivas: orgs.filter((o: any) => o.ativo).length,
                totalLeads: leads.length,
                leadsPendentes: leads.filter((l: any) => l.status === 'PENDENTE').length,
            });
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        { label: 'ORGANIZAÇÕES CADASTRADAS', value: stats?.totalOrgs ?? '—', icon: <Building2 className="w-8 h-8 text-[var(--cf-text)]" />, sub: `${stats?.orgsAtivas ?? 0} ativas` },
        { label: 'SOLICITAÇÕES DE ACESSO', value: stats?.totalLeads ?? '—', icon: <MailOpen className="w-8 h-8 text-[var(--cf-text)]" />, sub: `${stats?.leadsPendentes ?? 0} pendentes` },
    ];

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="border-b-4 border-[var(--cf-border)] pb-4">
                <h1 className="text-4xl font-black text-[var(--cf-text)] uppercase tracking-tight">Painel K-HUB</h1>
                <p className="text-[var(--cf-muted)] text-sm mt-1 uppercase tracking-widest font-bold">Visão geral da plataforma</p>
            </div>

            {loading ? (
                <div className="text-[var(--cf-muted)] uppercase tracking-widest font-bold">Carregando dados...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {cards.map(card => (
                        <div key={card.label} className="cf-card border-4 border-[var(--cf-border)] p-6 shadow-[4px_4px_0_0_var(--cf-border)]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold text-[var(--cf-muted)] uppercase tracking-widest">{card.label}</p>
                                    <p className="text-5xl font-black text-[var(--cf-text)] mt-2">{card.value}</p>
                                    <p className="text-xs font-bold text-[var(--cf-accent)] mt-2 uppercase">{card.sub}</p>
                                </div>
                                <span className="p-3 bg-[var(--cf-surface)] border-2 border-[var(--cf-border)]">{card.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="border-4 border-[var(--cf-border)] p-6 shadow-[4px_4px_0_0_var(--cf-border)]">
                <h2 className="text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-5">ACESSO RÁPIDO</h2>
                <div className="flex flex-wrap gap-4">
                    <a href="/admin/organizacoes" className="cf-btn cf-btn-primary text-sm px-5 py-3 flex items-center gap-2 uppercase font-black tracking-wide">
                        <Plus className="w-4 h-4" /> Nova Organização
                    </a>
                    <a href="/admin/leads" className="cf-btn cf-btn-secondary text-sm px-5 py-3 flex items-center gap-2 uppercase font-black tracking-wide">
                        <Search className="w-4 h-4" /> Ver Solicitações
                    </a>
                </div>
            </div>
        </div>
    );
}
