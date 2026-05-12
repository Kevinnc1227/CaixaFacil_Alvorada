import { useEffect, useState } from 'react';
import { Building2, Users, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Power, Plus, X, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import api from '../../api/api';

interface Org {
    id: number;
    nome: string;
    slug: string;
    emailContato: string | null;
    telefone: string | null;
    cnpj: string | null;
    ativo: boolean;
    setupConcluido: boolean;
    setupToken: string | null;
    criadoEm: string;
}

interface OrgUser {
    id: number;
    nome: string;
    email: string;
    username: string | null;
    perfil: string;
    ativo: boolean;
}

interface OrgForm {
    nome: string; slug: string; emailContato: string; telefone: string; cnpj: string;
}

interface AdminForm {
    nome: string; email: string; username: string; senha: string; confirmarSenha: string;
}

const EMPTY_ORG: OrgForm = { nome: '', slug: '', emailContato: '', telefone: '', cnpj: '' };
const EMPTY_ADMIN: AdminForm = { nome: '', email: '', username: '', senha: '', confirmarSenha: '' };

function slugify(str: string) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminOrganizacoes() {
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [orgForm, setOrgForm] = useState<OrgForm>(EMPTY_ORG);
    const [adminForm, setAdminForm] = useState<AdminForm>(EMPTY_ADMIN);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [setupLinks, setSetupLinks] = useState<Record<number, string>>({});
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [orgUsers, setOrgUsers] = useState<Record<number, OrgUser[]>>({});
    const [loadingUsers, setLoadingUsers] = useState<number | null>(null);

    const fetchOrgs = () => {
        api.get('/api/admin/organizacoes').then(r => setOrgs(r.data)).finally(() => setLoading(false));
    };

    useEffect(fetchOrgs, []);

    const openModal = () => { setShowModal(true); setStep(1); setOrgForm(EMPTY_ORG); setAdminForm(EMPTY_ADMIN); setError(''); };
    const closeModal = () => { setShowModal(false); setError(''); };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (adminForm.senha !== adminForm.confirmarSenha) { setError('As senhas não coincidem.'); return; }
        if (adminForm.senha.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return; }
        setSaving(true); setError('');
        try {
            const { data: novaOrg } = await api.post('/api/admin/organizacoes', orgForm);
            setSetupLinks(prev => ({ ...prev, [novaOrg.id]: novaOrg.setupLink }));
            await api.post(`/api/admin/organizacoes/${novaOrg.id}/usuarios`, {
                nome: adminForm.nome,
                email: adminForm.email,
                username: adminForm.username || adminForm.email.split('@')[0],
                senha: adminForm.senha,
                perfil: 'ADMINISTRADOR',
            });
            setOrgs(prev => [...prev, novaOrg]);
            closeModal();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao criar organização.');
        } finally {
            setSaving(false);
        }
    };

    const toggleAtivo = async (org: Org) => {
        await api.patch(`/api/admin/organizacoes/${org.id}`, { ...org, ativo: !org.ativo });
        setOrgs(prev => prev.map(o => o.id === org.id ? { ...o, ativo: !o.ativo } : o));
    };

    const resetSetup = async (id: number) => {
        if (!confirm('Isso invalidará o link anterior. Continuar?')) return;
        const { data } = await api.post(`/api/admin/organizacoes/${id}/reset-setup`);
        setSetupLinks(prev => ({ ...prev, [id]: data.setupLink }));
        setOrgs(prev => prev.map(o => o.id === id ? { ...o, setupConcluido: false } : o));
    };

    const copyLink = (id: number, link: string) => {
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleExpand = async (id: number) => {
        if (expandedId === id) { setExpandedId(null); return; }
        setExpandedId(id);
        if (!orgUsers[id]) {
            setLoadingUsers(id);
            try {
                const { data } = await api.get(`/api/admin/organizacoes/${id}/usuarios`);
                setOrgUsers(prev => ({ ...prev, [id]: data }));
            } catch { }
            setLoadingUsers(null);
        }
    };

    const perfilColor: Record<string, string> = {
        ADMINISTRADOR: 'var(--cf-accent)',
        OPERADOR: 'var(--cf-blue)',
        SUPORTE: 'var(--cf-green)',
        SUPERADMIN: 'var(--cf-red)',
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="border-b-4 border-[var(--cf-border)] pb-4 flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[var(--cf-text)] uppercase tracking-tight">Organizações</h1>
                    <p className="text-[var(--cf-muted)] text-xs mt-1 uppercase tracking-widest font-bold">
                        {orgs.length} cliente(s) — {orgs.filter(o => o.ativo).length} ativo(s)
                    </p>
                </div>
                <button onClick={openModal} className="cf-btn cf-btn-primary uppercase font-black tracking-wide px-5 py-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nova Organização
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-[var(--cf-muted)] uppercase tracking-widest font-bold text-sm">Carregando...</div>
            ) : orgs.length === 0 ? (
                <div className="border-4 border-dashed border-[var(--cf-border)] p-12 text-center text-[var(--cf-muted)] uppercase tracking-widest font-bold">
                    Nenhuma organização cadastrada.
                </div>
            ) : (
                <div className="space-y-3">
                    {orgs.map(org => {
                        const setupLink = setupLinks[org.id] || (org.setupToken ? `${window.location.origin}/setup/${org.setupToken}` : null);
                        const isExpanded = expandedId === org.id;
                        return (
                            <div key={org.id} className="border-2 border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-[3px_3px_0_0_var(--cf-border)]">
                                {/* Org row */}
                                <div className="p-5 flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 border-2 border-[var(--cf-border)] bg-[var(--cf-surface-high)] flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-[var(--cf-accent)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-black text-[var(--cf-text)] uppercase tracking-wide">{org.nome}</h3>
                                            <span className="font-mono text-xs text-[var(--cf-muted)] border border-[var(--cf-border)] px-1.5 py-0.5">/{org.slug}</span>
                                            <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 border ${org.ativo ? 'border-[var(--cf-green)] text-[var(--cf-green)]' : 'border-[var(--cf-red)] text-[var(--cf-red)]'}`}>
                                                {org.ativo ? 'ATIVA' : 'INATIVA'}
                                            </span>
                                            <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 border ${org.setupConcluido ? 'border-[var(--cf-blue)] text-[var(--cf-blue)]' : 'border-[var(--cf-yellow)] text-[var(--cf-yellow)]'}`}>
                                                {org.setupConcluido ? 'SETUP OK' : 'SETUP PENDENTE'}
                                            </span>
                                        </div>
                                        {org.emailContato && <p className="text-xs text-[var(--cf-muted)] mt-1">{org.emailContato} {org.telefone && `· ${org.telefone}`}</p>}
                                        {setupLink && (
                                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                                <code className="text-xs bg-[var(--cf-surface-high)] border border-[var(--cf-border)] px-2 py-1 text-[var(--cf-muted)] truncate max-w-sm font-mono">
                                                    {setupLink}
                                                </code>
                                                <button onClick={() => copyLink(org.id, setupLink)} className="text-xs text-[var(--cf-accent)] font-bold uppercase tracking-wide flex items-center gap-1 hover:underline">
                                                    {copiedId === org.id ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <button onClick={() => toggleAtivo(org)} className={`text-xs font-black uppercase tracking-wide px-3 py-1.5 border-2 transition-colors flex items-center gap-1 ${org.ativo ? 'border-[var(--cf-red)] text-[var(--cf-red)] hover:bg-[var(--cf-red)] hover:text-white' : 'border-[var(--cf-green)] text-[var(--cf-green)] hover:bg-[var(--cf-green)] hover:text-black'}`}>
                                            <Power className="w-3 h-3" /> {org.ativo ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button onClick={() => resetSetup(org.id)} className="text-xs font-black uppercase tracking-wide px-3 py-1.5 border-2 border-[var(--cf-border)] text-[var(--cf-muted)] hover:border-[var(--cf-accent)] hover:text-[var(--cf-accent)] transition-colors flex items-center gap-1">
                                            <RefreshCw className="w-3 h-3" /> Reset Setup
                                        </button>
                                        <button onClick={() => toggleExpand(org.id)} className="text-xs font-black uppercase tracking-wide px-3 py-1.5 border-2 border-[var(--cf-border)] text-[var(--cf-muted)] hover:border-[var(--cf-blue)] hover:text-[var(--cf-blue)] transition-colors flex items-center gap-1">
                                            <Users className="w-3 h-3" /> Suporte {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Support panel */}
                                {isExpanded && (
                                    <div className="border-t-2 border-[var(--cf-border)] bg-[var(--cf-surface-high)] p-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-[var(--cf-muted)] mb-3">Usuarios desta organização</p>
                                        {loadingUsers === org.id ? (
                                            <p className="text-xs text-[var(--cf-muted)] uppercase">Carregando...</p>
                                        ) : !orgUsers[org.id] || orgUsers[org.id].length === 0 ? (
                                            <p className="text-xs text-[var(--cf-muted)] uppercase">Nenhum usuario cadastrado.</p>
                                        ) : (
                                            <table className="cf-table text-xs">
                                                <thead>
                                                    <tr>
                                                        <th>Nome</th>
                                                        <th>Username / Email</th>
                                                        <th>Perfil</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orgUsers[org.id].map(u => (
                                                        <tr key={u.id}>
                                                            <td className="font-bold">{u.nome}</td>
                                                            <td className="font-mono text-[var(--cf-muted)]">{u.username || u.email}</td>
                                                            <td>
                                                                <span className="font-black text-xs uppercase" style={{ color: perfilColor[u.perfil] || 'var(--cf-text)' }}>
                                                                    {u.perfil}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`font-black text-xs uppercase ${u.ativo ? 'text-[var(--cf-green)]' : 'text-[var(--cf-red)]'}`}>
                                                                    {u.ativo ? 'ATIVO' : 'INATIVO'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                        <div className="mt-3 pt-3 border-t border-[var(--cf-border)] grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[var(--cf-muted)]">
                                            <span><strong className="text-[var(--cf-text)]">CNPJ:</strong> {org.cnpj || '—'}</span>
                                            <span><strong className="text-[var(--cf-text)]">Criado em:</strong> {new Date(org.criadoEm).toLocaleDateString('pt-BR')}</span>
                                            <span><strong className="text-[var(--cf-text)]">Setup Token:</strong> {org.setupToken ? `${org.setupToken.slice(0, 8)}...` : '—'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
                    <div className="w-full max-w-2xl border-4 border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-[8px_8px_0_0_var(--cf-accent)]">
                        {/* Modal header */}
                        <div className="border-b-2 border-[var(--cf-border)] p-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-[var(--cf-text)] uppercase tracking-tight">Nova Organização</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 border ${step === 1 ? 'border-[var(--cf-accent)] text-[var(--cf-accent)] bg-[var(--cf-accent-glow)]' : 'border-[var(--cf-border)] text-[var(--cf-muted)]'}`}>
                                        01 Empresa
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-[var(--cf-muted)]" />
                                    <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 border ${step === 2 ? 'border-[var(--cf-accent)] text-[var(--cf-accent)] bg-[var(--cf-accent-glow)]' : 'border-[var(--cf-border)] text-[var(--cf-muted)]'}`}>
                                        02 Admin Raiz
                                    </span>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-9 h-9 border-2 border-[var(--cf-border)] flex items-center justify-center text-[var(--cf-muted)] hover:border-[var(--cf-red)] hover:text-[var(--cf-red)] transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); setError(''); } : handleCreate}>
                            <div className="p-6 space-y-4">
                                {step === 1 ? (
                                    <>
                                        <p className="text-xs text-[var(--cf-muted)] uppercase tracking-widest font-bold flex items-center gap-2">
                                            <Building2 className="w-4 h-4" /> Dados da Empresa
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Nome da Empresa *</label>
                                                <input className="cf-input" required value={orgForm.nome}
                                                    onChange={e => setOrgForm(f => ({ ...f, nome: e.target.value, slug: slugify(e.target.value) }))} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Slug / URL *</label>
                                                <input className="cf-input font-mono" required value={orgForm.slug}
                                                    onChange={e => setOrgForm(f => ({ ...f, slug: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">CNPJ</label>
                                                <input className="cf-input font-mono" value={orgForm.cnpj}
                                                    onChange={e => setOrgForm(f => ({ ...f, cnpj: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">E-mail de Contato</label>
                                                <input type="email" className="cf-input" value={orgForm.emailContato}
                                                    onChange={e => setOrgForm(f => ({ ...f, emailContato: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Telefone</label>
                                                <input className="cf-input" value={orgForm.telefone}
                                                    onChange={e => setOrgForm(f => ({ ...f, telefone: e.target.value }))} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs text-[var(--cf-muted)] uppercase tracking-widest font-bold flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> Administrador Raiz da Organização
                                        </p>
                                        <p className="text-xs text-[var(--cf-muted)]">Este usuário terá acesso total à organização <strong className="text-[var(--cf-accent)]">{orgForm.nome}</strong> e poderá gerenciar outros membros.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Nome Completo *</label>
                                                <input className="cf-input" required value={adminForm.nome}
                                                    onChange={e => setAdminForm(f => ({ ...f, nome: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">E-mail de Acesso *</label>
                                                <input type="email" className="cf-input" required value={adminForm.email}
                                                    onChange={e => setAdminForm(f => ({ ...f, email: e.target.value, username: f.username || e.target.value.split('@')[0] }))} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Username</label>
                                                <input className="cf-input font-mono" value={adminForm.username}
                                                    onChange={e => setAdminForm(f => ({ ...f, username: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Senha *</label>
                                                <input type="password" className="cf-input" required value={adminForm.senha}
                                                    onChange={e => setAdminForm(f => ({ ...f, senha: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Confirmar Senha *</label>
                                                <input type="password" className="cf-input" required value={adminForm.confirmarSenha}
                                                    onChange={e => setAdminForm(f => ({ ...f, confirmarSenha: e.target.value }))} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {error && (
                                    <div className="border-2 border-[var(--cf-red)] bg-[var(--cf-red-bg)] px-4 py-3 text-sm font-bold text-[var(--cf-red)] uppercase tracking-wide">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="border-t-2 border-[var(--cf-border)] p-5 flex justify-between gap-3">
                                {step === 2 ? (
                                    <button type="button" onClick={() => { setStep(1); setError(''); }} className="cf-btn cf-btn-secondary uppercase font-black tracking-wide flex items-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Voltar
                                    </button>
                                ) : (
                                    <button type="button" onClick={closeModal} className="cf-btn cf-btn-ghost uppercase font-black tracking-wide">
                                        Cancelar
                                    </button>
                                )}
                                <button type="submit" disabled={saving} className="cf-btn cf-btn-primary uppercase font-black tracking-wide flex items-center gap-2 px-6">
                                    {saving ? 'Criando...' : step === 1 ? (<>Próximo <ArrowRight className="w-4 h-4" /></>) : (<>Criar Organização <Check className="w-4 h-4" /></>)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
