// src/components/ContractInitializer.tsx（优化版）
'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
// import { useWallet } from '@/app/contexts/WalletContext'; // 从 Context 获取 signer
import { selectIsNetworkReady } from '@/app/store/features/network/networkSlice'; // 导入就绪判断

export default function ContractInitializer() {
  const { isConnected } = useSelector((state: RootState) => state.wallet);
  const isNetworkReady = useSelector(selectIsNetworkReady); // 网络是否就绪（chainId 有效）
  // const { status } = useSelector((state: RootState) => state.myTokenContract);
  const dispatch = useDispatch<AppDispatch>();
  // const { signer } = useWallet();


  useEffect(() => {
    // 调用条件（缺一不可）：
    // 1. 钱包已连接且有 signer
    // 2. 网络就绪（chainId 已获取且无错误）
    // 3. 合约未初始化或初始化失败（避免重复调用）
    // if (isConnected && isNetworkReady && (status === 'idle' || status === 'failed')) {
    //   dispatch(initializeContracts({
    //     signer
    //   }));
    // }
  }, [isConnected, isNetworkReady, status, dispatch]);

  return null; // 仅执行逻辑，不渲染 UI
}