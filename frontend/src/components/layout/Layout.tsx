import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar, { navItems } from './Sidebar';

export default function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="bg-background text-on-background flex h-screen overflow-hidden selection-red flex-col md:flex-row relative">
            <Sidebar />
            
            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={closeMobileMenu}
                ></div>
            )}
            
            {/* Mobile Navigation Drawer */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-4 pb-6 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-6 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined text-white">sports_soccer</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-red-600 tracking-tighter">Alvorada OS</h1>
                        </div>
                    </div>
                    <button onClick={closeMobileMenu} className="text-slate-400 hover:text-white p-1">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 mx-2 my-1 font-lexend text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-secondary-container text-white shadow-lg shadow-red-900/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>{item.icon}</span>
                                    {item.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>

            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="flex items-center h-16 px-4 md:px-6 w-full bg-slate-950/95 backdrop-blur-md border-b border-white/10 flex-shrink-0 z-10 gap-3">
                    <button onClick={toggleMobileMenu} className="md:hidden text-slate-400 hover:text-white p-2 -ml-2">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="font-bold text-lg md:text-2xl text-red-600 tracking-tighter md:hidden flex-1 text-center pr-8">ALVORADA OS</div>
                    <div className="hidden md:flex flex-1"></div>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full border border-white/10 overflow-hidden ml-2 cursor-pointer bg-primary-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm text-primary">person</span>
                        </div>
                    </div>
                </header>

                <section className="flex-1 overflow-auto p-xs md:p-md relative z-0">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}
