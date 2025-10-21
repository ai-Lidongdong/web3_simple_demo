'use client'
import { Geist, Geist_Mono } from "next/font/google";
import { PrivyProvider } from '@privy-io/react-auth';
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCookie } from '@/utils'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); 
  console.log('哈哈哈哈哈哈哈哈哈哈或')
  useEffect(()=>{
const token = getCookie('privy-session');
console.log('token 的值：', token);
  }, [])

console.log('------pathname', pathname)

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`}
      >
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
