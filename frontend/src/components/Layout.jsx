import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/financeiro': 'Financeiro',
  '/estoque': 'Estoque',
  '/logistica': 'Logística',
  '/rh': 'Gestão RH',
  '/configuracoes': 'Configurações',
};

export default function Layout() {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('mystogan:sidebar-collapsed') === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('mystogan:sidebar-collapsed', collapsed ? '1' : '0');
    } catch {
      return;
    }
  }, [collapsed]);

  const title = PAGE_TITLES[location.pathname] ?? 'Mystogan ERP';

  return (
    <div className={styles.shell}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      <div className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
        <Header title={title} onOpenMobile={() => setMobileOpen(true)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
