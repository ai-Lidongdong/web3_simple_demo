'use client'
import React, { useState, useEffect } from 'react';
import { Button, Image } from 'antd';
import { useSearchParams } from 'next/navigation';
import { ethers } from "ethers";
import { usePrivy } from '@privy-io/react-auth';
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import { COIN_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS } from '@/app/constants';
import MyTokenABI from '../../artifacts/MyTokenModule#MyToken.json';
import MarketABI from '../../artifacts/NFTMarketPlaceModule#NFTMarketPlace.json';
import { fetchNFTMetadata, timestampToDate } from '../../../utils';
import { fetchApi } from '../../axios/nft';
import { OrderValuesRes, NFTMetadataRes } from '../nft';

const NFTDetail = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = usePrivy() as any;
    const { address } = user?.wallet || {};
    const orderId = searchParams.get('orderId');

    const [nftInfo, setNftInfo] = useState<NFTMetadataRes>();
    const [orderInfo, setOrderInfo] = useState<OrderValuesRes>();

    useEffect(() => {
        if (address) {
            getNfTInfo()
        }
    }, [address]);

    // query single order
    const getNfTInfo = async () => {
        const result = await fetchApi(`/api/orders/${orderId}`) as any;
        const metadata = await fetchNFTMetadata(result?.cid);
        setNftInfo(metadata)
        setOrderInfo(result);
    }

    //  approve the platform to transfer coin on behalf of user
    const onApprovePlatformTransferCoin = async () => {
        if (window.ethereum) {
            try {
                // create ethereum provider and signer instance
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                // initialize contract instance
                const contract = new ethers.Contract(
                    COIN_CONTRACT_ADDRESS,
                    MyTokenABI.abi,
                    signer
                );

                const allowanceAmount = await contract.allowance(address, MARKET_CONTRACT_ADDRESS);
                const orderPrice = Number(orderInfo?.price);
                if (!allowanceAmount || Number(allowanceAmount) < orderPrice) {
                    // don't have approve yet || approve amount is less than order price
                    const tx = await contract.approve(MARKET_CONTRACT_ADDRESS, orderPrice);
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
    const onBuyNFT = async () => {
        const { orderId } = orderInfo || {};
        if (window.ethereum) {
            // create ethereum provider and signer instance
            const isApprove = await onApprovePlatformTransferCoin();
            if (!isApprove) {
                return
            }
            // have been approved, proceed to buy nft
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // initialize contract instance
            const contract = new ethers.Contract(
                MARKET_CONTRACT_ADDRESS,
                MarketABI.abi,
                signer
            );
            await contract.buyNFT(orderId);
            //  listen to OrderExecuted event, after order is executed, redirect to my nft page
            contract.on("OrderExecuted", async (a, b, c) => {
                router.replace(`/nft/myNft`)
            });
        }
    }

    return (
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
                    <div>{timestampToDate(orderInfo?.createdAt)}</div>
                </div>
            </div>
            <Button className={styles.sale_but} onClick={onBuyNFT}>Buy</Button>
        </div>
    );
}
export default NFTDetail;