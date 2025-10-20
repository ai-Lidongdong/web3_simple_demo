import styles from "./page.module.css";
import { motion } from "framer-motion"
export default function MotionList() {
  return (
    <div className={styles.page}>
      <motion.div
          className="w-full p-6 dark:bg-muted/10 bg-muted border-b flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        ></motion.div>
    </div>
  );
}
