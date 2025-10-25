'use client'
import React, { useState, useEffect } from 'react';
import { Card, Button, Image } from 'antd';
import { ethers, Contract } from "ethers";
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from "framer-motion";
import { NFT_CONTRACT_ADDRESS, IPFS_GATEWAY } from '@/app/constants';
import MyNFTABI from '../abi/MyNFTModule#MyNFT.json';
import type { NftMetadata, NftMetadataList } from './Nft';
// 定义动画变体
const variants = {
  inactive: { y: 40, opacity: 0 },
  active: { y: 0, opacity: 1 }
};
const Home = () => {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [nftList, setNftList] = useState<NftMetadataList[]>();
  const [isHovered, setIsHovered] = useState(false);
  const { Meta } = Card;
  const { user } = usePrivy() as any;
  const { address } = user?.wallet || {};
  useEffect(() => {
    if (user) {
      getBalance()
    }
  }, [address])
  const getBalance = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // create Contract instance
      const contract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        MyNFTABI.abi,
        signer,
      );
      try {
        // query total nfts count
        const userBalance = await contract?.balanceOf(NFT_CONTRACT_ADDRESS);
        console.log('----userBalance', userBalance)
        if (typeof userBalance === 'bigint') {
          const balanceNum = Number(userBalance);
          setBalance(balanceNum)

          // 2. 批量查询每个 NFT 的 tokenId（这里假设合约实现了 tokenOfOwnerByIndex 方法）
          const tokenIdList = [];
          for (let i = 0; i < balanceNum; i++) {
            const tokenId = await contract.tokenByIndex(i);
            const tokenIdNum = Number(tokenId);
            // 初始化 NFT 项，标记为加载中
            tokenIdList.push(tokenIdNum);
          }
          console.log('-tokenIdList', tokenIdList)
          const nfts = await Promise.all(tokenIdList.map(async (item: string | number) => {
            const cid = await contract.tokenURI(item);
            const metadata: NftMetadata = await fetchNFTMetadata(cid);
            return {
              tokenId: item,
              metadata: metadata
            }
          }))
          console.log('------------nfts', nfts);
          setNftList(nfts);
        }
      } catch (err) {
        console.error('err:', err)
      }
    }
  }

  // 从 IPFS 或 HTTP 加载 NFT 元数据
  const fetchNFTMetadata = async (tokenUri: string) => {
    try {
      // 处理 IPFS 路径（如 ipfs://Qm... 转换为 http 链接）
      const url = tokenUri.startsWith('ipfs://')
        ? `${IPFS_GATEWAY}${tokenUri.slice(7)}`
        : tokenUri;
      console.log('-1--url', url)
      const response = await fetch(url);
      if (!response.ok) throw new Error('元数据加载失败');

      const metadata = await response.json();

      // 处理图片的 IPFS 路径
      if (metadata.image?.startsWith('ipfs://')) {
        metadata.image = `${IPFS_GATEWAY}${metadata.image.slice(7)}`;
      }

      return metadata;
    } catch (err) {
      console.error('加载元数据失败:', err);
      return null;
    }
  };

  // burn nft
  const onBurnNft = async () => {
    // 1. 连接钱包
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // 请求授权
    const signer = await provider.getSigner();

    // 2. 初始化合约实例
    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      MyNFTABI.abi,
      signer
    );

    // 3. 调用铸造函数，传入目标地址
    const tx = await nftContract.burn(4);
    console.log('-------------------------->tx', tx)
  }
  const ass = ({ tokenId, metadata }) => {
    return (
      <div className={styles.nft_title}>
        <div className={styles.nft_name}>#{tokenId}</div>
        <div className={styles.nft_price}>{metadata.price}</div>
      </div>
    )
  }
  return (
    <>
      <div className={styles.opt_list}>
        <span>当前总共：{balance}</span>
        <Button type='primary' onClick={() => { router.push('/nft/addNft') }}>Add NFT</Button>
        <Button type='primary' onClick={onBurnNft}>Burn NFT</Button>
      </div>
      <div className={styles.nft_list}>
        {
          nftList?.map((item: any) => {
            const { metadata, tokenId } = item;
            return (
              <motion.div
              className={styles.nft_item}
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}>
                <Image className={styles.nft_img} src={metadata.image} />
                <div className={styles.nft_info}>
                  <div className={styles.top}>
                    <span className={styles.single_line}>{metadata.name}</span>
                    <span className={styles.token_id}>#{tokenId}</span>
                  </div>
                  <div className={styles.detail}>
                    <div className={styles.price}>{metadata.price.toFixed(2)}<span>  NT</span></div>
                    <div className={styles.last_sale}>Last sale <span>{metadata.price.toFixed(2)}</span>  NT</div>
                  </div>
                </div>
                <motion.div
                  className={styles.buy_now}
                  variants={variants}
                  initial="inactive"
                  animate={isHovered ? "active" : "inactive"} // 根据状态切换变体
                  transition={{ duration: 0.3 }}
                >
                  <span>Buy now</span>
                  <span>{metadata.price.toFixed(2)}  NT</span>
                </motion.div>
              </motion.div>
            )
          })
        }
      </div>
    </>
  );
}

export default Home;