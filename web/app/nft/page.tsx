'use client'
import React, { useState } from 'react';
import { Card, Button } from 'antd';
import styles from "./page.module.css";
import { useRouter } from 'next/navigation'

const Home = () => {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [nftList, setNftList] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const { Meta } = Card;
  return (
    <>
      <div className={styles.opt_list}>
        <Button type='primary' onClick={()=>{router.push('/nft/addNft')}}>Add NFT</Button>
      </div>
      <div className={styles.nft_list}>
        {
          nftList.map(item => {
            return (
              <Card
              className={styles.nft_item}
                hoverable
                style={{ width: 240 }}
                cover={
                  <img
                    draggable={false}
                    alt="example"
                    src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                  />
                }
              >
                <Meta title="Europe Street beat" description="www.instagram.com" />
              </Card>
            )
          })
        }
      </div>
    </>
  );
}

export default Home;