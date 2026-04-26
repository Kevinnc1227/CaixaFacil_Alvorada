import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="bg-background text-on-background flex h-screen overflow-hidden selection-red flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="flex justify-between items-center h-16 px-6 w-full bg-slate-950/95 backdrop-blur-md border-b border-white/10 flex-shrink-0 z-10">
                    <div className="font-bold text-lg md:text-2xl text-red-600 tracking-tighter md:hidden">ALVORADA OS</div>
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
