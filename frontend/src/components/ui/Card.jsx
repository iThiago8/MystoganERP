import styles from './Card.module.css';

export default function Card({ title, subtitle, action, children, className = '', noPadding = false }) {
  return (
    <div className={`${styles.card} ${className}`}>
      {(title || action) && (
        <div className={styles.cardHeader}>
          <div>
            {title && <h3 className={styles.cardTitle}>{title}</h3>}
            {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
          </div>
          {action && <div className={styles.cardAction}>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : styles.cardBody}>{children}</div>
    </div>
  );
}