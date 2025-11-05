'use client'
import React, { useState, useEffect } from 'react';
import { Button, Image, Modal, Form, Input, Switch } from 'antd';
import { useSearchParams } from 'next/navigation';
import { ethers, Contract } from "ethers";
import { usePrivy } from '@privy-io/react-auth';
import { NFT_CONTRACT_ADDRESS, COIN_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS } from '@/app/constants';
import MyNFTABI from '../../artifacts/MyNFTModule#MyNFT.json';
import MarketABI from '../../artifacts/NFTMarketPlaceModule#NFTMarketPlace.json';
import { fetchNFTMetadata } from '../../../utils'
import styles from "./page.module.css";
import type { NFTMetadataRes } from '../nft';
import { useRouter } from 'next/navigation';
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
}

const NFTDetail = () => {
    const router = useRouter();
    const { user } = usePrivy() as any;
    const searchParams = useSearchParams();
    const tokenId = searchParams.get('tokenId');
    const { address } = user?.wallet || {};
    
    const [nftCid, setNftCid] = useState<string>('');
    const [nftInfo, setNftInfo] = useState<NFTMetadataRes>();
    const [openModal, setOpenModal] = useState<boolean>(false);
    
    useEffect(() => {
        if (address) {
            getNftDetail();
        }
    }, [address])
    const getNftDetail = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
            NFT_CONTRACT_ADDRESS,
            MyNFTABI.abi,
            signer,
        );
        const cid = await contract.tokenURI(tokenId);
        const metadata = await fetchNFTMetadata(cid);
        setNftInfo(metadata)
        setNftCid(cid)
    }

    // open the modal to create order by nft
    const onSaleNFT = async () => {
        setOpenModal(true)
    }

    // create a order by nft
    const onCreateOrder = async (event: {
        nftContract: string,
        tokenId: string,
        price: string,
        paymentToken: string,
    }) => {
        const { nftContract,tokenId, price, paymentToken } = event;
        if (window.ethereum) {
            try {
                // 创建以太坊提供者和签名者实例
                const provider = new ethers.BrowserProvider(window.ethereum);
                // 1. 连接钱包
                // await provider.send("eth_requestAccounts", []); // 请求授权
                const signer = await provider.getSigner();

                // 2. 初始化合约实例
                const NftContractInstance = new Contract(
                    NFT_CONTRACT_ADDRESS,
                    MyNFTABI.abi,
                    signer
                );
                const isApproved = await NftContractInstance.isApprovedForAll(address, MARKET_CONTRACT_ADDRESS);
                if (!isApproved) {
                    // 授权：允许 operator 操作调用者的所有 NFT
                    await NftContractInstance.setApprovalForAll(MARKET_CONTRACT_ADDRESS, true);
                }

                // 初始化智能合约实例
                const contract = new ethers.Contract(
                    MARKET_CONTRACT_ADDRESS,
                    MarketABI.abi,
                    signer
                );
                await contract.createOrderWithEscrow(
                    nftContract,
                    tokenId,
                    price,
                    paymentToken,
                    nftCid
                );
                // 监听合约的 Mint 事件，铸造完成后刷新余额
                contract.on("OrderCreated", async (a, b, c, d, e) => {
                    setOpenModal(false);
                    getNftDetail();
                    router.replace('/nft');
                });
            } catch (err) {
                console.error('----err', err)
            }
        }
    }
    return (
        <div className={styles.wrap}>
            <div className={styles.img_box}>
                <Image
                    className={styles.nft_img}
                    alt=''
                    width={200}
                    src={nftInfo?.image}
                />
            </div>
            <div className={styles.name}>
                <div>{nftInfo?.name}</div>
                <div>Active</div>
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
            <Button className={styles.sale_but} onClick={onSaleNFT}>Sale</Button>
            <Modal
                title="Create Order"
                open={openModal}
                width={900}
                height={700}
                onCancel={() => { setOpenModal(false) }}
                footer={false}
            >
                <div>
                    <div className={styles.talbe_box}>
                        <div className={styles.form}>
                            <Form
                                {...layout}
                                name="nest-messages"
                                onFinish={onCreateOrder}
                                initialValues={{
                                    name: nftInfo?.name,
                                    description: nftInfo?.description,
                                    tokenId,
                                    nftContract: NFT_CONTRACT_ADDRESS,
                                    paymentToken: COIN_CONTRACT_ADDRESS,
                                    isEscrowed: true

                                }}
                                style={{ width: 600 }}
                            >
                                <Form.Item label="Image" valuePropName="fileList">
                                    <Image width={200} src={nftInfo?.image} />
                                </Form.Item>
                                <Form.Item name="name" label="Name">
                                    <Input disabled />
                                </Form.Item>
                                <Form.Item name='description' label="paymentToken" rules={[{ required: true }]}>
                                    <Input.TextArea disabled />
                                </Form.Item>
                                <Form.Item name="description" label="Description">
                                    <Input disabled />
                                </Form.Item>
                                <Form.Item name='tokenId' label="tokenId" rules={[{ required: true }]}>
                                    <Input disabled />
                                </Form.Item>
                                <Form.Item name='nftContract' label="NFT Contarct">
                                    <Input disabled />
                                </Form.Item>
                                <Form.Item name='paymentToken' label="Token Contarct">
                                    <Input disabled />
                                </Form.Item>
                                <Form.Item name='price' label="Price">
                                    <Input placeholder='please input price of the nft' />
                                </Form.Item>
                                <Form.Item name="isEscrowed" label="is escrowed">
                                    <Switch />
                                </Form.Item>
                                <Form.Item label={null}>
                                    <Button type="primary" htmlType="submit">
                                        Create Order
                                    </Button>
                                </Form.Item>
                            </Form>

                        </div>
                    </div>

                </div>
            </Modal>
        </div>
    );
}
export default NFTDetail;