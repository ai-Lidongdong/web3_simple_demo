'use client'
import React, { useState, useEffect } from 'react';
import { Card, Button, Image } from 'antd';
import { ethers, Contract } from "ethers";
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { NFT_CONTRACT_ADDRESS, IPFS_GATEWAY } from '@/app/constants';
import MyNFTABI from '../abi/MyNFTModule#MyNFT.json';
import type { NftMetadata, NftMetadataList } from './Nft';

const Home = () => {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [nftList, setNftList] = useState<NftMetadataList[]>();
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
        const userBalance = await contract?.balanceOf(address);
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
  const ass = ({tokenId, metadata}) =>{
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
              <div className={styles.nft_item}>
                <Image className={styles.nft_img} src={metadata.image}/>
                <div className={styles.nft_info}>
                  <div className={styles.top}>
                    <span className={styles.single_line}>{metadata.name}</span>
                    #{tokenId}
                  </div>
                  <div className={styles.detail}>
                    <div className={styles.price}>{metadata.price}<span>  NT</span></div>
                    <div className={styles.last_sale}>Last sale{metadata.price} <span>  NT</span></div>
                  </div>

                </div>

              </div>
              // <Card
              //   className={styles.nft_item}
              //   hoverable
              //   key={tokenId}
              //   style={{ width: 240 }}
              //   cover={
              //     <img
              //       draggable={false}
              //       alt="example"
              //       src={metadata.image}
              //     />
              //   }
              // >
              //   <Meta
              //   className={styles.meta}
              //   title={ass(item)}
              //   description="www.instagram.com" />
              // </Card>
            )
          })
        }
      </div>
    </>
  );
}

export default Home;