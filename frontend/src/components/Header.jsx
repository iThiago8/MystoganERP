import { FiBell, FiLogOut, FiMenu, FiSearch } from 'react-icons/fi';
import { useAuth } from '../auth/useAuth';
import styles from './Header.module.css';

export default function Header({ title, onOpenMobile }) {
  const { user, logout } = useAuth();
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'ME';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onOpenMobile} aria-label="Abrir menu">
          <FiMenu size={20} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        <div className={styles.search}>
          <FiSearch size={16} />
          <input type="text" placeholder="Buscar no sistema..." />
        </div>

        <button className={styles.iconBtn} aria-label="Notificações">
          <FiBell size={18} />
          <span className={styles.dot} />
        </button>

        <div className={styles.divider} />

        <div className={styles.user}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.email || 'Usuário'}</span>
            <span className={styles.userRole}>{user?.roleLabel || 'Acesso'}</span>
          </div>
        </div>

        <button className={styles.iconBtn} onClick={logout} aria-label="Sair">
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
}
