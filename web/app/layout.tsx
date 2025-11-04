'use client'
import { PrivyProvider } from '@privy-io/react-auth';
import React, { useEffect } from 'react';
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
  }, [])


  return (
    <html lang="en">
      <body>
        {/* 配置 Privy Provider */}
        <PrivyProvider
          appId="cmgvtsoyg00qyl10c90rl26z4"  // 替换为你的实际 appId
          config={{
            // 可选配置：自定义登录方式、主题等
            loginMethods: ['wallet'],  // 仅允许钱包登录（默认包含多种方式）
            appearance: {
              theme: 'light',
              accentColor: '#6366f1',
            },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
