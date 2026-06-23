import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiDollarSign,
  FiTruck,
  FiPackage,
  FiUsers,
  FiSettings,
  FiChevronsLeft,
  FiChevronsRight,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../auth/useAuth';
import styles from './Sidebar.module.css';
import logoImg from '../assets/MystoganERPLogo.png';

const NAV_GROUPS = [
  {
    items: [{ to: '/', label: 'Dashboard', icon: FiGrid, end: true }],
  },
  {
    title: 'Logística',
    items: [
      { to: '/estoque', label: 'Estoque', icon: FiPackage, roles: ['stock', 'admin'] },
      { to: '/logistica', label: 'Entregas', icon: FiTruck, roles: ['stock', 'admin'] },
    ],
  },
  {
    title: 'Financeiro',
    items: [{ to: '/financeiro', label: 'Financeiro', icon: FiDollarSign, roles: ['admin', 'manager'] }],
  },
  {
    title: 'Gestão',
    items: [
      { to: '/rh', label: 'Gestão RH', icon: FiUsers, roles: ['hr', 'admin'] },
      { to: '/configuracoes', label: 'Configurações', icon: FiSettings, roles: ['admin'] },
    ],
  },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { hasAnyRole } = useAuth();

  const filteredGroups = NAV_GROUPS.map((group) => {
    const visibleItems = group.items.filter((item) => {
      if (!item.roles) return true;
      return hasAnyRole(item.roles);
    });
    return { ...group, items: visibleItems };
  }).filter((group) => group.items.length > 0);

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''
        }`}
    >
      <div className={styles.brand}>
        <img src={logoImg} alt="Mystogan Logo" className={styles.brandMark} />
        {!collapsed && (
          <div className={styles.brandText}>
            <span className={styles.brandName}>Mystogan</span>
            <span className={styles.brandTag}>ERP</span>
          </div>
        )}
        <button className={styles.closeMobile} onClick={onCloseMobile} aria-label="Fechar menu">
          <FiX size={18} />
        </button>
      </div>

      <nav className={styles.nav}>
        {filteredGroups.map((group, index) => (
          <div key={group.title ?? `group-${index}`} className={styles.navSection}>
            {group.title &&
              (collapsed ? (
                <span className={styles.navDivider} aria-hidden="true" />
              ) : (
                <span className={styles.navSectionLabel}>{group.title}</span>
              ))}

            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                title={collapsed ? label : undefined}
              >
                <span className={styles.navIcon}>
                  <Icon size={18} />
                </span>
                {!collapsed && <span className={styles.navLabel}>{label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <button className={styles.collapseBtn} onClick={onToggleCollapse} aria-label="Recolher menu">
        {collapsed ? (
          <FiChevronsRight size={16} />
        ) : (
          <>
            <FiChevronsLeft size={16} />
            <span>Recolher</span>
          </>
        )}
      </button>
    </aside>
  );
}
