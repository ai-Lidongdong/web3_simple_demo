'use client'
import React, { useState, useEffect } from 'react';
import { Button, Image, Modal, Form, Input, Switch, message } from 'antd';
import { useSearchParams } from 'next/navigation';
import { ethers, Contract } from "ethers";
import { usePrivy } from '@privy-io/react-auth';
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import { NFT_CONTRACT_ADDRESS, COIN_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS } from '@/app/constants';
import MyNFTABI from '../../artifacts/MyNFTModule#MyNFT.json';
import MyTokenABI from '../../artifacts/MyTokenModule#MyToken.json';
import MarketABI from '../../artifacts/NFTMarketPlaceModule#NFTMarketPlace.json';
import { fetchNFTMetadata } from '../../../utils';
import { fetchApi } from '../../axios/nft'
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
}
const NFTDetail = () => {
    const searchParams = useSearchParams();
    const [nftCid, setNftCid] = useState<string>('');
    const [nftInfo, setNftInfo] = useState(null);
    const [orderInfo, setOrderInfo] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const orderId = searchParams.get('orderId');
    const tokenId = searchParams.get('tokenId');
    const router = useRouter();

    const [messageApi] = message.useMessage();
    const { user } = usePrivy() as any;
    const { address } = user?.wallet || {};
    useEffect(() => {
        if (address) {
            // getNftDetail();
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
    // const getNftDetail = async () => {
    //     const provider = new ethers.BrowserProvider(window.ethereum);
    //     const signer = await provider.getSigner();
    //     const contract = new ethers.Contract(
    //         NFT_CONTRACT_ADDRESS,
    //         MyNFTABI.abi,
    //         signer,
    //     );
    //     const cid = await contract.tokenURI(tokenId);
    //     const owner = await contract.ownerOf(tokenId);
    //     const metadata = await fetchNFTMetadata(cid);
    //     setNftInfo(metadata)
    //     setNftCid(cid)
    // }

    const onApprovePlatformTransferCoin = async () => {
        if (window.ethereum) {
            try {
                // 创建以太坊提供者和签名者实例
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                // 初始化智能合约实例
                const contract = new ethers.Contract(
                    COIN_CONTRACT_ADDRESS,
                    MyTokenABI.abi,
                    signer
                );

                const allowanceAmount = await contract.allowance(address, MARKET_CONTRACT_ADDRESS);
                console.log('-----已授权金额', allowanceAmount)
                const orderPrice = Number(orderInfo?.price);
                if (!allowanceAmount || Number(allowanceAmount) < orderPrice) {
                    // 未授权 || 金额不够
                    const tx = await contract.approve(MARKET_CONTRACT_ADDRESS, orderPrice);
                    await tx.wait();
                console.log('----金额授权成功', tx)
                    return true
                }
                return true
            } catch (error) {
                console.log('----授权失败', error)
            }
        }

    }

    // 购买 nft
    const onBuyNFT = async (event: any) => {
        const { orderId } = orderInfo;
        if (window.ethereum) {
            // 创建以太坊提供者和签名者实例
            const isApprove = await onApprovePlatformTransferCoin();
            console.log('---isApprove', isApprove)
            if (!isApprove) {
                return
            }
            // 已经授权
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            console.log('-=-----address', await signer.getAddress());
            // 初始化智能合约实例
            const contract = new ethers.Contract(
                MARKET_CONTRACT_ADDRESS,
                MarketABI.abi,
                signer
            );
            await contract.buyNFT(orderId);
            // 监听合约的 Mint 事件，铸造完成后刷新余额
            contract.on("OrderExecuted", async (a, b, c) => {
                console.log('---创建完成', a, b, c);
                router.replace(`/nft/myNft`)
            });
        }

    }

    const onCreateOrder = async (event) => {
        const { nftContract, tokenId, price, paymentToken } = event;
        try {


            if (window.ethereum) {
                // 创建以太坊提供者和签名者实例
                const provider = new ethers.BrowserProvider(window.ethereum);

                // 1. 连接钱包
                await provider.send("eth_requestAccounts", []); // 请求授权
                const signer = await provider.getSigner();

                // 2. 初始化合约实例
                const NftContractInstance = new Contract(
                    NFT_CONTRACT_ADDRESS,
                    MyNFTABI.abi,
                    signer
                );
                const isApproved = await NftContractInstance.isApprovedForAll(address, MARKET_CONTRACT_ADDRESS);
                console.log('---是否授权--》', isApproved);
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
                console.log('-444')
                // 监听合约的 Mint 事件，铸造完成后刷新余额
                contract.on("OrderCreated", async (a, b, c, d, e) => {
                    console.log('---创建完成', a, b, c, d, e) // 0n 0x0B45b5157eD10e44833DE67199D8565E28C2fC6E 0x2924Af181Fb2C68E65cAfd9611b44BCe9fb68074 0n 20n
                    setOpenModal(false);
                    messageApi.open({
                        key: 'updatable',
                        type: 'success',
                        content: 'create order was successful',
                        duration: 2,
                    });
                    // getNftDetail();
                });
            }
        } catch (err) {
            console.log('----err', err)
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
                        display_type: string;
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
            <div>卖家{orderInfo?.seller}</div>
            <Button className={styles.sale_but} onClick={onBuyNFT}>Buy</Button>
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
                                        Create NFT
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