import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import PDV from './pages/PDV';
import Estoque from './pages/Estoque';
import Fichas from './pages/Fichas';
import Caixa from './pages/Caixa';
import Suporte from './pages/Suporte';
import Config from './pages/Config';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/pdv" replace />} />
          <Route path="pdv" element={<PDV />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="fichas" element={<Fichas />} />
          <Route path="caixa" element={<Caixa />} />
          <Route path="suporte" element={<Suporte />} />
          <Route path="config" element={<Config />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
