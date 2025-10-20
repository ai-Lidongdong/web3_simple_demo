
import styles from "../css/LayoutHeader.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from 'next/navigation';

export default function MotionList() {
    const { logout  } = usePrivy();
    const router = useRouter();
    let show = true
    const onExit = async () => {
        await logout();
        router.push('/login')

    }
    return (
          <div className={styles.layout_header}>
            <button className={styles.exit_but} onClick={onExit}>退出登录</button>
          </div>
    );
}
