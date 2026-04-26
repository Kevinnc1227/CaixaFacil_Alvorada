import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Todo: Integrate API Auth. Bypass for MVP mock.
        if (email && password) {
            navigate('/pdv');
        }
    };

    return (
        <div className="flex h-screen bg-background items-center justify-center p-md">
            <div className="card w-full max-w-md p-lg shadow-2xl relative overflow-hidden">

                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] aspect-square bg-secondary-container/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant mb-4 shadow-inner">
                        <span className="material-symbols-outlined text-white text-3xl">sports_soccer</span>
                    </div>
                    <h1 className="font-display-lg text-display-lg text-primary text-center tracking-tight mb-2">CaixaFácil</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant text-center">Alvorada Esporte Clube</p>
                </div>

                <form onSubmit={handleLogin} className="relative z-10 flex flex-col gap-md">
                    <div className="flex flex-col gap-xs">
                        <label className="font-label-bold text-label-bold text-on-surface ml-1">E-mail de Acesso</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
                            <input
                                type="email"
                                required
                                placeholder="operador@alvorada.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-xs">
                        <label className="font-label-bold text-label-bold text-on-surface ml-1">Senha</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input pl-10"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary mt-4 group">
                        Entrar
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                    </button>
                </form>

                <div className="relative z-10 text-center mt-8">
                    <p className="text-xs text-on-surface-variant/50 font-lexend">
                        Sistema de Gestão • Versão 1.0 MVP
                    </p>
                </div>
            </div>
        </div>
    );
}
