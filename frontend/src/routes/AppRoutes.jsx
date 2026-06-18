import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Dashboard from '../pages/Dashboard';
import ModulePlaceholder from '../pages/ModulePlaceholder';
import Transactions from '../pages/Transactions';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="financeiro" element={<Transactions />} />
        <Route path="produtos" element={<ModulePlaceholder title="Produtos" />} />
        <Route path="estoque" element={<ModulePlaceholder title="Estoque" />} />
        <Route path="funcionarios" element={<ModulePlaceholder title="Funcionários" />} />
        <Route path="configuracoes" element={<ModulePlaceholder title="Configurações" />} />
        <Route path="*" element={<ModulePlaceholder title="Página não encontrada" />} />
      </Route>
    </Routes>
  );
}