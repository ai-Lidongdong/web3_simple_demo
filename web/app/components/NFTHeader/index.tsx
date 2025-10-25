// 退出登录
'use client'
import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
import { DownOutlined, LoginOutlined } from '@ant-design/icons';
import { motion } from "framer-motion";
import styles from './index.module.css';
const { Header } = Layout;


const Logout = ({ address }: {
    address: string;
}) => {
    const { logout } = usePrivy();
    const router = useRouter();

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <div className={styles.logout} onClick={async () => {
                    await logout();
                    router.replace('/login')
                }}>
                    <LoginOutlined className={styles.logout_icon} /><span>Layout</span>
                </div>
            ),
        },
    ];

    return (
        <>
          <Header className={styles.nft_header}>
            <Dropdown menu={{ items }} placement="bottom">
                <motion.div className={`${styles.user}`} whileHover={{background: '#6c5e5eff'}}>{address}<DownOutlined/></motion.div>
            </Dropdown>
          </Header>

        </>
    );
}
export default Logout;