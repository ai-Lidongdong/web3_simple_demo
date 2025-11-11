'use client';
import { ReactNode } from 'react';
import { NetworkProvider } from './NetworkContext';
import { WalletProvider } from './WalletContext';

import { ContractProvider } from './ContractContext';

// 组合 Provider：接收各个子 Provider 所需的参数，内部嵌套所有 Provider
export const CombinedProvider = ({ 
  children, 
}: { children: ReactNode }) => {
  return (
    <NetworkProvider>
      <WalletProvider>
        <ContractProvider>
        {children}
        </ContractProvider>
      </WalletProvider>
    </NetworkProvider>
  );
};