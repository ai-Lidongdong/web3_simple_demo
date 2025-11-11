// src/contexts/NetworkContext.tsx
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
// 导入 networkSlice 的 action
import { setChainId, setNetworkLoading, setNetworkError, resetNetwork } from '@/app/store/features/network/networkSlice';

// Context 状态类型（与 Redux 状态保持一致，便于同步）
type NetworkContextState = {
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
  // 可选：手动切换链的方法（如切换到 BSC）
  switchChain: (targetChainId: number) => Promise<boolean>;
};

// 创建 Context
const NetworkContext = createContext<NetworkContextState | undefined>(undefined);

// 自定义 Hook 供组件使用
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

// 主 Provider 组件
export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  // 本地状态（与 Redux 状态同步）
  const [localChainId, setLocalChainId] = useState<number | null>(null);
  const [localIsLoading, setLocalIsLoading] = useState<boolean>(true);
  const [localError, setLocalError] = useState<string | null>(null);
  // Redux dispatch
  const dispatch = useDispatch<AppDispatch>();

  // 检查 MetaMask 是否存在
  const hasEthereum = () => typeof window !== 'undefined' && !!window.ethereum;

  // 初始化网络状态（获取当前链 ID）
  const initNetwork = async () => {
    if (!hasEthereum()) {
      const error = '未检测到 MetaMask 或兼容钱包';
      setLocalError(error);
      dispatch(setNetworkError(error)); // 同步到 Redux
      return;
    }

    try {
      setLocalIsLoading(true);
      dispatch(setNetworkLoading(true)); // 同步到 Redux

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // 更新本地状态
      setLocalChainId(chainId);
      setLocalIsLoading(false);
      setLocalError(null);

      // 同步到 Redux
      console.log('初始化网络，链ID：', chainId);
      dispatch(setChainId(chainId));
    } catch (error: any) {
      const errMsg = `初始化网络失败：${error.message}`;
      setLocalError(errMsg);
      setLocalIsLoading(false);
      dispatch(setNetworkError(errMsg)); // 同步错误到 Redux
    }
  };

  // 切换链（如从 Ethereum 切换到 Polygon）
  const switchChain = async (targetChainId: number): Promise<boolean> => {
    if (!hasEthereum()) {
      setLocalError('未检测到钱包');
      dispatch(setNetworkError('未检测到钱包'));
      return false;
    }

    try {
      setLocalIsLoading(true);
      dispatch(setNetworkLoading(true));

      // 调用 MetaMask 的 wallet_switchEthereumChain 方法切换链
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toBeHex(targetChainId) }], // 链 ID 需转为 16 进制
      });

      // 切换成功后，会触发 chainChanged 事件，由下方监听器处理状态更新
      return true;
    } catch (error: any) {
      const errMsg = `切换链失败：${error.message}`;
      setLocalError(errMsg);
      setLocalIsLoading(false);
      dispatch(setNetworkError(errMsg));
      return false;
    }
  };

  // 监听链切换事件（MetaMask 中手动切换链时触发）
  useEffect(() => {
    if (!hasEthereum()) return;

    // 链切换回调
    const handleChainChanged = async (hexChainId: string) => {
      const chainId = parseInt(hexChainId, 16); // 16 进制转 10 进制
      console.log(`网络发生变化，新网络chainId${chainId}`);
      // 更新本地状态
      setLocalChainId(chainId);
      setLocalIsLoading(false);
      setLocalError(null);
      // 同步到 Redux
      dispatch(setChainId(chainId));
    };

    // 监听 MetaMask 的 chainChanged 事件
    window.ethereum.on('chainChanged', handleChainChanged);

    // 初始化网络状态
    initNetwork();

    // 组件卸载时移除监听
    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [dispatch]); // 依赖 dispatch 确保同步到 Redux

  // 合并 Context 状态（包含方法）
  const contextValue: NetworkContextState = {
    chainId: localChainId,
    isLoading: localIsLoading,
    error: localError,
    switchChain,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};