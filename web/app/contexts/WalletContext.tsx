// src/contexts/WalletContext.tsx
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers, Signer } from 'ethers';
import { useDispatch } from 'react-redux'; // 用于同步到 Redux
import { AppDispatch } from '@/app/store';
import { setWalletInfo } from '@/app/store/features/wallet/walletSlice'; // Redux Action
import { useNetwork } from './NetworkContext'; // 获取 chainId

// 钱包状态类型
type WalletState = {
  isConnected: boolean;
  address: string | null;
  signer: Signer | null;
  isLoading: boolean;
  connect: () => Promise<void>; // 手动连接钱包
  disconnect: () => Promise<void>;
};

const WalletContext = createContext<WalletState | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used in WalletProvider');
  return context;
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>(); // 用于同步到 Redux
  const { chainId } = useNetwork();

  // 检测 MetaMask 是否安装
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && !!window.ethereum && window.ethereum.isMetaMask;
  };

  // 初始化：检测 MetaMask 已连接状态
  const initMetaMask = async () => {
    console.log('----初始化------------------------》')
    setIsLoading(true);
    try {
      if (!isMetaMaskInstalled()) {
        console.log('MetaMask 未安装');
        resetWalletState();
        return;
      }

      // 1. 检测已授权的账户（MetaMask 已连接过）
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        // 未授权任何账户（未连接）
        resetWalletState();
        return;
      }

      // 2. 已连接：获取 signer 和地址
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // 更新本地状态
      setAddress(address);
      setSigner(signer);

      // 3. 同步到 Redux（关键：让 Redux 存储钱包信息）
      dispatch(setWalletInfo({ address, isConnected: true }));
    } catch (error) {
      console.error('MetaMask 初始化失败:', error);
      resetWalletState();
    } finally {
      setIsLoading(false);
    }
  };

  // 重置钱包状态
  const resetWalletState = () => {
    setAddress(null);
    setSigner(null);
    dispatch(setWalletInfo({ address: '', isConnected: false })); // 同步到 Redux
  };

  // 手动连接 MetaMask
  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      alert('请安装 MetaMask');
      return;
    }
    setIsLoading(true);
    try {
      // 触发 MetaMask 授权弹窗
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // 授权后重新初始化状态
      await initMetaMask();
    } catch (error) {
      console.error('连接失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 断开连接（MetaMask 无主动断开方法，仅重置状态）
  const disconnect = async () => {
    resetWalletState();
  };

  // 监听账户变化（用户切换 MetaMask 账户）
  useEffect(() => {
    console.log('----检测到chainId变化')
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        console.log('账户被断开')
        // 账户被断开
        resetWalletState();
      } else {
        // 账户切换，重新初始化
        console.log('账户切换，重新初始化')
        initMetaMask();
      }
    };

    // 监听 MetaMask 账户变化事件
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    // 组件挂载时初始化检测
    initMetaMask();

    // 组件卸载时移除监听
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [dispatch, chainId]); // 依赖 dispatch 确保同步到 Redux

  return (
    <WalletContext.Provider
      value={{
        isConnected: !!address,
        address,
        signer,
        isLoading,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};