// 页面头部
'use client'
import React, { useEffect, useState } from 'react';
import { Dropdown, Layout } from 'antd';
import type { MenuProps } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import { DownOutlined, LoginOutlined, CopyOutlined } from '@ant-design/icons';
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import styles from './index.module.css';
import { useContracts } from '@/app/contexts/ContractContext';
const { Header } = Layout;

const Logout = () => {
    const { address } = useSelector((state: RootState) => state.wallet);
    const { login, logout } = usePrivy();
    const  { myToken } = useContracts();
    const [balance, setBalance] = useState<string | null>(null);    // balance of the user in this contract

    useEffect(() => {
        console.log('---余额查询')
        if (myToken) {
            getBalance();
        }
    }, [myToken])

    const getBalance = async () => {
            try {
        console.log('---myToken', myToken)
        console.group('0--address', address)
                const userBalance = await myToken?.balanceOf(address);
                const balance = ethers.formatUnits(userBalance, 18); // 把wei转换为eth单位
                const formattedBalance = parseFloat(balance).toFixed(2);
                console.log('--formattedBalance', formattedBalance)
                setBalance(formattedBalance);
            } catch (err) {
                console.error('err:', err)
            }
    }

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
    const onLogin = async () => {
        await login();
        getBalance();
    }

    return (
        <>
            <Header className={styles.nft_header}>
                {address ?  // have been logined, show the wallet address
                    <div className={styles.logined}>
                        <div style={{color: '#fff'}}>Balance：{balance}</div>
                        <Dropdown menu={{ items }} placement="bottom">
                            <motion.div className={`${styles.user}`} whileHover={{ background: '#6c5e5eff' }}>
                                <img className={`${styles.wallet_icon}`} src="/wallet_icon.png" />
                                <span className={`${styles.address} single_line`} style={{ margin: '0 10px' }}>
                                    {`${address.slice(0, 6)}....${address.slice(-4)}`}
                                </span>
                                <CopyToClipboard
                                    text={address}
                                >
                                    <CopyOutlined style={{ margin: '0 10px 0 0' }} />
                                </CopyToClipboard>
                                <DownOutlined />
                            </motion.div>
                        </Dropdown>
                    </div> :
                    // not login
                    <div className={styles.unlogin}>
                        <motion.div className={styles.connect_text} whileHover={{ background: '#5f5353ff' }} onClick={onLogin}>
                            Connect Wallet
                        </motion.div>
                        <div className={styles.line} />
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