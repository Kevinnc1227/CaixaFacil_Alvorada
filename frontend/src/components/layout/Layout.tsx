import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="bg-cf-bg text-cf-text flex h-screen overflow-hidden flex-col md:flex-row cf-noise">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Mobile Header */}
                <header className="flex justify-between items-center h-16 px-6 w-full bg-cf-surface/80 backdrop-blur-md border-b border-cf-border flex-shrink-0 z-10 md:hidden">
                    <div className="font-black text-xl tracking-tighter text-cf-text">
                        Caixa<span className="text-cf-accent">Facil</span>
                    </div>
                </header>

                {/* Dashboard Content */}
                <section className="flex-1 overflow-auto p-4 md:p-8 relative z-0 cf-scroll">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}
