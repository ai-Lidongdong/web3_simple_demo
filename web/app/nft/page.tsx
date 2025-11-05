'use client'
import React, { useState, useEffect } from 'react';
import { Button, Image } from 'antd';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from "framer-motion";
import type { NftMetadataList } from './nft';
import { fetchApi } from '../axios/nft';
import styles from "./page.module.css";
// 定义动画变体
const variants = {
  inactive: { y: 40, opacity: 0 },
  active: { y: 0, opacity: 1 }
};

const NFT = () => {
  const { user } = usePrivy() as any;
  const { address } = user?.wallet || {};
  const router = useRouter();

  const [nftList, setNftList] = useState<NftMetadataList[]>(); // all nft order list
  const [isHovered, setIsHovered] = useState<string>(''); // controlle hover state in each nft item

  useEffect(() => {
    if (address) {
      getNFTList();
    }
  }, [address]);

  // get the nft list in the nft trade platform
  const getNFTList = async () => {
    try {
      const { resultObj  } = await fetchApi('/api/orders/active', {
        page: 1,
        limit: 10,
      }) as any;
      setNftList(resultObj);
    } catch (err) {
    }
  }

  // click nft item to view detail page
  const onClickNft = (orderId: string, tokenId: string) => {
    router.push(`/nft/orderDetail?orderId=${orderId}&tokenId=${tokenId}`)
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.opt_list}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>TOTAL：{nftList?.length} ITEMS</span>
        </div>
        <div>
          <Button style={{ background: '#8127DA', border: 'none', color: '#fff' }} onClick={() => { router.push('/nft/addNft') }}>Add NFT</Button>
        </div>
      </div>
      <div className={styles.nft_list}>
        {
          nftList?.map((item: any) => {
            return (
              <motion.div
                className={styles.nft_item}
                whileHover={{ scale: 1.02 }}
                onHoverStart={() => setIsHovered(item?.tokenId.toString())}
                onHoverEnd={() => setIsHovered('')}
                onClick={() => { onClickNft(item?.orderId, item?.tokenId) }}>
                <div className={styles.nft_img}>
                  <Image preview={false} src={item?.nftInfo?.image} />
                </div>

                <div className={styles.nft_info}>
                  <div className={styles.top}>
                    <span className={styles.single_line}>{item?.nftInfo?.name}哈哈哈好好</span>
                    <span className={styles.token_id}>#{item?.tokenId}</span>
                  </div>
                  <div className={styles.detail}>
                    <div className={styles.price_label}>Price</div>
                    <div className={styles.price_value}>{item?.price} ETH</div>
                  </div>
                </div>
                <motion.div
                  className={styles.buy_now}
                  variants={variants}
                  initial="inactive"
                  animate={isHovered == item?.tokenId.toString() ? "active" : "inactive"} // 根据状态切换变体
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
      </div>
    </div>
  );
}

export default NFT;