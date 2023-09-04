import messages from "@/i18n/messages";
import styles from "./styles.module.css";

export default function Or() {
  return (
    <div className={`mb-2 ${styles.orContainer}`}>
      <span className={styles.or}>{messages.messages.or}</span>
    </div>
  );
}
