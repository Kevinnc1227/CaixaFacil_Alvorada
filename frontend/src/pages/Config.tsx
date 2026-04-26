import React from 'react';

export default function Config() {
    return (
        <div className="flex flex-col gap-lg h-full max-w-4xl mx-auto w-full">
            <header className="flex justify-between items-center bg-surface p-md rounded-xl shadow-sm border border-outline-variant">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface text-2xl">settings</span>
                    </div>
                    <div>
                        <h1 className="font-display-sm text-on-surface">Configurações do Sistema</h1>
                        <p className="text-on-surface-variant text-sm">Gerencie operadores e dados do clube</p>
                    </div>
                </div>
            </header>

            <section className="bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                <div className="p-md border-b border-outline-variant bg-surface-container-low">
                    <h2 className="font-headline-sm text-on-surface">Operadores e Usuários</h2>
                </div>
                <div className="p-md">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="pb-3 font-label-bold text-on-surface-variant border-b border-outline-variant">Nome</th>
                                <th className="pb-3 font-label-bold text-on-surface-variant border-b border-outline-variant">Perfil</th>
                                <th className="pb-3 font-label-bold text-on-surface-variant border-b border-outline-variant">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-4 border-b border-outline-variant/30 text-on-surface">Administrador</td>
                                <td className="py-4 border-b border-outline-variant/30"><span className="bg-primary-container text-primary px-2 py-0.5 rounded text-xs font-bold">ADMINISTRADOR</span></td>
                                <td className="py-4 border-b border-outline-variant/30"><span className="text-primary text-sm font-bold">Ativo</span></td>
                            </tr>
                            <tr>
                                <td className="py-4 border-b border-outline-variant/30 text-on-surface">Caixa 01 (João)</td>
                                <td className="py-4 border-b border-outline-variant/30"><span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-xs font-bold">OPERADOR</span></td>
                                <td className="py-4 border-b border-outline-variant/30"><span className="text-primary text-sm font-bold">Ativo</span></td>
                            </tr>
                        </tbody>
                    </table>
                    <button className="btn-secondary mt-4"><span className="material-symbols-outlined mr-2">person_add</span>Adicionar Operador</button>
                </div>
            </section>

            <section className="bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                <div className="p-md border-b border-outline-variant bg-surface-container-low">
                    <h2 className="font-headline-sm text-on-surface">Dados do Clube</h2>
                </div>
                <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                        <label className="text-sm font-bold text-on-surface-variant">Nome Oficial</label>
                        <input className="input w-full" value="Alvorada Esporte Clube" disabled />
                    </div>
                    <div className="flex flex-col gap-xs">
                        <label className="text-sm font-bold text-on-surface-variant">CNPJ</label>
                        <input className="input w-full" value="00.000.000/0001-00" disabled />
                    </div>
                    <div className="flex flex-col gap-xs md:col-span-2">
                        <label className="text-sm font-bold text-on-surface-variant">Aviso no Recibo de Ficha</label>
                        <input className="input w-full" value="Obrigado por fortalecer o esporte local!" />
                    </div>
                </div>
                <div className="p-md bg-surface-container-lowest border-t border-outline-variant flex justify-end">
                    <button className="btn-primary">SALVAR ALTERAÇÕES</button>
                </div>
            </section>
        </div>
    );
}
