// src/contexts/ContractContext.tsx
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWallet } from './WalletContext'; // 获取 signer
import { useNetwork } from './NetworkContext'; // 获取 chainId
import { AppDispatch } from '@/app/store';
import { setContractAddress } from '@/app/store/features/network/networkSlice';
import { useDispatch } from 'react-redux';
// 导入 TypeChain 工厂类、实例类
import {
    NFTMarketPlace,
    MyNFT,
    MyToken,
    MyToken__factory,
    MyNFT__factory,
    NFTMarketPlace__factory
} from '../typechain-types';
// 导入合约地址配置
import { CONTRACTS_ADDRESSE } from '@/app/constants';

// 定义 Context 中存储的合约实例类型
type ContractInstances = {
  myToken: MyToken | null; // MyToken 合约实例
  myNFT: MyNFT | null; // MyNFT 合约实例
  NFTMarketPlace: NFTMarketPlace | null;    //nft交易平台合约
  isLoading: boolean; // 实例是否正在创建
  error: string | null; // 实例创建错误
};

const ContractContext = createContext<ContractInstances | undefined>(undefined);

// 自定义 Hook，供组件获取合约实例
export const useContracts = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContracts must be used within ContractProvider');
  }
  return context;
};

// 继续在 ContractContext.tsx 中定义 Provider
export const ContractProvider = ({ children }: { children: ReactNode }) => {
  // 从 WalletContext 获取 signer
  const { signer } = useWallet();
  // 从 NetworkContext 获取 chainId
  const { chainId } = useNetwork();
  // 存储合约实例的状态
  const [instances, setInstances] = useState<ContractInstances>({
    myToken: null,
    myNFT: null,
    NFTMarketPlace: null,
    isLoading: true,
    error: null,
  });
  // Redux dispatch
  const dispatch = useDispatch<AppDispatch>();

  // 当 signer 或 chainId 变化时，重新创建合约实例
  useEffect(() => {
    console.log(`signer || chainId 发生变化`);
    // 重置状态：开始加载
    setInstances(prev => ({ ...prev, isLoading: true, error: null }));

    // 若缺少 signer 或 chainId，无法创建实例
    if (!signer || !chainId) {
      setInstances({
        myToken: null,
        myNFT: null,
        NFTMarketPlace: null,
        isLoading: false,
        error: '缺少 signer 或 chainId',
      });
      return;
    }

    try {
      // 创建合约实例（使用 TypeChain 工厂类，确保类型安全）
      const myToken = MyToken__factory.connect(
        CONTRACTS_ADDRESSE[chainId].COIN_CONTRACT_ADDRESS,
        signer
      );
      const myNFT = MyNFT__factory.connect(
        CONTRACTS_ADDRESSE[chainId].NFT_CONTRACT_ADDRESS,
        signer
      );
      const NFTMarketPlace = NFTMarketPlace__factory.connect(
        CONTRACTS_ADDRESSE[chainId].NFT_CONTRACT_ADDRESS,
        signer
      );

    console.log(`合约实例修改完成`);
      // 更新实例状态
      setInstances({
        myToken,
        myNFT,
        NFTMarketPlace,
        isLoading: false,
        error: null,
      });
      dispatch(setContractAddress(CONTRACTS_ADDRESSE[chainId]));
    } catch (err: any) {
      // 捕获创建实例时的错误（如地址无效）
      setInstances({
        myToken: null,
        myNFT: null,
        NFTMarketPlace: null,
        isLoading: false,
        error: `创建合约实例失败：${err.message}`,
      });
    }
  }, [signer]); // 依赖 signer 和 chainId，变化时重新执行

  return (
    <ContractContext.Provider value={instances}>
      {children}
    </ContractContext.Provider>
  );
};