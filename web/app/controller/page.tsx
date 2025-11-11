'use client';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { Button, Input } from 'antd';
import { usePrivy } from '@privy-io/react-auth';
import { COIN_CONTRACT_ADDRESS } from '../constants';
import MyNFTABI from '../artifacts/MyTokenModule#MyToken.json';

const Controller = () => {
    const { user } = usePrivy() as any;
    const { address } = user?.wallet || {};
    const [mintTokenAddress, setMintTokenAddress] = useState(null);
    const [amount, setAmount] = useState(1);
    const [balance, setBalance] = useState(0);

    useEffect(()=>{
        if(address) {
            getBalance();
        }
    }, [address])

    // 定义 handleMint 函数，用于铸造代币
    async function onMint() {
        if (window.ethereum) {
            // 创建以太坊提供者和签名者实例
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // 初始化智能合约实例
            const contract = new ethers.Contract(
                COIN_CONTRACT_ADDRESS,
                MyNFTABI.abi,
                signer
            );
            try {
                // 将用户输入的铸造数量转换为以太坊单位（最小单位 Wei）
                // const mintAmountInETH = ethers.parseUnits(JSON.stringify(amount), 'ether');
                // 调用智能合约的 mint 方法，并传入铸造数量
                await contract.mintToken(mintTokenAddress, BigInt(amount));
                // 监听合约的 Mint 事件，铸造完成后刷新余额
                contract.on("Mint", async () => {
                    getBalance();
                });
            } catch (e) {
                // 捕获并打印铸造失败的错误信息
                console.log("error", e);
            }
        }
    }

    // query balance of token in user's address
    const getBalance = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                COIN_CONTRACT_ADDRESS,
                MyNFTABI.abi,
                signer,
            );
            try {
                const userBalance = await contract.balanceOf(address);
                const balance = ethers.formatUnits(userBalance, 18); // 把wei转换为eth单位
                const formattedBalance = parseFloat(balance).toFixed(2);
                console.log('----formattedBalance', formattedBalance)
                setBalance(formattedBalance);

            } catch (err) {
                console.error('err:', err)
            }
        }
    }
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">

            <h3>同质化代币</h3>
            <div>余额：{balance}</div>
            <div className={styles.input}>
                你要给<Input className={styles.text} onChange={(e) => { setMintTokenAddress(e.target.value) }} />
                增发：<Input className={styles.text} onChange={(e) => { setAmount(Number(e.target.value)) }} />
            </div>
            <Button type='primary' className={styles.button} onClick={onMint}>铸造</Button>
        </div>
    );
}

export default Controller;