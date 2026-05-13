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
import { STORAGE_KEYS } from './api/api';

// Guard para rotas de admin
function AdminGuard({ children }: { children: React.ReactNode }) {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    const user = raw ? JSON.parse(raw) : null;
    if (!user || user.perfil !== 'SUPERADMIN') return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Públicas */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/setup/:token" element={<SetupPage />} />

                {/* Super Admin */}
                <Route path="/admin" element={
                    <AdminGuard><AdminLayout /></AdminGuard>
                }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="organizacoes" element={<AdminOrganizacoes />} />
                    <Route path="leads" element={<AdminLeads />} />
                </Route>

                {/* App (tenant) */}
                <Route element={<Layout />}>
                    <Route path="dashboard" element={<Navigate to="/pdv" replace />} />
                    <Route path="pdv" element={<PDV />} />
                    <Route path="estoque" element={<Estoque />} />
                    <Route path="fichas" element={<Fichas />} />
                    <Route path="caixa" element={<Caixa />} />
                    <Route path="suporte" element={<Suporte />} />
                    <Route path="config">
                        <Route index element={<Config />} />
                        <Route path="operadores" element={
                            <AdminRoute>
                                <OperatorManagement />
                            </AdminRoute>
                        } />
                    </Route>
                    <Route path="reserva-campo" element={<ReservaCampo />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
