'use client'
import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { Provider } from 'react-redux';
import { CombinedProvider } from './contexts/CombinedProvider';
import { makeStore } from '@/app/store';
import InitialLayout from './components/InitialLayout';
import "./globals.css";
// 封装网络监听逻辑的组件（避免在 RootLayout 中写过多逻辑）

// 客户端初始化 Redux Store
const store = makeStore();
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body>
        {/* 配置 Privy Provider */}
        <Provider store={store}>
          <PrivyProvider
            appId="cmgvtsoyg00qyl10c90rl26z4"  // 替换为你的实际 appId
            config={{
              // 可选配置：自定义登录方式、主题等
              loginMethods: ['wallet'],  // 仅允许钱包登录（默认包含多种方式）
              appearance: {
                theme: 'light',
                accentColor: '#6366f1',
              },
              // 关键修复：禁用 WalletConnect（避免无 Project ID 导致的请求失败）
              walletConnect: {
                enabled: false,
              }
            }}
          >
              <CombinedProvider>
                <InitialLayout />
                {children}
                </CombinedProvider>
          </PrivyProvider>
        </Provider>
      </body>
    </html>
  );
}
