import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../../api/api';
import { LayoutDashboard, Building2, Inbox, LogOut } from 'lucide-react';

const navItems = [
    { to: '/admin', label: 'DASHBOARD', icon: LayoutDashboard, end: true },
    { to: '/admin/organizacoes', label: 'ORGANIZAÇÕES', icon: Building2 },
    { to: '/admin/leads', label: 'SOLICITAÇÕES', icon: Inbox },
];

export default function AdminLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex bg-[var(--cf-bg)] cf-noise">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r-2 border-[var(--cf-border-strong)] flex flex-col bg-[var(--cf-bg)] relative z-10">
                {/* Brand */}
                <div className="p-6 border-b-2 border-[var(--cf-border-strong)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--cf-accent)] flex items-center justify-center font-black text-[var(--cf-bg)] text-xl border-2 border-[var(--cf-accent)]">
                            CF
                        </div>
                        <div>
                            <div className="font-black text-xl leading-none tracking-tighter">
                                <span className="text-[var(--cf-text)]">CAIXA</span><span className="text-[var(--cf-accent)]">FACIL</span>
                            </div>
                            <div className="text-[10px] text-[var(--cf-muted)] font-bold tracking-[0.2em] uppercase mt-1">SUPER ADMIN</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase transition-colors border-2 ${
                                        isActive
                                            ? 'bg-[var(--cf-accent)] text-[var(--cf-bg)] border-[var(--cf-accent)]'
                                            : 'text-[var(--cf-muted-light)] border-transparent hover:border-[var(--cf-border-strong)] hover:text-[var(--cf-text)]'
                                    }`
                                }
                            >
                                <Icon size={18} strokeWidth={2.5} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t-2 border-[var(--cf-border-strong)]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase text-[var(--cf-muted-light)] border-2 border-transparent hover:border-[var(--cf-red)] hover:text-[var(--cf-red)] hover:bg-[var(--cf-red-bg)] transition-colors"
                    >
                        <LogOut size={18} strokeWidth={2.5} />
                        SAIR
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-8 relative z-0">
                <Outlet />
            </main>
        </div>
    );
}
