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
  UniswapV2Factory,
  UniswapV2Factory__factory,
  UniswapV2Pair,
  UniswapV2Pair__factory,
  UniswapV2Router,
  UniswapV2Router__factory,
  TokenA,
  TokenA__factory,
  TokenB,
  TokenB__factory,
  TokenC,
  TokenC__factory,
} from '../typechain-types';
// 导入合约地址配置
import { CONTRACTS_ADDRESSE } from '@/app/constants';

// 定义 Context 中存储的合约实例类型
type ContractInstances = {
  tokenAContract: TokenA | null,
  tokenBContract: TokenB | null,
  tokenCContract: TokenC | null,
  uniswapV2Factory: UniswapV2Factory | null,
  uniswapV2Pair: UniswapV2Pair | null,
  uniswapV2Router: UniswapV2Router | null,
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
export const DexContractProvider = ({ children }: { children: ReactNode }) => {
  // 从 WalletContext 获取 signer
  const { signer } = useWallet();
  // 从 NetworkContext 获取 chainId
  const { chainId } = useNetwork();
  // 存储合约实例的状态
  const [instances, setInstances] = useState<ContractInstances>({
    tokenAContract: null,
    tokenBContract: null,
    tokenCContract: null,
    uniswapV2Factory: null,
    uniswapV2Pair: null,
    uniswapV2Router: null,
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
        tokenAContract: null,
        tokenBContract: null,
        tokenCContract: null,
        uniswapV2Factory: null,
        uniswapV2Pair: null,
        uniswapV2Router: null,
        isLoading: false,
        error: '缺少 signer 或 chainId',
      });
      return;
    }

    try {
      // 创建合约实例（使用 TypeChain 工厂类，确保类型安全）
      const tokenAContract = TokenA__factory.connect(
        CONTRACTS_ADDRESSE[chainId].TOKENA_CONTRACT_ADDRESS,
        signer
      );
      const tokenBContract = TokenB__factory.connect(
        CONTRACTS_ADDRESSE[chainId].TOKENB_CONTRACT_ADDRESS,
        signer
      );
      const tokenCContract = TokenC__factory.connect(
        CONTRACTS_ADDRESSE[chainId].TOKENC_CONTRACT_ADDRESS,
        signer
      );
      const uniswapV2Factory = UniswapV2Factory__factory.connect(
        CONTRACTS_ADDRESSE[chainId].FACTORY_CONTRACT_ADDRESS,
        signer
      );
      const uniswapV2Pair = UniswapV2Pair__factory.connect(
        CONTRACTS_ADDRESSE[chainId].PAIR_CONTRACT_ADDRESS,
        signer
      );
      const uniswapV2Router = UniswapV2Router__factory.connect(
        CONTRACTS_ADDRESSE[chainId].ROUTER_CONTRACT_ADDRESS,
        signer
      );
      console.log('uniswapV2Router', uniswapV2Router.target)
      // 更新实例状态
      setInstances({
        tokenAContract,
        tokenBContract,
        tokenCContract,
        uniswapV2Factory,
        uniswapV2Pair,
        uniswapV2Router,
        isLoading: false,
        error: null,
      });
      dispatch(setContractAddress(CONTRACTS_ADDRESSE[chainId]));
    } catch (err: any) {
      // 捕获创建实例时的错误（如地址无效）
      setInstances({
        tokenAContract: null,
        tokenBContract: null,
        tokenCContract: null,
        uniswapV2Factory: null,
        uniswapV2Pair: null,
        uniswapV2Router: null,
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