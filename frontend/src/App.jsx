import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './auth/AuthProvider';
import './styles/theme.css';
import './styles/global.css';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
