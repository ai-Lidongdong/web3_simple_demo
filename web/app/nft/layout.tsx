'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Layout, Menu, theme } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getCookie } from '@/utils';
import styles from "./page.module.css";
import NFTHeader from '@/app/components/NFTHeader';

const { Sider, Content } = Layout;

const NFTList = ({ children }) => {
  const router = useRouter();
const { user } = usePrivy();

  useEffect(() => {
    const privySession = getCookie('privy-session');
    if(!privySession) {
      router.replace('/login')
    }
  }, []);

  return (
    <div className={styles.wrap}>
      <Layout style={{ height: '100%' }}>
        <Sider trigger={null} collapsible collapsed={false}>
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            items={[
              {
                key: '1',
                icon: <UserOutlined />,
                label: 'NFT列表',
              },
            ]}
          />
        </Sider>
        <Layout>
          <NFTHeader address={user?.wallet?.address}/>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: '#fff',
              borderRadius: '10px',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
export default NFTList;