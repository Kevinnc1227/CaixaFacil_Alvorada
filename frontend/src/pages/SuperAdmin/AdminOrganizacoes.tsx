import { useEffect, useState } from 'react';
import { Building2, Users, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Power, Plus, X, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import api from '../../api/api';

// Interfaces bem definidas para eu não me perder no meio de tantos dados.
// É sempre bom tipar tudo pra evitar o famoso "cannot read property of undefined".
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

// Estados iniciais vazios para facilitar a limpeza dos formulários quando eu fechar o modal.
const EMPTY_ORG: OrgForm = { nome: '', slug: '', emailContato: '', telefone: '', cnpj: '' };
const EMPTY_ADMIN: AdminForm = { nome: '', email: '', username: '', senha: '', confirmarSenha: '' };

// Função simples e eficiente para gerar slugs a partir do nome da empresa.
// Tira os acentos, joga pra minúsculo e troca os espaços por hifens. Fácil e direto!
function slugify(str: string) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminOrganizacoes() {
    // Aqui eu guardo a lista principal de organizações.
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Controle do Modal de Criação. Como tem duas etapas (Empresa e Admin), 
    // uso a variável 'step' pra navegar entre elas.
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    
    // Formulários controlados do modal
    const [orgForm, setOrgForm] = useState<OrgForm>(EMPTY_ORG);
    const [adminForm, setAdminForm] = useState<AdminForm>(EMPTY_ADMIN);
    
    // Controle de status e erros de requisição para dar um feedback visual legal.
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    
    // Como os links de setup são gerados na hora ou vêm do banco, guardo eles aqui como um dicionário (ID da org -> Link)
    const [setupLinks, setSetupLinks] = useState<Record<number, string>>({});
    
    // Controle visual de qual link foi copiado pra área de transferência (mostra o checkezinho verde).
    const [copiedId, setCopiedId] = useState<number | null>(null);
    
    // Controle do Acordeão (Sanfona) de Suporte. Guardamos o ID da org aberta 
    // e fazemos um lazy loading (carregamento sob demanda) dos usuários daquela org específica.
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [orgUsers, setOrgUsers] = useState<Record<number, OrgUser[]>>({});
    const [loadingUsers, setLoadingUsers] = useState<number | null>(null);

    // Carrega a lista inicial de organizações. Roda só uma vez quando o componente monta.
    const fetchOrgs = () => {
        api.get('/api/admin/organizacoes').then(r => setOrgs(r.data)).finally(() => setLoading(false));
    };

    useEffect(fetchOrgs, []);

    // Helpers para abrir/fechar o modal. Ao abrir, já reseto tudo pra evitar lixo de estado anterior.
    const openModal = () => { setShowModal(true); setStep(1); setOrgForm(EMPTY_ORG); setAdminForm(EMPTY_ADMIN); setError(''); };
    const closeModal = () => { setShowModal(false); setError(''); };

    // Essa é a função principal de criação! O fluxo de onboarding é: 
    // 1. Validar as senhas do admin raiz.
    // 2. Criar a organização no backend.
    // 3. Pegar o ID gerado e criar o Administrador Raiz vinculado a ela.
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validações básicas antes de gastar rede.
        if (adminForm.senha !== adminForm.confirmarSenha) { setError('As senhas não coincidem.'); return; }
        if (adminForm.senha.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return; }
        
        setSaving(true); setError('');
        try {
            // Primeiro criamos a empresa.
            const { data: novaOrg } = await api.post('/api/admin/organizacoes', orgForm);
            
            // Já salvo o link de setup que o backend gerou pra mostrar na lista de orgaizações.
            setSetupLinks(prev => ({ ...prev, [novaOrg.id]: novaOrg.setupLink }));
            
            // Agora uso o ID da org recém criada pra vincular o usuário principal (Root) a ela.
            // Nota de otimização/segurança: O ideal em larga escala seria o backend fazer isso em uma única
            // transação (criar org + criar usuário) pra não ter perigo de criar a org e falhar o usuário,
            // mas tratar os dois passos aqui funciona bem pra separar as chamadas de API do admin.
            await api.post(`/api/admin/organizacoes/${novaOrg.id}/usuarios`, {
                nome: adminForm.nome,
                email: adminForm.email,
                username: adminForm.username || adminForm.email.split('@')[0], // username vira parte do email se não for preenchido
                senha: adminForm.senha,
                perfil: 'ADMINISTRADOR', // Esse primeiro obrigatoriamente é administrador geral.
            });
            
            // Atualizo o estado local da lista sem precisar fazer um novo 'fetchOrgs()', economizando chamadas de rede.
            setOrgs(prev => [...prev, novaOrg]);
            closeModal();
        } catch (err: any) {
            // Em caso de falha, tento mostrar a mensagem que veio da API, se não jogo uma mensagem genérica.
            setError(err.response?.data?.error || 'Erro ao criar organização.');
        } finally {
            setSaving(false);
        }
    };

    // Toggle simples para ativar/inativar um cliente. Perfeito pra quando não pagam o boleto rs.
    const toggleAtivo = async (org: Org) => {
        await api.patch(`/api/admin/organizacoes/${org.id}`, { ...org, ativo: !org.ativo });
        // Atualizo o estado de forma otimista localmente.
        setOrgs(prev => prev.map(o => o.id === org.id ? { ...o, ativo: !o.ativo } : o));
    };

    // Função salva-vidas quando o cliente perde o link de setup ou o token expira.
    const resetSetup = async (id: number) => {
        if (!confirm('Isso invalidará o link anterior. Continuar?')) return;
        const { data } = await api.post(`/api/admin/organizacoes/${id}/reset-setup`);
        
        // Atualizo o link de setup novo e marco a org como setup pendente no cache visual
        setSetupLinks(prev => ({ ...prev, [id]: data.setupLink }));
        setOrgs(prev => prev.map(o => o.id === id ? { ...o, setupConcluido: false } : o));
    };

    // Copia o link para o clipboard e muda o ícone para "Copiado" por 2 segundinhos. Feedback visual importa.
    const copyLink = (id: number, link: string) => {
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Lógica para abrir o painel de suporte de cada organização (O acordeãozinho com a lista de usuários).
    // Aqui apliquei um Lazy Loading pra otimização! Só busco os usuários na API se eu ainda não tiver no estado (orgUsers).
    const toggleExpand = async (id: number) => {
        // Se clicar na mesma org aberta, eu apenas fecho.
        if (expandedId === id) { setExpandedId(null); return; }
        
        setExpandedId(id);
        
        // Verifico se o cache local `orgUsers` já tem dados dessa org. Se não tiver, puxo da API.
        if (!orgUsers[id]) {
            setLoadingUsers(id);
            try {
                const { data } = await api.get(`/api/admin/organizacoes/${id}/usuarios`);
                setOrgUsers(prev => ({ ...prev, [id]: data }));
            } catch {
                // Num cenário avançado, poderíamos mostrar um toast de erro. Aqui a sanfona vai abrir vazia ou carregar de novo dps.
            }
            setLoadingUsers(null);
        }
    };

    // Um mapeamento simples de cores pro badge do perfil dos usuários na tabela de suporte.
    const perfilColor: Record<string, string> = {
        ADMINISTRADOR: 'var(--cf-accent)',
        OPERADOR: 'var(--cf-blue)',
        SUPORTE: 'var(--cf-green)',
        SUPERADMIN: 'var(--cf-red)',
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header da Página - Segue a estética brutalista de alto contraste e bordas grossas */}
            <div className="border-b-4 border-[var(--cf-border)] pb-4 flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[var(--cf-text)] uppercase tracking-tight">Organizações</h1>
                    <p className="text-[var(--cf-muted)] text-xs mt-1 uppercase tracking-widest font-bold">
                        {orgs.length} cliente(s) — {orgs.filter(o => o.ativo).length} ativo(s)
                    </p>
                </div>
                {/* Botão primário com minha class cf-btn brutalista */}
                <button onClick={openModal} className="cf-btn cf-btn-primary uppercase font-black tracking-wide px-5 py-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nova Organização
                </button>
            </div>

            {/* Lista Principal de Organizações */}
            {loading ? (
                <div className="text-[var(--cf-muted)] uppercase tracking-widest font-bold text-sm">Carregando...</div>
            ) : orgs.length === 0 ? (
                // Se não tiver nada, eu mostro uma box vazia com design de terminal/dashboard vazio
                <div className="border-4 border-dashed border-[var(--cf-border)] p-12 text-center text-[var(--cf-muted)] uppercase tracking-widest font-bold">
                    Nenhuma organização cadastrada.
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Renderizando as orgs */}
                    {orgs.map(org => {
                        // Resgato o link de setup salvo localmente, ou tento montar um caso a API me devolva o token dela
                        const setupLink = setupLinks[org.id] || (org.setupToken ? `${globalThis.location.origin}/setup/${org.setupToken}` : null);
                        const isExpanded = expandedId === org.id; // Verifica se esse card é o que está aberto no suporte
                        
                        return (
                            <div key={org.id} className="border-2 border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-[3px_3px_0_0_var(--cf-border)]">
                                
                                {/* Info principal da Org (Linha visível) */}
                                <div className="p-5 flex items-start gap-4">
                                    {/* Ícone */}
                                    <div className="flex-shrink-0 w-10 h-10 border-2 border-[var(--cf-border)] bg-[var(--cf-surface-high)] flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-[var(--cf-accent)]" />
                                    </div>
                                    
                                    {/* Textos - Aqui usamos o min-w-0 pro texto poder truncar caso o layout amasse no mobile */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-black text-[var(--cf-text)] uppercase tracking-wide">{org.nome}</h3>
                                            <span className="font-mono text-xs text-[var(--cf-muted)] border border-[var(--cf-border)] px-1.5 py-0.5">/{org.slug}</span>
                                            
                                            {/* Badges de status. Se tiver ativo = verde, inativo = vermelho */}
                                            <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 border ${org.ativo ? 'border-[var(--cf-green)] text-[var(--cf-green)]' : 'border-[var(--cf-red)] text-[var(--cf-red)]'}`}>
                                                {org.ativo ? 'ATIVA' : 'INATIVA'}
                                            </span>
                                            <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 border ${org.setupConcluido ? 'border-[var(--cf-blue)] text-[var(--cf-blue)]' : 'border-[var(--cf-yellow)] text-[var(--cf-yellow)]'}`}>
                                                {org.setupConcluido ? 'SETUP OK' : 'SETUP PENDENTE'}
                                            </span>
                                        </div>
                                        {org.emailContato && <p className="text-xs text-[var(--cf-muted)] mt-1">{org.emailContato} {org.telefone && `· ${org.telefone}`}</p>}
                                        
                                        {/* Container especial caso exista link de setup disponível */}
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

                                    {/* Ações (Botões Laterais) */}
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        {/* Botão de Ativar/Desativar - Troca a cor dependendo do estado atual */}
                                        <button onClick={() => toggleAtivo(org)} className={`text-xs font-black uppercase tracking-wide px-3 py-1.5 border-2 transition-colors flex items-center gap-1 ${org.ativo ? 'border-[var(--cf-red)] text-[var(--cf-red)] hover:bg-[var(--cf-red)] hover:text-white' : 'border-[var(--cf-green)] text-[var(--cf-green)] hover:bg-[var(--cf-green)] hover:text-black'}`}>
                                            <Power className="w-3 h-3" /> {org.ativo ? 'Desativar' : 'Ativar'}
                                        </button>
                                        
                                        {/* Resetar link de setup. Pode ser perigoso, então tem o `confirm` ali no começo da função */}
                                        <button onClick={() => resetSetup(org.id)} className="text-xs font-black uppercase tracking-wide px-3 py-1.5 border-2 border-[var(--cf-border)] text-[var(--cf-muted)] hover:border-[var(--cf-accent)] hover:text-[var(--cf-accent)] transition-colors flex items-center gap-1">
                                            <RefreshCw className="w-3 h-3" /> Reset Setup
                                        </button>
                                        
                                        {/* Abre a lista de suporte/usuários da organização */}
                                        <button onClick={() => toggleExpand(org.id)} className="text-xs font-black uppercase tracking-wide px-3 py-1.5 border-2 border-[var(--cf-border)] text-[var(--cf-muted)] hover:border-[var(--cf-blue)] hover:text-[var(--cf-blue)] transition-colors flex items-center gap-1">
                                            <Users className="w-3 h-3" /> Suporte {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Painel de Suporte (Lazy Loaded e renderização condicional pelo `isExpanded`) */}
                                {isExpanded && (
                                    <div className="border-t-2 border-[var(--cf-border)] bg-[var(--cf-surface-high)] p-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-[var(--cf-muted)] mb-3">Usuários desta organização</p>
                                        
                                        {loadingUsers === org.id ? (
                                            <p className="text-xs text-[var(--cf-muted)] uppercase">Carregando usuários...</p>
                                        ) : !orgUsers[org.id] || orgUsers[org.id].length === 0 ? (
                                            <p className="text-xs text-[var(--cf-muted)] uppercase">Nenhum usuário encontrado na base de dados desta empresa.</p>
                                        ) : (
                                            // Uma tabelinha simples, sem firula, só pra vermos a listagem
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
                                        {/* Informações detalhadas da organização embaixo da tabela */}
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

            {/* Modal de Onboarding (Criação de Organização em 2 Passos) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
                    <div className="w-full max-w-2xl border-4 border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-[8px_8px_0_0_var(--cf-accent)]">
                        
                        {/* Header do Modal com Breadcrumbs interativos indicando a etapa */}
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

                        {/* Formulário único pra tudo! Dependendo da `step`, eu manipulo o `onSubmit` de um jeito. */}
                        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); setError(''); } : handleCreate}>
                            <div className="p-6 space-y-4">
                                {step === 1 ? (
                                    <>
                                        {/* --- ETAPA 1: Dados Institucionais --- */}
                                        <p className="text-xs text-[var(--cf-muted)] uppercase tracking-widest font-bold flex items-center gap-2">
                                            <Building2 className="w-4 h-4" /> Dados da Empresa
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label htmlFor="org-nome" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Nome da Empresa *</label>
                                                {/* No onChange do nome, já atualizo o "slug" (subdomínio/url) de forma automática pro usuário não sofrer */}
                                                <input id="org-nome" className="cf-input" required value={orgForm.nome}
                                                    onChange={e => setOrgForm(f => ({ ...f, nome: e.target.value, slug: slugify(e.target.value) }))} />
                                            </div>
                                            <div>
                                                <label htmlFor="org-slug" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Slug / URL *</label>
                                                <input id="org-slug" className="cf-input font-mono" required value={orgForm.slug}
                                                    onChange={e => setOrgForm(f => ({ ...f, slug: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label htmlFor="org-cnpj" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">CNPJ</label>
                                                <input id="org-cnpj" className="cf-input font-mono" value={orgForm.cnpj}
                                                    onChange={e => setOrgForm(f => ({ ...f, cnpj: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label htmlFor="org-email" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">E-mail de Contato</label>
                                                <input id="org-email" type="email" className="cf-input" value={orgForm.emailContato}
                                                    onChange={e => setOrgForm(f => ({ ...f, emailContato: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label htmlFor="org-telefone" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Telefone</label>
                                                <input id="org-telefone" className="cf-input" value={orgForm.telefone}
                                                    onChange={e => setOrgForm(f => ({ ...f, telefone: e.target.value }))} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* --- ETAPA 2: Usuário Responsável --- */}
                                        <p className="text-xs text-[var(--cf-muted)] uppercase tracking-widest font-bold flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> Administrador Raiz da Organização
                                        </p>
                                        <p className="text-xs text-[var(--cf-muted)]">Este usuário terá acesso total à organização <strong className="text-[var(--cf-accent)]">{orgForm.nome}</strong> e poderá gerenciar outros membros.</p>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label htmlFor="admin-nome" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Nome Completo *</label>
                                                <input id="admin-nome" className="cf-input" required value={adminForm.nome}
                                                    onChange={e => setAdminForm(f => ({ ...f, nome: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label htmlFor="admin-email" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">E-mail de Acesso *</label>
                                                {/* Dica de usabilidade: assim que colocar o email, o campo username copia o que vier antes do "@". Facilita a vida de todo mundo! */}
                                                <input id="admin-email" type="email" className="cf-input" required value={adminForm.email}
                                                    onChange={e => setAdminForm(f => ({ ...f, email: e.target.value, username: f.username || e.target.value.split('@')[0] }))} />
                                            </div>
                                            <div>
                                                <label htmlFor="admin-username" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Username</label>
                                                <input id="admin-username" className="cf-input font-mono" value={adminForm.username}
                                                    onChange={e => setAdminForm(f => ({ ...f, username: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label htmlFor="admin-senha" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Senha *</label>
                                                <input id="admin-senha" type="password" className="cf-input" required value={adminForm.senha}
                                                    onChange={e => setAdminForm(f => ({ ...f, senha: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label htmlFor="admin-confirmar-senha" className="block text-xs font-black text-[var(--cf-muted)] uppercase tracking-widest mb-1">Confirmar Senha *</label>
                                                <input id="admin-confirmar-senha" type="password" className="cf-input" required value={adminForm.confirmarSenha}
                                                    onChange={e => setAdminForm(f => ({ ...f, confirmarSenha: e.target.value }))} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Mensagens de erro com estilo de alerta crítico da interface */}
                                {error && (
                                    <div className="border-2 border-[var(--cf-red)] bg-[var(--cf-red-bg)] px-4 py-3 text-sm font-bold text-[var(--cf-red)] uppercase tracking-wide">
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* Footer do Modal - Controles de Navegação */}
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
                                    {saving
                                        ? 'Criando...'
                                        : step === 1
                                            ? (<>Próximo <ArrowRight className="w-4 h-4" /></>)
                                            : (<>Criar Organização <Check className="w-4 h-4" /></>)
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
