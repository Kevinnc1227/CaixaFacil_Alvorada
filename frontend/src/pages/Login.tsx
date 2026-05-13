import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { STORAGE_KEYS } from '../api/api';
import { Lock, ArrowRight, AlertTriangle } from 'lucide-react';

export default function Login() {
    // Hookzinho maroto pra navegar entre as páginas depois que o login der certo
    const navigate = useNavigate();
    
    // Nossos estados do formulário. Chamei de "identificador" porque o cara pode logar tanto com email quanto com o username
    const [identificador, setIdentificador] = useState(''); 
    const [senha, setSenha] = useState('');
    
    // Controle de UI pra mostrar erro ou estado de carregamento pro cliente não ficar clicando que nem doido
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    // Função que faz o "Heavy Lifting" da autenticação
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Sem reload na página, por favor!
        setErro('');
        setLoading(true);

        try {
            // Bate no backend enviando os dados...
            const { data } = await api.post('/auth/login', { identificador, senha });

            // Opa, login sucesso! Guarda o Token e os dados do usuário no localStorage.
            // Uso constantes (STORAGE_KEYS) pra evitar erro de digitação boba, tipo "T0ken"
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

            // Aqui é o pulo do gato do roteamento:
            // Se for o chefão (SUPERADMIN), mando direto pro painel de gestão de empresas.
            // Se for um mero mortal (OPERADOR, etc), vai pro Dashboard normal do sistema.
            if (data.user.perfil === 'SUPERADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            // Se falhou, mostro a mensagem bonitinha que a API mandou ou uma genérica de backup
            setErro(err.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            // Independente se deu certo ou errado, tiro o botão do modo "loading"
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[var(--cf-bg)] p-6 overflow-hidden cf-noise">
            {/* --- Efeito de Fundo Monumental Brutalista --- */}
            {/* Coloquei esse texto gigante atrás de tudo. Ele dá um peso pro design que fica absurdo de foda. */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 select-none overflow-hidden" aria-hidden>
                <span 
                    className="font-black whitespace-nowrap"
                    style={{ 
                        WebkitTextStroke: '2px var(--cf-border-strong)',
                        color: 'transparent',
                        fontSize: 'clamp(8rem, 20vw, 24rem)',
                        letterSpacing: '-0.05em',
                        lineHeight: '0.8'
                    }}
                >
                    CAIXAFACIL
                </span>
            </div>

            {/* --- Container Principal --- */}
            <div className="relative w-full max-w-lg z-10 space-y-6">
                
                {/* Logo e Branding da Empresa */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-4 mb-2">
                        {/* Aquele ícone caixa preta forte que o cliente olha e fala "Caramba, que sistema sério!" */}
                        <div className="w-14 h-14 bg-[var(--cf-accent)] flex items-center justify-center font-black text-[var(--cf-bg)] text-2xl border-4 border-[var(--cf-border-strong)]">
                            CF
                        </div>
                        <span className="text-4xl font-black tracking-tighter">
                            <span className="text-[var(--cf-text)]">CAIXA</span><span className="text-[var(--cf-accent)]">FACIL</span>
                        </span>
                    </div>
                    <p className="text-[var(--cf-muted)] text-xs tracking-[0.2em] uppercase font-bold">by K-HUB Soluções</p>
                </div>

                {/* Form Brutalista Pesado */}
                {/* Repara na borda de 4px e no shadow sólido, isso que dá a "cara de terminal/brutal" do app */}
                <form
                    onSubmit={handleLogin}
                    className="bg-[var(--cf-surface)] border-4 border-[var(--cf-border-strong)] p-8 sm:p-10 space-y-8 shadow-[8px_8px_0_0_var(--cf-accent)]"
                >
                    <div>
                        <h1 className="text-2xl font-black text-[var(--cf-text)] tracking-tight uppercase flex items-center gap-2">
                            <Lock className="w-6 h-6 text-[var(--cf-accent)]" /> Acesso Restrito
                        </h1>
                        <p className="text-[var(--cf-muted)] text-sm mt-1">Insira suas credenciais corporativas para continuar.</p>
                    </div>

                    <div className="space-y-5">
                        {/* Campo de Identificador (Email/Username) */}
                        <div className="space-y-2">
                            <label htmlFor="login-identificador" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest">
                                E-mail ou usuário
                            </label>
                            <input
                                id="login-identificador"
                                type="text"
                                className="cf-input w-full"
                                placeholder="seu@email.com ou usuario"
                                value={identificador}
                                onChange={e => setIdentificador(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>

                        {/* Campo de Senha */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="login-senha" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest">
                                    Senha
                                </label>
                            </div>
                            <input
                                id="login-senha"
                                type="password"
                                className="cf-input w-full font-mono tracking-widest"
                                placeholder="••••••••"
                                value={senha}
                                onChange={e => setSenha(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    {/* Exibição de Erros (Alerta vermelho brutal) */}
                    {erro && (
                        <div className="border-2 border-[var(--cf-red)] bg-[var(--cf-red-bg)] px-4 py-3 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-[var(--cf-red)] flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-bold text-[var(--cf-red)] uppercase tracking-wide">
                                {erro}
                            </p>
                        </div>
                    )}

                    {/* Botão Primário Monstrão de Enviar */}
                    <button
                        id="login-submit"
                        type="submit"
                        disabled={loading}
                        className="cf-btn cf-btn-primary w-full py-4 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? 'AUTENTICANDO...' : (<>Acessar Sistema <ArrowRight className="w-5 h-5" /></>)}
                    </button>
                </form>

                {/* Footer/Retorno com linkezinho maroto */}
                <div className="text-center">
                    <a href="/" className="inline-flex items-center text-xs font-black text-[var(--cf-muted)] hover:text-[var(--cf-accent)] uppercase tracking-[0.15em] transition-colors hover:underline underline-offset-4">
                        &lt; Retornar ao Site Público
                    </a>
                </div>
            </div>
        </div>
    );
}
