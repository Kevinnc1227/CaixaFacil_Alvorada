import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/pdv" replace />} />
          <Route path="pdv" element={<div>PDV (WIP)</div>} />
          <Route path="estoque" element={<div>Estoque (WIP)</div>} />
          <Route path="fichas" element={<div>Fichas (WIP)</div>} />
          <Route path="caixa" element={<div>Caixa (WIP)</div>} />
          <Route path="suporte" element={<div>Suporte (WIP)</div>} />
          <Route path="config" element={<div>Config (WIP)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
