import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import PDV from './pages/PDV';
import Estoque from './pages/Estoque';
import Fichas from './pages/Fichas';
import Caixa from './pages/Caixa';
import Suporte from './pages/Suporte';
import Config from './pages/Config';
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import AdminDashboard from './pages/SuperAdmin/AdminDashboard';
import AdminOrganizacoes from './pages/SuperAdmin/AdminOrganizacoes';
import AdminLeads from './pages/SuperAdmin/AdminLeads';
import ReservaCampo from './pages/ReservaCampo';
import OperatorManagement from './pages/OperatorManagement';
import AdminRoute from './components/layout/AdminRoute';
import PrivateRoute from './components/layout/PrivateRoute';
import { STORAGE_KEYS } from './api/api';

// Esse é o meu segurança da porta dos fundos. 
// Ele checa se o cara logado é realmente um SUPERADMIN. 
// Se for um zé ruela qualquer, chuto de volta pra página de login.
function AdminGuard({ children }: { children: React.ReactNode }) {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    const user = raw ? JSON.parse(raw) : null;
    if (!user || user.perfil !== 'SUPERADMIN') return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function App() {
    return (
        // O BrowserRouter é a base pra tudo, é ele quem gerencia a URL lá em cima no navegador.
        <BrowserRouter>
            <Routes>
                {/* Essas são as rotas que qualquer um pode acessar de fora, sem estar logado */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/setup/:token" element={<SetupPage />} />

                {/* Aqui começa o painel de quem controla TUDO (Super Admin). 
                    Coloquei o AdminGuard aqui pra garantir que ninguém bisbilhote. */}
                <Route path="/admin" element={
                    <AdminGuard><AdminLayout /></AdminGuard>
                }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="organizacoes" element={<AdminOrganizacoes />} />
                    <Route path="leads" element={<AdminLeads />} />
                </Route>

                {/* Esse é o miolo do sistema, onde os clientes (tenants) trabalham de fato. 
                    O PrivateRoute cuida de barrar quem não tá autenticado e o Layout desenha o menu lateral e o cabeçalho. */}
                <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                    {/* Se o cara entrar em /dashboard eu já jogo ele direto pro PDV que é o que importa */}
                    <Route path="dashboard" element={<Navigate to="/pdv" replace />} />
                    <Route path="pdv" element={<PDV />} />
                    <Route path="estoque" element={<Estoque />} />
                    <Route path="fichas" element={<Fichas />} />
                    <Route path="caixa" element={<Caixa />} />
                    <Route path="suporte" element={<Suporte />} />
                    
                    {/* Seção de configurações. Tem uma rota pai pra "/config" e as filhas dentro */}
                    <Route path="config">
                        <Route index element={<Config />} />
                        {/* Pra gerenciar operador, o cara tem que ser ADMIN da própria organização.
                            Uso o AdminRoute pra segurar a onda aqui. */}
                        <Route path="operadores" element={
                            <AdminRoute>
                                <OperatorManagement />
                            </AdminRoute>
                        } />
                    </Route>
                    <Route path="reserva-campo" element={<ReservaCampo />} />
                </Route>

                {/* Se o doidão digitar uma URL que não existe, eu taco ele pra landing page e finjo que nada aconteceu */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
