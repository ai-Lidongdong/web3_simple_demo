'use client'
import React, { useState, useEffect } from 'react';
import { Button, Image, Tabs } from 'antd';
import { ethers, Contract } from "ethers";
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from "framer-motion";
import { NFT_CONTRACT_ADDRESS } from '@/app/constants';
import MyNFTABI from '../../artifacts/MyNFTModule#MyNFT.json';
import type { NFTMetadataRes, NftMetadataList } from '../nft';
import styles from "./page.module.css";
import { fetchNFTMetadata } from '../../../utils';
import { fetchApi } from '../../axios/nft';
// 定义动画变体
const variants = {
  inactive: { y: 50, opacity: 0 },
  active: { y: 0, opacity: 1 },
};

const MyNft = () => {
  const router = useRouter();
  const { user } = usePrivy() as any;
  const { address } = user?.wallet || {};

  const [activeTab, setActiveTab] = useState('1');
  const [nftList, setNftList] = useState<NftMetadataList[]>();
  const [isHovered, setIsHovered] = useState<string>('');
  const [turnAllSelect, onTurnAllSelect] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<string>('');

  const [myOrders, setMyOrders] = useState<NftMetadataList[]>();
  const [turnAllOrder, onTurnAllOrder] = useState<boolean>(false);
  useEffect(() => {
    if (address) {
      getMyAllNFTList();
      getMyOrder();
    }
  }, [address])

  // get all nfts from my current connected wallet
  const getMyAllNFTList = async () => {
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

          // 2. batch query each tokenId of NFT
          const tokenIdList = [];
          for (let i = 0; i < balanceNum; i++) {
            const tokenId = await contract.tokenOfOwnerByIndex(address, i);
            const tokenIdNum = Number(tokenId);
            tokenIdList.push(tokenIdNum);
          }
          const nfts = await Promise.all(tokenIdList.map(async (item: string | number) => {
            const cid = await contract.tokenURI(item);
            const metadata: NFTMetadataRes = await fetchNFTMetadata(cid);
            return {
              tokenId: item,
              metadata: metadata
            }
          }))
          setNftList(nfts);
        }
      } catch (err) {
        console.error('err:', err)
      }
    }
  }

  // get all of my orders in market
  const getMyOrder = async () => {
    const result = await fetchApi(`/api/orders/seller/${address}`) as any;
    setMyOrders(result);
  }
  // burn nft
  const onBurnNft = async () => {
    // 1. connect walllet
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // 请求授权
    const signer = await provider.getSigner();

    // 2. initialize contract instance
    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      MyNFTABI.abi,
      signer
    );

    // 3. mint nft to target address
    const tx = await nftContract.burn(4);
  }

  // opt nft
  const onSelectNft = (event: any, tokenId: string) => {
    event.stopPropagation();
    if (selectedToken === tokenId) {
      setSelectedToken('');
      return;
    }
    setSelectedToken(tokenId);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.opt_list}>
        <div>
          <Button style={{ background: '#8127DA', border: 'none', color: '#fff' }} onClick={() => { router.push('/nft/addNft') }}>Add NFT</Button>
        </div>
      </div>
      <Tabs
        type="card"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          {
            label: 'MY NFTS',
            key: '1',
            children: <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', margin: '10px 10px' }}>
                <img className={styles.items_total} onClick={() => {
                  onTurnAllSelect(!turnAllSelect);
                }} src={`${turnAllSelect ? '/all_selected.png' : '/all_unselect.png'}`} />
                <span>TOTAL：{nftList?.length} ITEMS</span>
              </div>
              <div className={styles.nft_list}>
                {
                  nftList?.map((item: any) => {
                    const { metadata, tokenId } = item;
                    return (
                      <motion.div
                        className={`${styles.nft_item} ${turnAllSelect ? styles.nft_item_active : ''}`}
                        whileHover={{ scale: 1.02 }}
                        onHoverStart={() => setIsHovered(tokenId.toString())}
                        onHoverEnd={() => setIsHovered('')}
                        onClick={() => {
                          router.push(`/nft/nftDetail?tokenId=${tokenId}`);
                        }}>
                        {turnAllSelect &&
                          <img
                            className={styles.select}
                            onClick={(e) => { onSelectNft(e, item.tokenId) }}
                            src={`${selectedToken === tokenId ? '/selected.png' : '/unselect.png'}`} />}
                        <div className={styles.nft_img}>
                          <Image preview={false} src={metadata?.image} />
                        </div>

                        <div className={styles.nft_info}>
                          <div className={styles.top}>
                            <span className={styles.single_line}>{metadata.name}哈哈哈好好</span>
                            <span className={styles.token_id}>#{tokenId}</span>
                          </div>
                          <div className={styles.detail}>
                          </div>
                        </div>
                        <motion.div
                          className={styles.buy_now}
                          variants={variants}
                          initial="inactive"
                          animate={isHovered == tokenId.toString() ? "active" : "inactive"} // 根据状态切换变体
                          transition={{ duration: 0.3 }}
                        >
                          <span>Buy now</span>
                        </motion.div>
                      </motion.div>
                    )
                  })
                }

              </div>
              <div className={styles.operate}>
                {(turnAllSelect && selectedToken) ? <Button onClick={onBurnNft}>Burn NFT</Button> : null}
              </div>
            </>
          },
          {
            label: 'MY ORDERS',
            key: '2',
            children: <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', margin: '10px 10px' }}>
                {myOrders?.length ?
                  <>
                    <img className={styles.items_total} onClick={() => {
                      onTurnAllOrder(!turnAllOrder);
                    }} src={`${turnAllOrder ? '/all_selected.png' : '/all_unselect.png'}`} />
                    <span>TOTAL：{myOrders?.length} ITEMS</span>
                  </> : null
                }
              </div>
              <div className={styles.nft_list}>
                {
                  myOrders?.map((item: any) => {
                    const { nftInfo, tokenId, orderId } = item;
                    return (
                      <motion.div
                        className={`${styles.nft_item} ${turnAllOrder ? styles.nft_item_active : ''}`}
                        whileHover={{ scale: 1.02 }}
                        onHoverStart={() => setIsHovered(tokenId.toString())}
                        onHoverEnd={() => setIsHovered('')}
                        onClick={() => {
                          router.push(`/nft/orderDetail?orderId=${orderId}&tokenId=${tokenId}`)
                        }}>
                        {turnAllOrder &&
                          <img
                            className={styles.select}
                            onClick={(e) => { onSelectNft(e, item.tokenId) }}
                            src={`${selectedToken === tokenId ? '/selected.png' : '/unselect.png'}`} />}
                        <div className={styles.nft_img}>
                          <Image preview={false} src={nftInfo?.image} />
                        </div>

                        <div className={styles.nft_info}>
                          <div className={styles.top}>
                            <span className={styles.single_line}>{nftInfo.name}哈哈哈好好</span>
                            <span className={styles.token_id}>#{tokenId}</span>
                          </div>
                          <div className={styles.detail}>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                }

              </div>
              <div className={styles.operate}>
                {(turnAllOrder && turnAllOrder) ? <Button onClick={onBurnNft}>Remove NFT</Button> : null}
              </div>
            </>
          },
        ]}
      />
    </div>
  );
}

export default MyNft;