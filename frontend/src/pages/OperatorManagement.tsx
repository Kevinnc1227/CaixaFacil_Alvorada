import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../api/api';

type User = {
    id: number;
    nome: string;
    email: string;
    perfil: 'OPERADOR' | 'ADMINISTRADOR' | 'SUPORTE';
    ativo: boolean;
    criadoEm: string;
};

export default function OperatorManagement() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [perfil, setPerfil] = useState<'OPERADOR' | 'ADMINISTRADOR' | 'SUPORTE'>('OPERADOR');

    const { data: usuarios = [], isLoading } = useQuery<User[]>({
        queryKey: ['usuarios'],
        queryFn: async () => {
            const res = await api.get('/usuarios');
            // Oculta usuários de SUPORTE da listagem
            return res.data.filter((u: User) => u.perfil !== 'SUPORTE');
        }
    });

    const createMutation = useMutation({
        mutationFn: async (novoUsuario: any) => api.post('/usuarios', novoUsuario),
        onSuccess: () => {
            toast.success('Usuário criado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
            setShowModal(false);
            // Reset form
            setNome('');
            setEmail('');
            setSenha('');
            setPerfil('OPERADOR');
        },
        onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao criar usuário')
    });

    const toggleAtivoMutation = useMutation({
        mutationFn: async (user: User) => api.put(`/usuarios/${user.id}`, {
            nome: user.nome,
            email: user.email,
            perfil: user.perfil,
            ativo: !user.ativo
        }),
        onSuccess: () => {
            toast.success('Status do usuário alterado!');
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao alterar status')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ nome, email, senha, perfil });
    };

    return (
        <div className="flex flex-col h-full gap-md">
            <header className="flex justify-between items-center bg-surface-container rounded-xl p-md border border-outline-variant shadow-sm flex-shrink-0">
                <div>
                    <h1 className="font-display-sm text-on-surface tracking-tight">Gerenciar Operadores</h1>
                    <p className="text-sm text-on-surface-variant font-lexend mt-1">
                        Adicione novos usuários ou ative/inative acessos
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
                    <span className="material-symbols-outlined">person_add</span>
                    Novo Operador
                </button>
            </header>

            <div className="flex-1 bg-surface-container rounded-xl border border-outline-variant overflow-hidden flex flex-col shadow-sm">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-high border-b border-outline-variant sticky top-0 z-10">
                            <tr>
                                <th className="p-4 font-label-bold text-on-surface-variant">Nome</th>
                                <th className="p-4 font-label-bold text-on-surface-variant">Email</th>
                                <th className="p-4 font-label-bold text-on-surface-variant">Perfil</th>
                                <th className="p-4 font-label-bold text-on-surface-variant text-center">Status</th>
                                <th className="p-4 font-label-bold text-on-surface-variant text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">Carregando usuários...</td>
                                </tr>
                            ) : usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">Nenhum usuário encontrado</td>
                                </tr>
                            ) : usuarios.map((user) => (
                                <tr key={user.id} className="border-b border-outline-variant/50 hover:bg-surface-container-high/50 transition-colors">
                                    <td className="p-4 font-medium text-on-surface">{user.nome}</td>
                                    <td className="p-4 text-on-surface-variant">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                            user.perfil === 'ADMINISTRADOR' ? 'bg-primary-container text-primary' :
                                            user.perfil === 'SUPORTE' ? 'bg-secondary-container text-secondary' :
                                            'bg-surface-variant text-on-surface'
                                        }`}>
                                            {user.perfil}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                            user.ativo ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-error/20 text-error border border-error/30'
                                        }`}>
                                            {user.ativo ? 'ATIVO' : 'INATIVO'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => toggleAtivoMutation.mutate(user)}
                                            disabled={toggleAtivoMutation.isPending}
                                            className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-variant hover:text-white transition-colors text-sm font-medium text-on-surface-variant disabled:opacity-50"
                                        >
                                            {user.ativo ? 'Desativar' : 'Ativar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Novo Usuário */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-md border-b border-outline-variant">
                            <h2 className="font-headline-sm text-on-surface">Novo Operador</h2>
                            <button type="button" onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-error p-1 rounded-lg transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-md flex flex-col gap-4 overflow-y-auto">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-label-bold text-on-surface">Nome Completo</label>
                                <input
                                    type="text" required
                                    value={nome} onChange={e => setNome(e.target.value)}
                                    className="input" placeholder="João Silva"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-label-bold text-on-surface">Email de Acesso</label>
                                <input
                                    type="email" required
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    className="input" placeholder="joao@alvorada.com"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-label-bold text-on-surface">Senha Temporária</label>
                                <input
                                    type="password" required
                                    value={senha} onChange={e => setSenha(e.target.value)}
                                    className="input" placeholder="••••••••"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-label-bold text-on-surface">Perfil de Acesso</label>
                                <select 
                                    value={perfil} onChange={e => setPerfil(e.target.value as any)}
                                    className="input"
                                >
                                    <option value="OPERADOR">Operador (Caixa, PDV)</option>
                                    <option value="ADMINISTRADOR">Administrador (Total)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-md p-md border-t border-outline-variant bg-surface-container-lowest">
                            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
                                {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
