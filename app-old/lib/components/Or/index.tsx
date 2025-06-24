import { useTranslations } from 'next-intl';
import styles from './styles.module.css';

export default function Or() {
  const t = useTranslations('Messages');

  return (
    <div className={`mb-2 ${styles.orContainer}`}>
      <span className={styles.or}>{t('or')}</span>
    </div>
  );
}
