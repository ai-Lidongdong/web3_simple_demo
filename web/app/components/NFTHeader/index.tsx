// 页面头部
'use client'
import React from 'react';
import { Dropdown, Layout } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, LoginOutlined } from '@ant-design/icons';
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import styles from './index.module.css';
const { Header } = Layout;

const Logout = ({ address }: {
    address: string | undefined;    // address of the wallet
}) => {
    const { login, logout } = usePrivy();
    const router = useRouter();

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <div className={styles.logout} onClick={async () => {
                    await logout();
                }}>
                    <LoginOutlined className={styles.logout_icon} /><span>Layout</span>
                </div>
            ),
        },
    ];


    // login，connect wallet。
    const onLogin = async() => {
        await login();
    }

    return (
        <>
            <Header className={styles.nft_header}>
                {address ?  // have been logined, show the wallet address
                    <Dropdown menu={{ items }} placement="bottom">
                        <motion.div className={`${styles.user}`} whileHover={{ background: '#6c5e5eff' }}>
                            <img className={`${styles.wallet_icon}`} src="/wallet_icon.png" />
                            <span className={`${styles.address} single_line`} style={{ margin: '0 10px' }}>{address}</span>
                            <DownOutlined />
                        </motion.div>
                    </Dropdown> :
                    // not login
                    <div className={styles.unlogin}>
                        <motion.div className={styles.connect_text} whileHover={{ background: '#5f5353ff' }} onClick={onLogin}>
                            Connect Wallet
                        </motion.div>
                        <div className={styles.line}/>
                        <motion.div className={styles.wallet_box} whileHover={{ background: '#5f5353ff' }} onClick={onLogin}>
                            <img src="/unlogin_wallet.png" />
                        </motion.div>
                    </div>
                }
            </Header>

        </>
    );
}
export default Logout;