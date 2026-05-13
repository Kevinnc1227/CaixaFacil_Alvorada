import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Palette, MessageSquare, ArrowRight, AlertTriangle } from 'lucide-react';
import api from '../api/api';

// Definição da interface pra saber exatamente o que vem da API no Setup. 
// O Typescript ajuda muito a gente não esquecer nenhuma variável aqui.
interface SetupInfo { id: number; nome: string; temaPreferido: string; avisoRecibo: string; }

// Aqui eu deixo os temas pré-definidos. É bom porque o cliente escolhe e não corre o risco
// de colocar uma cor que quebra o contraste e deixa o site feio.
const TEMAS = [
    { value: 'amber-dark',   label: 'Âmbar Escuro',    accent: '#d4a853', bg: '#0a0a0a', desc: 'Clássico brutalista' },
    { value: 'amber-light',  label: 'Âmbar Claro',     accent: '#b8923f', bg: '#f5f0eb', desc: 'Modo dia' },
    { value: 'ocean-dark',   label: 'Oceano',           accent: '#38bdf8', bg: '#030712', desc: 'Azul profundo' },
    { value: 'emerald-dark', label: 'Esmeralda',        accent: '#34d399', bg: '#030f0a', desc: 'Verde terminal' },
    { value: 'rose-dark',    label: 'Rosa',             accent: '#f472b6', bg: '#0f0a0f', desc: 'Vibrante' },
];

export default function SetupPage() {
    // Pega o token da URL, tipo meudominio.com/setup/123456...
    const { token } = useParams<{ token: string }>();
    
    // Estados pro nosso formulário e controle de tela
    const [info, setInfo]     = useState<SetupInfo | null>(null);
    const [tema, setTema]     = useState('amber-dark');
    const [aviso, setAviso]   = useState('');
    
    // Esse estado é o coração da tela, ele que diz se estamos carregando, se deu erro, se a pessoa tá preenchendo ou se já terminou.
    const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'done'>('loading');
    const [erro, setErro]     = useState('');
    const [saving, setSaving] = useState(false);

    // Bate na API pra checar se o token é válido logo quando a tela abre.
    // Se o token for válido, a gente pega os dados iniciais que o SuperAdmin configurou e joga na tela.
    useEffect(() => {
        api.get(`/api/setup/${token}`)
            .then(r => { 
                setInfo(r.data); 
                setTema(r.data.temaPreferido || 'amber-dark'); 
                setAviso(r.data.avisoRecibo || ''); 
                setStatus('ready'); 
            })
            .catch(err => { 
                // Se der ruim (token expirado ou errado), a gente já corta o barato e mostra a tela de erro.
                setErro(err.response?.data?.error || 'Link inválido ou expirado'); 
                setStatus('error'); 
            });
    }, [token]);

    // Resgata o tema selecionado pra podermos mudar as cores da página em tempo real! Dá um "Tchan" a mais pro cliente.
    const selectedTema = TEMAS.find(t => t.value === tema) ?? TEMAS[0];

    // Hora de salvar as configurações iniciais da empresa
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); // Impede a página de dar F5
        setSaving(true);
        try {
            // Mando um PATCH só atualizando o que precisa.
            await api.patch(`/api/setup/${token}`, { temaPreferido: tema, avisoRecibo: aviso });
            setStatus('done'); // Sucesso! Muda a tela pro finalzinho.
        } catch (err: any) {
            setErro(err.response?.data?.error || 'Erro ao salvar. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    // --- RENDERIZAÇÃO DAS ETAPAS DA PÁGINA ---

    // 1. O que a pessoa vê nos primeiros milissegundos enquanto checamos o token
    if (status === 'loading') return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <p className="text-[#7a7060] text-xs uppercase tracking-widest font-black animate-pulse">Verificando link...</p>
        </div>
    );

    // 2. Deu erro? Token inválido? Essa é a tela de bloqueio.
    if (status === 'error') return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
            <div className="w-full max-w-md border-4 border-[#ef4444] bg-[#111111] shadow-[8px_8px_0_0_#ef4444] p-8 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-[#ef4444] mx-auto" />
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Link Inválido</h1>
                <p className="text-sm text-[#7a7060] uppercase">{erro}</p>
                <a href="/login" className="cf-btn w-full py-3 uppercase font-black tracking-widest flex items-center justify-center" style={{ backgroundColor: '#ef4444', color: '#111111', borderColor: '#ef4444' }}>Ir para o Login</a>
            </div>
        </div>
    );

    // 3. Deu tudo certo e o cliente acabou de configurar? Sucesso!
    if (status === 'done') return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
            <div className="w-full max-w-md border-4 border-[#34d399] bg-[#111111] shadow-[8px_8px_0_0_#34d399] p-8 text-center space-y-4">
                <div className="w-16 h-16 border-4 border-[#34d399] flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-[#34d399]" />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Setup Concluído</h1>
                <p className="text-sm text-[#7a7060]">
                    A organização <strong className="text-white">{info?.nome}</strong> está pronta para uso. Faça login com as credenciais que recebeu do administrador.
                </p>
                <a href="/login" className="cf-btn w-full py-4 mt-4 uppercase font-black tracking-widest flex items-center justify-center gap-2" style={{ backgroundColor: '#34d399', color: '#111111', borderColor: '#34d399' }}>
                    Fazer Login <ArrowRight className="w-4 h-4" />
                </a>
            </div>
        </div>
    );

    // 4. Tela principal do Setup! Aqui o cliente escolhe a cor e o aviso do recibo.
    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500"
            style={{ background: selectedTema.bg }}
        >
            {/* Esse texto gigante no fundo dá um efeito de marca d'água super premium e dinâmico */}
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

            {/* Container principal do formulário com z-index garantindo que fica na frente do texto fantasma */}
            <div className="w-full max-w-lg relative z-10 space-y-5">
                
                {/* Logo e Bem-vindo */}
                <div className="text-center mb-2">
                    <span className="text-3xl font-black tracking-tight" style={{ color: selectedTema.accent }}>
                        Caixa<span style={{ color: 'white' }}>Facil</span>
                    </span>
                    <p className="text-xs uppercase tracking-widest mt-1" style={{ color: `${selectedTema.accent}80` }}>
                        Configuração Inicial · {info?.nome}
                    </p>
                </div>

                {/* Form Brutalista - A borda e o shadow dinâmicos acompanham o tema que o cara clicou */}
                <form onSubmit={handleSave} className="border-4 bg-[#111111] space-y-6 p-6 shadow-[8px_8px_0_0_var(--cf-accent)]" style={{ borderColor: selectedTema.accent, boxShadow: `8px 8px 0 0 ${selectedTema.accent}` }}>
                    
                    {/* Seletor de Temas */}
                    <div>
                        <label htmlFor="setup-tema" className="flex items-center gap-2 text-xs font-black text-[#7a7060] uppercase tracking-widest mb-3">
                            <Palette className="w-4 h-4" /> Tema Visual
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {TEMAS.map(t => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setTema(t.value)}
                                    // A gente muda a borda e o fundo ligeiramente pra indicar qual tá clicado, dando um feedback instantâneo legal
                                    className="flex items-center gap-3 px-4 py-3 border-2 transition-all text-left"
                                    style={{
                                        borderColor: tema === t.value ? t.accent : '#222222',
                                        background: tema === t.value ? `${t.accent}15` : '#1a1a1a',
                                    }}
                                >
                                    <span className="w-8 h-8 border-2 flex-shrink-0 flex items-center justify-center" style={{ borderColor: t.accent, background: t.bg }}>
                                        <span className="w-3 h-3" style={{ background: t.accent }} />
                                    </span>
                                    <span className="flex-1">
                                        <span className="block text-sm font-black text-white uppercase tracking-wide">{t.label}</span>
                                        <span className="block text-xs text-[#7a7060] uppercase tracking-widest">{t.desc}</span>
                                    </span>
                                    {tema === t.value && <Check className="w-4 h-4 flex-shrink-0" style={{ color: t.accent }} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mensagem do Recibo */}
                    <div>
                        <label htmlFor="setup-aviso" className="flex items-center gap-2 text-xs font-black text-[#7a7060] uppercase tracking-widest mb-2">
                            <MessageSquare className="w-4 h-4" /> Mensagem no Recibo
                        </label>
                        {/* Como esse campo vai imprimir, é bom limitar o tamanho pra não quebrar a impressora térmica depois rs */}
                        <input
                            id="setup-aviso"
                            type="text"
                            className="w-full bg-[#1a1a1a] border-2 border-[#222222] text-white p-3 font-mono text-sm focus:outline-none focus:border-white transition-colors"
                            placeholder="Ex: Obrigado pela preferência! Volte sempre."
                            value={aviso}
                            onChange={e => setAviso(e.target.value)}
                            maxLength={120}
                        />
                        <p className="text-xs text-[#7a7060] mt-1 uppercase tracking-wide">{aviso.length}/120 caracteres · aparece ao final de cada comprovante impresso</p>
                    </div>

                    {/* Alerta de erro caso a API falhe na hora de salvar */}
                    {erro && (
                        <div className="border-2 border-[#ef4444] bg-[#ef444420] px-4 py-3 text-sm font-bold text-[#ef4444] uppercase tracking-wide">
                            {erro}
                        </div>
                    )}

                    {/* Botão de Envio */}
                    <button type="submit" disabled={saving} className="cf-btn w-full py-4 uppercase font-black tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 border-2" style={{ backgroundColor: selectedTema.accent, color: selectedTema.bg, borderColor: selectedTema.accent }}>
                        {saving ? 'Salvando...' : (<>Concluir Setup <ArrowRight className="w-4 h-4" /></>)}
                    </button>
                </form>

                {/* Footer humilde */}
                <p className="text-center text-xs uppercase tracking-widest" style={{ color: `${selectedTema.accent}60` }}>
                    K-HUB Soluções — Agência Digital
                </p>
            </div>
        </div>
    );
}
