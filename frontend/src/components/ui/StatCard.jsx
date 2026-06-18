import styles from './StatCard.module.css';

export default function StatCard({ icon: Icon, label, value, trend, trendLabel, tone = 'default' }) {
  const isPositive = typeof trend === 'number' && trend > 0;
  const isNegative = typeof trend === 'number' && trend < 0;

  return (
    <div className={`${styles.stat} ${styles[tone] ?? ''}`}>
      <div className={styles.iconWrap}>{Icon && <Icon size={18} />}</div>
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {trend !== undefined && (
          <span className={`${styles.trend} ${isPositive ? styles.up : isNegative ? styles.down : ''}`}>
            {isPositive ? '↑' : isNegative ? '↓' : '–'} {Math.abs(trend)}% {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
}