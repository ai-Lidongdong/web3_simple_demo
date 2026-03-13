'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Image, Tabs, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import NextImage from 'next/image';
import type { NFTMetadataRes, NftMetadataList } from '../nft';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import styles from "./page.module.css";
import { useContracts } from '@/app/contexts/ContractContext';
import { fetchNFTMetadata } from '../../../utils';
import { fetchApi } from '../../axios/nft';
// 定义动画变体
const variants = {
  inactive: { y: 50, opacity: 0 },
  active: { y: 0, opacity: 1 },
};

const MyNft = () => {
  const { address } = useSelector((state: RootState) => state.wallet);
  const { myNFT } = useContracts();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('1');
  const [isHovered, setIsHovered] = useState<string>('');
  const [turnAllSelect, onTurnAllSelect] = useState<boolean>(false);
  const [nftList, setNftList] = useState<NftMetadataList[]>(); // nft list
  const [selectedToken, setSelectedToken] = useState<string>('');

  const [myOrders, setMyOrders] = useState<NftMetadataList[]>();
  const [turnAllOrder, onTurnAllOrder] = useState<boolean>(false);

  const getMyAllNFTList = useCallback(async () => {
    if (!myNFT || !address) {
      return;
    }
    setIsLoading(true)
    try {
      // query total nfts count
      const userBalance = await myNFT?.balanceOf(address);
      if (typeof userBalance === 'bigint') {
        const balanceNum = Number(userBalance);

        // 2. batch query each tokenId of NFT
        const tokenIdList: number[] = [];
        for (let i = 0; i < balanceNum; i++) {
          const tokenId = await myNFT?.tokenOfOwnerByIndex(address, i);
          const tokenIdNum = Number(tokenId);
          tokenIdList.push(tokenIdNum);
        }
        const nfts = await Promise.all(tokenIdList.map(async (item: number) => {
          const cid = await myNFT?.tokenURI(item);
          const metadata: NFTMetadataRes = await fetchNFTMetadata(cid);
          return {
            tokenId: item,
            metadata: metadata
          }
        }))
        setIsLoading(false)
        setNftList(nfts);
      }
    } catch (err) {
      setIsLoading(false)
      console.error('err:', err)
    }
  }, [myNFT, address]);

  const getMyOrder = useCallback(async () => {
    const result = await fetchApi(`/api/orders/seller/${address}`) as any;
    setMyOrders(result);
  }, [address]);

  useEffect(() => {
    if (myNFT) {
      getMyAllNFTList();
    }
    getMyOrder();
  }, [myNFT, getMyAllNFTList, getMyOrder]);

  // burn nft
  const onBurnNft = async () => {
    // 3. mint nft to target address
    const tx = await myNFT?.burn(4);
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
                <NextImage
                  className={styles.items_total}
                  onClick={() => {
                    onTurnAllSelect(!turnAllSelect);
                  }}
                  src={turnAllSelect ? '/all_selected.png' : '/all_unselect.png'}
                  alt="toggle select all nfts"
                  width={24}
                  height={24}
                />
                <span>TOTAL：{nftList?.length} ITEMS</span>
              </div>
              <Spin spinning={isLoading}>
                <div className={styles.nft_list}>
                  {
                    nftList?.map((item: any) => {
                      const { metadata, tokenId } = item;
                      return (
                        <motion.div
                          key={tokenId}
                          className={`${styles.nft_item} ${turnAllSelect ? styles.nft_item_active : ''}`}
                          whileHover={{ scale: 1.02 }}
                          onHoverStart={() => setIsHovered(tokenId.toString())}
                          onHoverEnd={() => setIsHovered('')}
                          onClick={() => {
                            router.push(`/nft/nftDetail?tokenId=${tokenId}`);
                          }}>
                          {turnAllSelect &&
                            <NextImage
                              className={styles.select}
                              onClick={(e) => { onSelectNft(e, item.tokenId) }}
                              src={selectedToken === tokenId ? '/selected.png' : '/unselect.png'}
                              alt="select nft"
                              width={20}
                              height={20}
                            />}
                          <div className={styles.nft_img}>
                            <Image preview={false} src={metadata?.image} alt={metadata?.name ?? 'nft image'} />
                          </div>

                          <div className={styles.nft_info}>
                            <div className={styles.top}>
                              <span className={styles.single_line}>{metadata.name}</span>
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
                            <span>Sale now</span>
                          </motion.div>
                        </motion.div>
                      )
                    })
                  }

                </div>
              </Spin>
              <div className={styles.operate}>
                {(turnAllSelect && selectedToken) ? <Button onClick={onBurnNft}>Burn NFT</Button> : null}
              </div>
            </>
          },
          {
            label: 'MY ORDERS',
            key: '2',
            children: <>
              {
                myOrders?.length ?
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', margin: '10px 10px' }}>
                      <NextImage
                        className={styles.items_total}
                        onClick={() => {
                          onTurnAllOrder(!turnAllOrder);
                        }}
                        src={turnAllOrder ? '/all_selected.png' : '/all_unselect.png'}
                        alt="toggle select all orders"
                        width={24}
                        height={24}
                      />
                      <span>TOTAL：{myOrders?.length} ITEMS</span>
                    </div>
                    <div className={styles.nft_list}>
                      {
                        myOrders?.map((item: any) => {
                          const { nftInfo, tokenId, orderId } = item;
                          return (
                            <motion.div
                              key={orderId}
                              className={`${styles.nft_item} ${turnAllOrder ? styles.nft_item_active : ''}`}
                              whileHover={{ scale: 1.02 }}
                              onHoverStart={() => setIsHovered(tokenId.toString())}
                              onHoverEnd={() => setIsHovered('')}
                              onClick={() => {
                                router.push(`/nft/orderDetail?orderId=${orderId}&tokenId=${tokenId}`)
                              }}>
                              {turnAllOrder &&
                                <NextImage
                                  className={styles.select}
                                  onClick={(e) => { onSelectNft(e, item.tokenId) }}
                                  src={selectedToken === tokenId ? '/selected.png' : '/unselect.png'}
                                  alt="select order"
                                  width={20}
                                  height={20}
                                />}
                              <div className={styles.nft_img}>
                                <Image preview={false} src={nftInfo?.image} alt={nftInfo?.name ?? 'nft image'} />
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
                  </> :
                  <>
                    <NextImage src="/nothing.png" alt="no orders" width={400} height={400} style={{ width: '400px', margin: '200px auto 20px' }} />
                    <div style={{ color: '#fff', textAlign: 'center', fontSize: '24px' }}>No orders available</div>
                  </>
              }
            </>
          },
        ]}
      />
    </div>
  );
}

export default MyNft;
