import { FiMenu, FiSearch, FiBell, FiChevronDown } from 'react-icons/fi';
import styles from './Header.module.css';

export default function Header({ title, onOpenMobile }) {
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

        <button className={styles.user}>
          <div className={styles.avatar}>MS</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Mystogan Admin</span>
            <span className={styles.userRole}>Administrador</span>
          </div>
          <FiChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}