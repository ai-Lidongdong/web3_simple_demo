'use client'
import React from 'react';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Layout, Menu, Spin } from 'antd';
import Image from 'next/image';
import { UserOutlined, ProductOutlined } from '@ant-design/icons';
import styles from "./page.module.css";
import NFTHeader from '@/app/components/NFTHeader';
import Link from 'next/link';
import { pathToMenuKey } from '../../utils';
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
            selectedKeys={pathToMenuKey(pathname)}
            style={{ borderRight: 0 }} // 全屏高度，去除右侧边框
          >
            {/* nft list page */}
            <Menu.Item key="/nft">
              <Link href="/nft">
                <ProductOutlined />
                <span>HOME</span>
              </Link>
            </Menu.Item>
            {/* my nft list */}
            <Menu.Item key="/nft/myNft">
              <Link href="/nft/myNft">
                <UserOutlined />
                <span>MY NFT</span>
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
            <Spin spinning={false} size='large'>
            <div
              style={{
                borderRadius: '12px',
                height: '90vh',
                background: '#191E26'
              }}
            >
              {children}
            </div>
            </Spin>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
export default NFTList;
