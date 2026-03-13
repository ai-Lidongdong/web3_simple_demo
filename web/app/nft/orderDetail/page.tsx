'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Image, Spin } from 'antd';
import { useSearchParams } from 'next/navigation';
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import { fetchNFTMetadata, timestampToDate } from '../../../utils';
import { fetchApi } from '../../axios/nft';
import { OrderValuesRes, NFTMetadataRes } from '../nft';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useContracts } from '../../contexts/ContractContext';

const NFTDetail = () => {
    const { myToken, NFTMarketPlace } = useContracts();
    const { address } = useSelector((state: RootState) => state.wallet);
    const { CONTRACTS_ADDRESSE } = useSelector((state: RootState) => state.network);
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');

    const [nftInfo, setNftInfo] = useState<NFTMetadataRes>();
    const [isLoading, setIsLoading] = useState(false)
    const [orderInfo, setOrderInfo] = useState<OrderValuesRes>();

    const getNfTInfo = useCallback(async () => {
        if (!orderId) {
            return;
        }
        const result = await fetchApi(`/api/orders/${orderId}`) as any;
        const metadata = await fetchNFTMetadata(result?.cid);
        setNftInfo(metadata);
        setOrderInfo(result);
    }, [orderId]);

    useEffect(() => {
        getNfTInfo();
    }, [getNfTInfo]);

    //  approve the platform to transfer coin on behalf of user
    const onApprovePlatformTransferCoin = async () => {
        if (window.ethereum) {
            try {
                const allowanceAmount = await myToken?.allowance(address, CONTRACTS_ADDRESSE.MARKET_CONTRACT_ADDRESS);
                const orderPrice = Number(orderInfo?.price);
                if (!allowanceAmount || Number(allowanceAmount) < orderPrice) {
                    const tx = await myToken?.approve(CONTRACTS_ADDRESSE.MARKET_CONTRACT_ADDRESS, orderPrice);
                    if (!tx) {
                        return false;
                    }
                    await tx.wait();
                    return true
                }
                return true
            } catch (error) {
                console.log('error:', error);
            }
        }

    }

    // buy nft
    const onCancelOrder = async () => { // cancelOrder
        const { orderId } = orderInfo || {};
        if (window.ethereum) {
            // create ethereum provider and signer instance
            const isApprove = await onApprovePlatformTransferCoin();
            if (!isApprove) {
                return
            }
            if (!orderId) {
                return;
            }
            // 1. 连接钱包
            await NFTMarketPlace?.cancelOrder(orderId);
            (NFTMarketPlace as any)?.on("OrderCancelled", async (a: any, b: any) => {
                console.log('22', a, b)
                router.replace(`/nft/myNft`)
            });
        }
    }
    const onBuyNft = async () => {
        const { orderId } = orderInfo || {} as any;
        if (window.ethereum) {
            setIsLoading(true)
            const isApprove = await onApprovePlatformTransferCoin();
            if (!isApprove || !orderId) {
                setIsLoading(false)
                return
            }
            await NFTMarketPlace?.buyNFT(orderId);
            // 监听合约的 Mint 事件，铸造完成后刷新余额
            (NFTMarketPlace as any)?.on("OrderExecuted", async () => {
                setIsLoading(false)
                router.replace('/nft/myNft')
            });
        }
    }

    return (
        <Spin spinning={isLoading}>
            <div className={styles.wrap}>
                <div className={styles.img_box}>
                    <Image
                        className={styles.nft_img}
                        alt=''
                        width={200}
                        height={280}
                        src={nftInfo?.image}
                    />
                </div>
                <div className={styles.name}>
                    <div>{nftInfo?.name}</div>
                    <div>{orderInfo?.isEscrowed ? 'isEscrowed' : ''}</div>
                </div>
                <div className={styles.description}>{nftInfo?.description}</div>
                <div className={styles.external_url}>
                    <a href={nftInfo?.external_url}>external url</a>
                </div>
                <div className={styles.nft_info}>
                    <div className={styles.traits}>Trait type</div>
                    {
                        nftInfo?.attributes?.map((item: {
                            trait_type: string;
                            value: string | number;
                        }, index: number) => {
                            return (
                                <div className={styles.nft_item} key={`${item.trait_type}-${index}`}>
                                    <div className={styles.key}>{item?.trait_type}</div>
                                    <div className={styles.value}>{item?.value}</div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className={styles.order_detail}>
                    <h2>Order Detail</h2>
                    <div className={styles.order_item}>
                        <div>Price</div>
                        <div>{orderInfo?.price} ETH</div>
                    </div>
                    <div className={styles.order_item}>
                        <div>Create Date</div>
                        <div>{orderInfo?.createdAt ? timestampToDate(orderInfo.createdAt) : ''}</div>
                    </div>
                    <div className={styles.order_item}>
                        <div>Seller</div>
                        <div>{orderInfo?.seller}</div>
                    </div>
                </div>
                {
                    orderInfo?.seller === 'address' ? <Button className={styles.sale_but} onClick={onCancelOrder}>Cancel Order</Button> :
                        <Button className={styles.sale_but} onClick={onBuyNft}>Buy Nft</Button>
                }
            </div>
        </Spin>
    );
}
export default NFTDetail;
