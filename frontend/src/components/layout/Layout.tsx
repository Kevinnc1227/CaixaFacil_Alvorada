import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    // Esse é o layout base do sistema todo. É a casca em volta de todas as páginas do painel.
    return (
        // Um layout container que ocupa a tela toda (h-screen) e não deixa barra de rolagem geral vazar (overflow-hidden).
        // Aqui eu também aplico a classe de background (bg-cf-bg) e a cor de texto padrão (text-cf-text).
        // Aquele .cf-noise eu adicionei lá no CSS para dar uma texturinha brutalista bem sutil de fundo.
        <div className="bg-cf-bg text-cf-text flex h-screen overflow-hidden flex-col md:flex-row cf-noise">
            
            {/* O menu lateral vai ficar fixo aqui na esquerda em desktops */}
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Mobile Header: Esse cabeçalho só aparece no celular (md:hidden). 
                    No desktop a logo fica direto na sidebar.  */}
                <header className="flex justify-between items-center h-16 px-6 w-full bg-cf-surface/80 backdrop-blur-md border-b border-cf-border flex-shrink-0 z-10 md:hidden">
                    <div className="font-black text-xl tracking-tighter text-cf-text">
                        Caixa<span className="text-cf-accent">Facil</span>
                    </div>
                </header>

                {/* Dashboard Content: Esse cara sim é quem renderiza a página de verdade.
                    O <Outlet /> do react-router vai injetar a página (PDV, Estoque, etc) bem aqui dentro.
                    Coloquei um scroll flexível aqui, então a página rola mas a sidebar e o header ficam paradinhos. */}
                <section className="flex-1 overflow-auto p-4 md:p-8 relative z-0 cf-scroll">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}
