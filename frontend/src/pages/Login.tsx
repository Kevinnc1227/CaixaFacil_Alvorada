import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { STORAGE_KEYS } from '../api/api';

export default function Login() {
    const navigate = useNavigate();
    const [identificador, setIdentificador] = useState(''); // email ou username
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', { identificador, senha });

            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

            // Super Admin → painel admin; demais → dashboard normal
            if (data.user.perfil === 'SUPERADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setErro(err.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[var(--cf-bg)] p-6 overflow-hidden cf-noise">
            {/* Monumental Background Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 select-none overflow-hidden">
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

            <div className="relative w-full max-w-lg z-10">
                {/* Logo / Brand */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-[var(--cf-accent)] flex items-center justify-center font-black text-[var(--cf-bg)] text-2xl border-2 border-[var(--cf-accent)]">
                            CF
                        </div>
                        <span className="text-4xl font-black tracking-tighter">
                            <span className="text-[var(--cf-text)]">CAIXA</span><span className="text-[var(--cf-accent)]">FACIL</span>
                        </span>
                    </div>
                    <p className="text-[var(--cf-muted)] text-xs tracking-[0.2em] uppercase font-bold">by K-HUB Soluções</p>
                </div>

                {/* Card de login */}
                <form
                    onSubmit={handleLogin}
                    className="bg-[var(--cf-bg)] border-2 border-[var(--cf-border-strong)] p-8 sm:p-12 space-y-10"
                >
                    <div>
                        <h1 className="text-2xl font-black text-[var(--cf-text)] tracking-tight uppercase">Acesso Restrito</h1>
                        <p className="text-[var(--cf-muted)] text-sm mt-1">Insira suas credenciais para continuar.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-[var(--cf-muted-light)] uppercase tracking-widest">
                                E-mail ou usuário
                            </label>
                            <input
                                id="login-identificador"
                                type="text"
                                className="cf-input w-full bg-[var(--cf-bg)] rounded-none border-[var(--cf-border-strong)] focus:border-[var(--cf-accent)] focus:ring-0 transition-colors"
                                placeholder="seu@email.com ou usuario"
                                value={identificador}
                                onChange={e => setIdentificador(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-[var(--cf-muted-light)] uppercase tracking-widest">
                                    Senha
                                </label>
                            </div>
                            <input
                                id="login-senha"
                                type="password"
                                className="cf-input w-full bg-[var(--cf-bg)] rounded-none border-[var(--cf-border-strong)] focus:border-[var(--cf-accent)] focus:ring-0 transition-colors"
                                placeholder="••••••••"
                                value={senha}
                                onChange={e => setSenha(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    {erro && (
                        <div className="bg-[var(--cf-red-bg)] border border-[var(--cf-red)] p-4 text-sm text-[var(--cf-red)] font-medium">
                            {erro}
                        </div>
                    )}

                    <button
                        id="login-submit"
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--cf-accent)] text-[var(--cf-bg)] hover:bg-[var(--cf-accent-dim)] transition-colors py-5 px-6 font-black text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-3 disabled:opacity-50 border-2 border-[var(--cf-accent)]"
                    >
                        {loading ? '[ AUTENTICANDO ]' : 'ACESSAR SISTEMA'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <a href="/" className="inline-flex items-center text-xs font-black text-[var(--cf-muted-light)] hover:text-[var(--cf-accent)] uppercase tracking-[0.15em] transition-colors border-b-2 border-transparent hover:border-[var(--cf-accent)] pb-1">
                        &lt; RETORNAR AO SITE
                    </a>
                </div>
            </div>
        </div>
    );
}
