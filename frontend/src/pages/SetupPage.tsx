import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Palette, MessageSquare, ArrowRight, AlertTriangle } from 'lucide-react';
import api from '../api/api';

interface SetupInfo { id: number; nome: string; temaPreferido: string; avisoRecibo: string; }

const TEMAS = [
    { value: 'amber-dark',   label: 'Âmbar Escuro',    accent: '#d4a853', bg: '#0a0a0a', desc: 'Clássico brutalista' },
    { value: 'amber-light',  label: 'Âmbar Claro',     accent: '#b8923f', bg: '#f5f0eb', desc: 'Modo dia' },
    { value: 'ocean-dark',   label: 'Oceano',           accent: '#38bdf8', bg: '#030712', desc: 'Azul profundo' },
    { value: 'emerald-dark', label: 'Esmeralda',        accent: '#34d399', bg: '#030f0a', desc: 'Verde terminal' },
    { value: 'rose-dark',    label: 'Rosa',             accent: '#f472b6', bg: '#0f0a0f', desc: 'Vibrante' },
];

export default function SetupPage() {
    const { token } = useParams<{ token: string }>();
    const [info, setInfo]     = useState<SetupInfo | null>(null);
    const [tema, setTema]     = useState('amber-dark');
    const [aviso, setAviso]   = useState('');
    const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'done'>('loading');
    const [erro, setErro]     = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get(`/api/setup/${token}`)
            .then(r => { setInfo(r.data); setTema(r.data.temaPreferido || 'amber-dark'); setAviso(r.data.avisoRecibo || ''); setStatus('ready'); })
            .catch(err => { setErro(err.response?.data?.error || 'Link inválido ou expirado'); setStatus('error'); });
    }, [token]);

    const selectedTema = TEMAS.find(t => t.value === tema) ?? TEMAS[0];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch(`/api/setup/${token}`, { temaPreferido: tema, avisoRecibo: aviso });
            setStatus('done');
        } catch (err: any) {
            setErro(err.response?.data?.error || 'Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    if (status === 'loading') return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <p className="text-[#7a7060] text-xs uppercase tracking-widest font-black animate-pulse">Verificando link...</p>
        </div>
    );

    if (status === 'error') return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
            <div className="w-full max-w-md border-4 border-[#ef4444] bg-[#111111] shadow-[8px_8px_0_0_#ef4444] p-8 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-[#ef4444] mx-auto" />
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Link Inválido</h1>
                <p className="text-sm text-[#7a7060] uppercase">{erro}</p>
                <a href="/login" className="cf-btn cf-btn-danger w-full uppercase font-black tracking-widest">Ir para o Login</a>
            </div>
        </div>
    );

    if (status === 'done') return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
            <div className="w-full max-w-md border-4 border-[var(--cf-green)] bg-[#111111] shadow-[8px_8px_0_0_var(--cf-green)] p-8 text-center space-y-4">
                <div className="w-16 h-16 border-4 border-[var(--cf-green)] flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-[var(--cf-green)]" />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Setup Concluído</h1>
                <p className="text-sm text-[#7a7060]">
                    <strong className="text-white">{info?.nome}</strong> está pronta. Faça login com as credenciais que recebeu do administrador.
                </p>
                <a href="/login" className="cf-btn cf-btn-primary w-full uppercase font-black tracking-widest flex items-center justify-center gap-2">
                    Fazer Login <ArrowRight className="w-4 h-4" />
                </a>
            </div>
        </div>
    );

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500"
            style={{ background: selectedTema.bg }}
        >
            {/* Background text monument */}
            <div
                className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
                aria-hidden
            >
                <span
                    className="text-[clamp(8rem,25vw,20rem)] font-black uppercase tracking-tighter leading-none"
                    style={{ color: 'transparent', WebkitTextStroke: `2px ${selectedTema.accent}20` }}
                >
                    SETUP
                </span>
            </div>

            <div className="w-full max-w-lg relative z-10 space-y-5">
                {/* Wordmark */}
                <div className="text-center mb-2">
                    <span className="text-3xl font-black tracking-tight" style={{ color: selectedTema.accent }}>
                        Caixa<span style={{ color: 'white' }}>Facil</span>
                    </span>
                    <p className="text-xs uppercase tracking-widest mt-1" style={{ color: `${selectedTema.accent}80` }}>
                        Configuração Inicial · {info?.nome}
                    </p>
                </div>

                {/* Card principal */}
                <form onSubmit={handleSave} className="border-4 bg-[var(--cf-surface)] space-y-6 p-6 shadow-[8px_8px_0_0_var(--cf-accent)]" style={{ borderColor: selectedTema.accent }}>
                    {/* Tema */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-3">
                            <Palette className="w-4 h-4" /> Tema Visual
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {TEMAS.map(t => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setTema(t.value)}
                                    className="flex items-center gap-3 px-4 py-3 border-2 transition-all text-left"
                                    style={{
                                        borderColor: tema === t.value ? t.accent : 'var(--cf-border)',
                                        background: tema === t.value ? `${t.accent}15` : 'var(--cf-surface-high)',
                                    }}
                                >
                                    <span className="w-8 h-8 border-2 flex-shrink-0 flex items-center justify-center" style={{ borderColor: t.accent, background: t.bg }}>
                                        <span className="w-3 h-3" style={{ background: t.accent }} />
                                    </span>
                                    <span className="flex-1">
                                        <span className="block text-sm font-black text-[var(--cf-text)] uppercase tracking-wide">{t.label}</span>
                                        <span className="block text-xs text-[var(--cf-muted)] uppercase tracking-widest">{t.desc}</span>
                                    </span>
                                    {tema === t.value && <Check className="w-4 h-4 flex-shrink-0" style={{ color: t.accent }} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aviso do recibo */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-2">
                            <MessageSquare className="w-4 h-4" /> Mensagem no Recibo
                        </label>
                        <input
                            type="text"
                            className="cf-input"
                            placeholder="Ex: Obrigado pela preferência!"
                            value={aviso}
                            onChange={e => setAviso(e.target.value)}
                            maxLength={120}
                        />
                        <p className="text-xs text-[var(--cf-muted)] mt-1 uppercase tracking-wide">{aviso.length}/120 caracteres · aparece ao final de cada comprovante</p>
                    </div>

                    {erro && (
                        <div className="border-2 border-[var(--cf-red)] bg-[var(--cf-red-bg)] px-4 py-3 text-sm font-bold text-[var(--cf-red)] uppercase tracking-wide">
                            {erro}
                        </div>
                    )}

                    <button type="submit" disabled={saving} className="cf-btn cf-btn-primary w-full py-4 uppercase font-black tracking-widest text-sm flex items-center justify-center gap-2">
                        {saving ? 'Salvando...' : (<>Concluir Setup <ArrowRight className="w-4 h-4" /></>)}
                    </button>
                </form>

                <p className="text-center text-xs text-[var(--cf-muted)] uppercase tracking-widest">
                    K-HUB Soluções — Agência Digital
                </p>
            </div>
        </div>
    );
}
