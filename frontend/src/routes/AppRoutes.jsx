import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import AdminUsers from '../pages/AdminUsers';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Logistics from '../pages/Logistics';
import ModulePlaceholder from '../pages/ModulePlaceholder';
import Transactions from '../pages/Transactions';
import Stock from '../pages/Stock';
import GestaoRH from '../pages/hr/HRManagement.jsx';

const ADMIN = ['admin'];
const HR = ['hr', 'admin'];
const STOCK = ['stock', 'admin'];
const FINANCE = ['admin', 'manager'];

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />

        <Route
          path="financeiro"
          element={<ProtectedRoute roles={FINANCE}><Transactions /></ProtectedRoute>}
        />
        <Route
          path="estoque"
          element={<ProtectedRoute roles={STOCK}><Stock /></ProtectedRoute>}
        />
        <Route
          path="logistica"
          element={<ProtectedRoute roles={STOCK}><Logistics /></ProtectedRoute>}
        />
        <Route
          path="rh"
          element={<ProtectedRoute roles={HR}><GestaoRH /></ProtectedRoute>}
        />
        <Route
          path="configuracoes"
          element={<ProtectedRoute roles={ADMIN}><AdminUsers /></ProtectedRoute>}
        />
        <Route path="*" element={<ModulePlaceholder title="Página não encontrada" />} />
      </Route>
    </Routes>
  );
}
