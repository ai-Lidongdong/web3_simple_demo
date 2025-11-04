'use client'
import React from 'react';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Layout, Menu } from 'antd';
import Image from 'next/image';
import { UserOutlined } from '@ant-design/icons';
import styles from "./page.module.css";
import NFTHeader from '@/app/components/NFTHeader';
import Link from 'next/link';
const { Sider, Content } = Layout;

const NFTList = ({ children }: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname(); // current page route pathname
  const { user } = usePrivy(); // get connected wallet info

  return (
    <div className={styles.wrap}>
      <Layout>
        <Sider
          style={{ height: '100vh' }}
          trigger={null}
          width={180}
        >
          <div className={styles.platform_name}>
            <Image src="/lds_logo.png"
              alt="NFT 图片"
              width={50}
              height={50} />
            <span>NFT Trade</span>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname]}
            style={{ borderRight: 0 }} // 全屏高度，去除右侧边框
          >
            {/* nft list page */}
            <Menu.Item key="/nft">
              <Link href="/nft">
                <UserOutlined />
                <span>首页</span>
              </Link>
            </Menu.Item>
            {/* my nft list */}
            <Menu.Item key="/nft/myNft">
              <Link href="/nft/myNft">
                <span>我的NFT</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <NFTHeader address={user?.wallet?.address} />
          <Content
            style={{
              padding: 12,
              height: '92vh',
              background: '#222426',
            }}
          >
            <div
              style={{
                borderRadius: '12px',
                height: '90vh',
                background: '#191E26'
              }}
            >
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
export default NFTList;
