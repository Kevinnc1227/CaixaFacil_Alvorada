import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api/api';

interface Lead {
    id: number;
    nomeNegocio: string;
    email: string;
    telefone: string | null;
    mensagem: string | null;
    status: 'PENDENTE' | 'CONTATADO' | 'CONVERTIDO' | 'DESCARTADO';
    criadoEm: string;
}

const STATUS_COLORS: Record<Lead['status'], string> = {
    PENDENTE:   'bg-yellow-500/10 text-yellow-300 border-yellow-500 border-2',
    CONTATADO:  'bg-blue-500/10 text-blue-300 border-blue-500 border-2',
    CONVERTIDO: 'bg-green-500/10 text-green-300 border-green-500 border-2',
    DESCARTADO: 'bg-gray-500/10 text-gray-400 border-gray-500 border-2',
};

const STATUS_OPTIONS: Lead['status'][] = ['PENDENTE', 'CONTATADO', 'CONVERTIDO', 'DESCARTADO'];

export default function AdminLeads() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);

    const fetchLeads = () => {
        api.get('/api/leads').then(r => setLeads(r.data)).finally(() => setLoading(false));
    };

    useEffect(fetchLeads, []);

    const updateStatus = async (id: number, status: Lead['status']) => {
        await api.patch(`/api/leads/${id}`, { status });
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="border-b-4 border-[var(--cf-border)] pb-4">
                <h1 className="text-4xl font-black text-[var(--cf-text)] uppercase tracking-tight">Solicitações de Acesso</h1>
                <p className="text-[var(--cf-muted)] text-sm mt-1 uppercase tracking-widest font-bold">{leads.length} solicitação(ões) registrada(s)</p>
            </div>

            {loading ? (
                <p className="text-[var(--cf-muted)] uppercase tracking-widest font-bold">Carregando...</p>
            ) : leads.length === 0 ? (
                <div className="border-4 border-[var(--cf-border)] p-12 text-center text-[var(--cf-muted)] font-bold uppercase tracking-widest">
                    Nenhuma solicitação ainda.
                </div>
            ) : (
                <div className="space-y-4">
                    {leads.map(lead => (
                        <div key={lead.id} className="border-4 border-[var(--cf-border)] p-5 shadow-[4px_4px_0_0_var(--cf-border)]">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-black text-[var(--cf-text)] text-lg uppercase tracking-tight">{lead.nomeNegocio}</h3>
                                        <span className={`text-xs px-2 py-0.5 font-black font-mono uppercase tracking-wide ${STATUS_COLORS[lead.status]}`}>
                                            {lead.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--cf-muted)] mt-0.5">{lead.email}</p>
                                    {lead.telefone && (
                                        <p className="text-sm text-[var(--cf-muted)]">{lead.telefone}</p>
                                    )}
                                    {lead.mensagem && (
                                        <button
                                            onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                                            className="text-xs font-black uppercase tracking-wide text-[var(--cf-accent)] mt-2 flex items-center gap-1 hover:underline"
                                        >
                                            {expanded === lead.id ? <><ChevronUp className="w-3 h-3" /> Ocultar mensagem</> : <><ChevronDown className="w-3 h-3" /> Ver mensagem</>}
                                        </button>
                                    )}
                                    {expanded === lead.id && lead.mensagem && (
                                        <div className="mt-2 p-3 bg-[var(--cf-surface)] border-2 border-[var(--cf-border)] text-sm text-[var(--cf-muted)] italic">
                                            &ldquo;{lead.mensagem}&rdquo;
                                        </div>
                                    )}
                                </div>

                                {/* Status selector */}
                                <select
                                    value={lead.status}
                                    onChange={e => updateStatus(lead.id, e.target.value as Lead['status'])}
                                    className="cf-input text-xs font-black uppercase tracking-wide w-36 flex-shrink-0 border-2 border-[var(--cf-border)]"
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-3 text-xs text-[var(--cf-muted)] font-mono border-t-2 border-[var(--cf-border)] pt-2 uppercase tracking-widest">
                                Recebido em {new Date(lead.criadoEm).toLocaleString('pt-BR')}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
