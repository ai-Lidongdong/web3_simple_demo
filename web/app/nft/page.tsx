'use client'
import React, { useState, useEffect } from 'react';
import { Button, Image } from 'antd';
import { ethers, Contract, JsonRpcProvider } from "ethers";
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from "framer-motion";
import { NFT_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS, RPC_URL } from '@/app/constants';
import MyNFTABI from '../artifacts/MyNFTModule#MyNFT.json';
import MarketABI from '../artifacts/NFTMarketPlaceModule#NFTMarketPlace.json';
import type { NftMetadataList } from './Nft';
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
  const [balance, setBalance] = useState(0);
  const [nftList, setNftList] = useState<NftMetadataList[]>();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (address) {
      // getBalance();
      getNFTList();
    }
  }, [address])

  // get the nft list in the nft trade platform
  const getNFTList = async () => {
    try {
      const { resultObj, pagination } = await fetchApi('/api/orders/active', {
        page: 1,
        limit: 10,
      }) as any;
      // const res = await axios.get(`${API_URL}/active?page=${1}&limit=10`);
      // console.log('-----res', res)
      // const { pagination, orders } = res?.data;
      setNftList(resultObj);

    } catch (err) {
      console.log('---err', err)
    }


  }
  const getBalance = async () => {
    if (window.ethereum) {
      // 创建 provider 实例（连接区块链节点）
      // const provider = new JsonRpcProvider(RPC_URL);
      // // 平台合约 ABI（仅包含需要监听的事件定义）

      // // 创建平台合约实例（用于监听事件）
      // const marketplaceContract = new ethers.Contract(
      //   MARKET_CONTRACT_ADDRESS, // 合约地址
      //   MarketABI.abi,     // 合约 ABI（仅事件部分）
      //   provider            // 已连接的区块链 provider
      // );

      // const latestBlock = await provider.getBlockNumber();
      // console.log(`当前最新区块: ${latestBlock}，开始扫描历史事件...`);

      // // 3.1 同步 OrderCreated 事件（所有历史订单创建记录）
      // const createdEvents: any = await marketplaceContract.queryFilter(
      //   'OrderCreated', // 事件名
      //   0,              // 从区块 0 开始
      //   latestBlock     // 到最新区块结束
      // );
      // console.log(`发现 ${createdEvents.length} 条历史 OrderCreated 事件`);
      // console.log('------->', createdEvents)
      //   const provider = new ethers.BrowserProvider(window.ethereum);
      //   const signer = await provider.getSigner();
      //     const blockProvider = new JsonRpcProvider(RPC_URL);
      //   // create Contract instance
      //   const contract = new ethers.Contract(
      //     MARKET_CONTRACT_ADDRESS,
      //     MarketABI.abi,
      //     blockProvider,
      //   );
      try {
        //     const latestBlock = await blockProvider.getBlockNumber();
        //     // const filter = contract.filters.OrderCreated(); // 无参数：查询所有事件
        //     const batchSize = 5000; // 每批查询5000个区块
        //     const startBlock = 0; // 起始区块
        //     for (let i = startBlock; i <= latestBlock; i += batchSize) {
        //       const currentEnd = Math.min(i + batchSize - 1, latestBlock);
        //       const logs = await provider.getLogs({
        //         address: "0x95d3c809924cd8afeb281c1916d156bff9498804",
        //         fromBlock: i,
        //         toBlock: currentEnd,
        //         topics: ["0xca2b119696253bb319cbcae97b5bc18e7981b51f3460b960e8b9c355d666358f"]
        //       });
        //       // 处理当前批次的日志
        //     }
        //     const events = await contract.queryFilter(filter, 0, latestBlock); // 从区块 0 到最新
        //     console.log('---events', events)

        //     // 解析事件数据
        //     const orders = await Promise.all(events.map(async (event) => {
        //         const { args } = event;
        //         const [id, seller, nftContract, tokenId, price] = args;
        //         const nftInfo = await onQueryOneNftInfo(nftContract, tokenId);
        //         return {
        //             ...nftInfo,
        //             orderId: id.toString(),
        //             seller,
        //             nftContract,
        //             tokenId: tokenId.toString(),
        //             price: Number(price),
        //             blockNumber: event.blockNumber, // 订单创建的区块号
        //             transactionHash: event.transactionHash, // 交易哈希
        //         };
        //     }))
        //     setAllOrders(orders)
        //     console.log("所有订单:", orders);




        //     query total nfts count
        //     const userBalance = await contract?.orders(MARKET_CONTRACT_ADDRESS);
        //     console.log('----userBalance', userBalance)
        //     if (typeof userBalance === 'bigint') {
        //       const balanceNum = Number(userBalance);
        //       setBalance(balanceNum)

        //       // 2. 批量查询每个 NFT 的 tokenId（这里假设合约实现了 tokenOfOwnerByIndex 方法）
        //       const tokenIdList = [];
        //       for (let i = 0; i < balanceNum; i++) {
        //         const tokenId = await contract.tokenByIndex(i);
        //         const tokenIdNum = Number(tokenId);
        //         // 初始化 NFT 项，标记为加载中
        //         tokenIdList.push(tokenIdNum);
        //       }
        //       console.log('-tokenIdList', tokenIdList)
        //       const nfts = await Promise.all(tokenIdList.map(async (item: string | number) => {
        //         const cid = await contract.tokenURI(item);
        //         const metadata: NftMetadata = await fetchNFTMetadata(cid);
        //         return {
        //           tokenId: item,
        //           metadata: metadata
        //         }
        //       }))
        //       console.log('------------nfts', nfts);
        //       setNftList(nfts);
        //     }
      } catch (err) {
        console.error('err:', err)
      }
    }
  }


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
  const onClickNft = (orderId: string, tokenId: string) =>{
    router.push(`/nft/orderDetail?orderId=${orderId}&tokenId=${tokenId}`)
  }
  return (
    <div className={styles.wrap}>
      <div className={styles.opt_list}>
        <span>当前总共：{balance}</span>
        <Button type='primary' onClick={() => { router.push('/nft/addNft') }}>Add NFT</Button>
        <Button type='primary' onClick={onBurnNft}>Burn NFT</Button>
      </div>
      <div className={styles.nft_list}>
        {
          nftList?.map((item: any) => {
            return (
              <motion.div
                className={styles.nft_item}
                whileHover={{ scale: 1.02 }}
                onClick={()=>{onClickNft(item.orderId, item.tokenId)}}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}>
                <Image className={styles.nft_img} preview={false} src={item?.nftInfo?.image} />
                <div className={styles.nft_info}>
                  <div className={styles.top}>
                    <span className={styles.single_line}>{item?.nftInfo?.name}</span>
                    <span className={styles.token_id}>#{item?.tokenId}</span>
                  </div>
                  <div className={styles.detail}>
                    <div className={styles.price}>{Number(item.price).toFixed(2)}<span>  NT</span></div>
                    <div className={styles.last_sale}>Last sale <span>{Number(item.price).toFixed(2)}</span>  NT</div>
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
                  <span>{Number(item.price).toFixed(2)}  NT</span>
                </motion.div>
              </motion.div>
            )
          })
        }
      </div>
    </div>
  );
}

export default NFT;