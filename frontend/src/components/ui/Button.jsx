import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', icon: Icon, ...props }) {
  return (
    <button className={`${styles.btn} ${styles[variant] ?? ''}`} {...props}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}