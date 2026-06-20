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
import styles from './Sidebar.module.css';

const NAV_GROUPS = [
  {
    items: [{ to: '/', label: 'Dashboard', icon: FiGrid, end: true }],
  },
  {
    title: 'Logística',
    items: [
      { to: '/estoque', label: 'Estoque', icon: FiPackage },
      { to: '/logistica', label: 'Entregas', icon: FiTruck },
    ],
  },
  {
    title: 'Financeiro',
    items: [{ to: '/financeiro', label: 'Financeiro', icon: FiDollarSign }],
  },
  {
    title: 'Gestão',
    items: [
      { to: '/funcionarios', label: 'Funcionários', icon: FiUsers },
      { to: '/configuracoes', label: 'Configurações', icon: FiSettings },
    ],
  },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${
        mobileOpen ? styles.mobileOpen : ''
      }`}
    >
      <div className={styles.brand}>
        <div className={styles.brandMark}>M</div>
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
        {NAV_GROUPS.map((group, index) => (
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
