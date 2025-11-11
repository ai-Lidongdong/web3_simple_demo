'use client';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { ethers, Contract } from "ethers";
import { Button, Input, Image, Form, InputNumber } from 'antd';
import { usePrivy } from '@privy-io/react-auth';
import MyTokenAbi from '../../artifacts/MyTokenModule#MyToken.json';
import MyNFTAbi from '../../artifacts/MyNFTModule#MyNFT.json';
import NFTMarketPlaceAbi from '../../artifacts/NFTMarketPlaceModule#NFTMarketPlace.json';
const MyNFTContractAddress = '0x2924Af181Fb2C68E65cAfd9611b44BCe9fb68074';
const MyTokenContractAddress = '0xb1591B2Cb244B30478afb093dd691567208bC356';
const NFTMarketPlaceAddress = '0x8ac45921c7fbd4Dad02AdB660611dFa28f7e2B5c';
/*
订单
tokenId:0, price：20
tokenId:1, price：10000
*/

const META_DATA = "ipfs://bafkreigruopcadyxdcx5dkuakrz5fobcuiegihsievfcqnbnowtzjhintm"; // nft matadata 
const IPFS_GATEWAY = 'https://tan-capable-tiger-275.mypinata.cloud/ipfs/';

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
}
const Main = () => {
    const [amount, setAmount] = useState(1);
    const [mintTokenAddress, setMintTokenAddress] = useState(null);
    const [burnTokenAddress, setBurnTokenAddress] = useState(null);
    const [burnAmount, setBurnAmount] = useState(0);
    const [balance, setBalance] = useState(0);


    const [mintNftAddress, setMintNftAddress] = useState(null);
    const [burnNftAddress, setBurnNftAddress] = useState(null);
    const [burnNftTokenId, setBurnNftTokenId] = useState(null);
    const [orderId, setOrderId] = useState(null)
    const [nftBalance, setNftBalance] = useState(0);
    const [nfts, setNfts] = useState([]);
    const [allOrders, setAllOrders] = useState([])
    const [buyerApproveValue, setBuyerApproveValue] = useState(0);

    const { user } = usePrivy() as any;
    const { address } = user?.wallet || {};

    useEffect(() => {
        if (user) {
            getBalance()
            getNFTBalance()
            onQueryPlatformAllOrders()
        }
    }, [address])


    // 定义 handleMint 函数，用于铸造代币
    async function onMint() {
        console.log('---', amount, mintTokenAddress)
        if (window.ethereum) {
            // 创建以太坊提供者和签名者实例
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // 初始化智能合约实例
            const contract = new ethers.Contract(
                MyTokenContractAddress,
                MyTokenAbi.abi,
                signer
            );
            try {
                // 将用户输入的铸造数量转换为以太坊单位（最小单位 Wei）
                // const mintAmountInETH = ethers.parseUnits(JSON.stringify(amount), 'ether');
                // 调用智能合约的 mint 方法，并传入铸造数量
                const hash = await contract.mintToken(mintTokenAddress, BigInt(amount));
                console.log('---hash---', hash)
                // 监听合约的 Mint 事件，铸造完成后刷新余额
                contract.on("Mint", async () => {
                    getBalance();
                });
            } catch (e) {
                // 捕获并打印铸造失败的错误信息
                console.log("error", e);
            }
        }
    }

    const onBurn = async () => {
        if (window.ethereum) {
            // 创建以太坊提供者和签名者实例
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // 初始化智能合约实例
            const contract = new ethers.Contract(
                MyTokenContractAddress,
                MyTokenAbi.abi,
                signer
            );
            try {
                console.log('11', burnTokenAddress, burnAmount)
                // 将用户输入的铸造数量转换为以太坊单位（最小单位 Wei）
                // const mintAmountInETH = ethers.parseUnits(JSON.stringify(burnAmount), 'ether');
                // 调用智能合约的 mint 方法，并传入铸造数量
                await contract.burnToken(burnTokenAddress, BigInt(burnAmount));

                // 监听合约的 Mint 事件，铸造完成后刷新余额
                contract.on("Burn", async () => {
                    console.log('---Burn')
                    getBalance();
                });
            } catch (e) {
                // 捕获并打印铸造失败的错误信息
                console.log("error", e);
            }
        }

    }

    const getBalance = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(
                MyTokenContractAddress,
                MyTokenAbi.abi,
                signer,
            );
            try {
                const userBalance = await contract.balanceOf(address);
                const balance = ethers.formatUnits(userBalance, 18); // 把wei转换为eth单位
                const formattedBalance = parseFloat(balance).toFixed(2);
                setBalance(formattedBalance);

            } catch (err) {
                console.error('err:', err)
            }
        }
    }


    const onMintNft = async () => {
        if (window.ethereum) {
            try {
                // 1. 连接钱包
                const provider = new ethers.BrowserProvider(window.ethereum);
                await provider.send("eth_requestAccounts", []); // 请求授权
                const signer = await provider.getSigner();

                // 2. 初始化合约实例
                const nftContract = new Contract(
                    MyNFTContractAddress,
                    MyNFTAbi.abi,
                    signer
                );

                // 3. 调用铸造函数，传入目标地址
                const tx = await nftContract.safeMintToAddress(address, META_DATA);
                console.log("铸造交易已发送，哈希：", tx);

                // 4. 等待交易确认（上链）
                await tx.wait();
                getNFTBalance();
                // const tokenId = await nftContract._tokenIdCounter() - 1; // 获取最新tokenId
                // const owner = await nftContract.ownerOf(tokenId);
                // console.log(`NFT #${tokenId} 的所有者：`, owner); // 应等于TARGET_ADDRESS
                // 5. 验证铸造结果（查询该NFT的所有者）

            } catch (err) {
                console.error("铸造失败：", err);
            }
        }

    }
    const onBurnNft = async () => {

    }
    const getNFTBalance = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                MyNFTContractAddress,
                MyNFTAbi.abi,
                signer
            );
            console.log('contract', contract);
            try {
                // const tokenId = await contract.tokenIdCounter() - 1; // 获取最新tokenId
                // const owner = await contract.ownerOf(tokenId);
                // console.log(`NFT #${tokenId} 的所有者：`, owner); // 应等于TARGET_ADDRESS
                const userBalance = await contract?.balanceOf(address);
                if (typeof userBalance === 'bigint') {
                    const balanceNum = Number(userBalance);
                    console.log('balanceNum', balanceNum)
                    setNftBalance(balanceNum)
                    const filter = contract.filters.Transfer(null, address); // from 为 null 表示任意，to 为目标地址
                    const events = await contract.queryFilter(filter, 0, "latest"); // 从区块 0 到最新

                    // 3. 去重并验证当前持有者（排除已转出的 NFT）
                    const tokenIds = new Set();
                    for (const event of events) {
                        console.log('---event', event)
                        const { tokenId } = event.args;
                        tokenIds.add(tokenId.toString()); // 去重
                    }
                    const ownedTokenIds = [];
                    for (const id of tokenIds) {
                        try {
                            // 4. 验证每个 tokenId 的当前持有者是否为目标地址（避免已转出的 NFT）
                            const owner = await contract.ownerOf(id);
                            if (owner.toLowerCase() === address.toLowerCase()) {
                                ownedTokenIds.push({
                                    tokenId: id,
                                    metadata: null
                                });
                            }
                        } catch (err) {
                            // 忽略不存在的 tokenId（可能已销毁）
                            continue;
                        }
                    }
                    console.log('----ownedTokenIds', ownedTokenIds)

                    // setNfts(nftItems);

                    // 3. 加载每个 NFT 的元数据
                    let arr = []
                    for (let i = 0; i < ownedTokenIds.length; i++) {
                        const tokenId = ownedTokenIds[i].tokenId;
                        const tokenUri = await contract.tokenURI(tokenId);
                        console.log('----tokenUri', tokenUri);
                        const metadata = await fetchNFTMetadata(tokenUri);
                        console.log('---metadata', metadata);
                        arr.push({
                            ...metadata,
                            tokenId: ownedTokenIds[i].tokenId
                        })

                    }
                    console.log('----arr', arr);
                    setNfts(arr);
                }
            } catch (err) {
                console.error('err:', err)
            }
        }
    }
    // 从 IPFS 或 HTTP 加载 NFT 元数据
    const fetchNFTMetadata = async (tokenUri) => {
        try {
            // 处理 IPFS 路径（如 ipfs://Qm... 转换为 http 链接）
            const url = tokenUri.startsWith('ipfs://')
                ? `${IPFS_GATEWAY}${tokenUri.slice(7)}`
                : tokenUri;
            console.log('---url', url)
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

    // 允许 operator 操作调用者的所有 NFT
    const onApprove = async () => {
        if (window.ethereum) {
            try {
                // 1. 连接钱包
                const provider = new ethers.BrowserProvider(window.ethereum);
                await provider.send("eth_requestAccounts", []); // 请求授权
                const signer = await provider.getSigner();

                // 2. 初始化合约实例
                const nftContract = new Contract(
                    MyNFTContractAddress,
                    MyNFTAbi.abi,
                    signer
                );

                // 授权：允许 operator 操作调用者的所有 NFT
                const tx = await nftContract.setApprovalForAll(NFTMarketPlaceAddress, true);
                console.log('---approve result', tx)

            } catch (err) {
                console.error("铸造失败：", err);
            }
        }

    }


    const onSubmit = async (event) => {
        const { nftContract, tokenId, price, paymentToken } = event;
        if (window.ethereum) {
            // 创建以太坊提供者和签名者实例
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // 初始化智能合约实例
            const contract = new ethers.Contract(
                NFTMarketPlaceAddress,
                NFTMarketPlaceAbi.abi,
                signer
            );
            try {
                await contract.createOrderWithEscrow(
                    nftContract,
                    tokenId,
                    price,
                    paymentToken
                );
                // 监听合约的 Mint 事件，铸造完成后刷新余额
                contract.on("OrderCreated", async (a, b, c, d, e) => {
                    console.log('---创建完成', a, b, c, d, e) // 0n 0x0B45b5157eD10e44833DE67199D8565E28C2fC6E 0x2924Af181Fb2C68E65cAfd9611b44BCe9fb68074 0n 20n
                    getBalance()
                    getNFTBalance()
                    onQueryPlatformAllOrders()
                });
            } catch (e) {
                // 捕获并打印铸造失败的错误信息
                console.log("error", e);
            }
        }
    }
    const onQueryOneOrder = async () => {
        if (!orderId) {
            console.log('--请输入订单号', 请输入订单号)
            return;
        }
        // 创建以太坊提供者和签名者实例
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        // 初始化智能合约实例
        const contract = new ethers.Contract(
            NFTMarketPlaceAddress,
            NFTMarketPlaceAbi.abi,
            signer
        );
        // const orderId = 1; // 要查询的订单 ID
        // 调用合约的 orders 映射（public 自动生成 getter 函数）
        const order = await contract.orders(orderId);
        console.log('----order', order)


        // 按索引映射（与结构体字段顺序严格对应）
        const orderData = {
            orderId: order[0].toString(),
            seller: order[1],
            nftContract: order[2],
            tokenId: order[3].toString(),
            price: ethers.formatEther(order[4]), // 转换为 ETH
            paymentToken: order[5],
            isActive: order[6],
            isEscrowed: order[7]
        };
        console.log("订单详情:", orderData);
    }

    // 查询该合约平台中所有的 订单
    const onQueryPlatformAllOrders = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                NFTMarketPlaceAddress,
                NFTMarketPlaceAbi.abi,
                signer
            );
            const filter = contract.filters.OrderCreated(); // 无参数：查询所有事件
            const events = await contract.queryFilter(filter, 0, "latest"); // 从区块 0 到最新
            console.log('---events', events)

            // 解析事件数据
            const orders = await Promise.all(events.map(async (event) => {
                const { args } = event;
                const [id, seller, nftContract, tokenId, price] = args;
                const nftInfo = await onQueryOneNftInfo(nftContract, tokenId);
                return {
                    ...nftInfo,
                    orderId: id.toString(),
                    seller,
                    nftContract,
                    tokenId: tokenId.toString(),
                    price: Number(price),
                    blockNumber: event.blockNumber, // 订单创建的区块号
                    transactionHash: event.transactionHash, // 交易哈希
                };
            }))
            setAllOrders(orders)
            console.log("所有订单:", orders);
        }
    }

    // 查询按个nft信息
    const onQueryOneNftInfo = async (contractAddress, tokenId) => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                contractAddress,
                MyNFTAbi.abi,
                signer
            );
            const tokenUri = await contract.tokenURI(tokenId);
            const metadata = await fetchNFTMetadata(tokenUri);
            console.log("元数据:", metadata);
            return metadata;
        }
    }

    const onApprovePlatformTransferCoin = async () => {
        if (window.ethereum) {
            // 创建以太坊提供者和签名者实例
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // 初始化智能合约实例
            const contract = new ethers.Contract(
                MyTokenContractAddress,
                MyTokenAbi.abi,
                signer
            );
            try {
                console.log('---授权金额--->', buyerApproveValue)
                const tx = await contract.approve(NFTMarketPlaceAddress, buyerApproveValue);
                console.log("铸造交易已发送，哈希：", tx);

                // 4. 等待交易确认（上链）
                await tx.wait();
            } catch (e) {
                // 捕获并打印铸造失败的错误信息
                console.log("error", e);
            }
        }

    }

    // 购买 nft
    const onBuyNft = async (event: any) => {
        const { orderId } = event;
        if (window.ethereum) {
            // 创建以太坊提供者和签名者实例
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // 初始化智能合约实例
            const contract = new ethers.Contract(
                NFTMarketPlaceAddress,
                NFTMarketPlaceAbi.abi,
                signer
            );
            try {
                await contract.buyNFT(orderId);
                // 监听合约的 Mint 事件，铸造完成后刷新余额
                contract.on("OrderExecuted", async (a, b, c, d) => {
                    console.log('---创建完成', a, b, c, d) // 0n 0x0B45b5157eD10e44833DE67199D8565E28C2fC6E 0x2924Af181Fb2C68E65cAfd9611b44BCe9fb68074 0n 20n
                    getBalance()
                    getNFTBalance()
                    onQueryPlatformAllOrders()
                });
            } catch (e) {
                // 捕获并打印铸造失败的错误信息
                console.log("error", e);
            }
        }

    }

    const queryApprovedCoin = async () =>{
        if (window.ethereum) {
            // 创建以太坊提供者和签名者实例
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // 初始化智能合约实例
            const contract = new ethers.Contract(
                MyTokenContractAddress,
                MyTokenAbi.abi,
                signer
            );
            try {
                const tx = await contract.allowance(address, NFTMarketPlaceAddress);
                console.log("已授权金额：", tx);

                // 4. 等待交易确认（上链）
            } catch (e) {
                // 捕获并打印铸造失败的错误信息
                console.log("error", e);
            }
        }

    }

    return (
        <div className={styles.box_wrap}>
            {
                user ?
                    <>
                        <div className={styles.main}>
                            <h3>同质化代币</h3>
                            <div>余额：{balance}</div>
                            <div className={styles.input}>
                                你要给<Input className={styles.text} onChange={(e) => { setMintTokenAddress(e.target.value) }} />
                                增发：<Input className={styles.text} onChange={(e) => { setAmount(Number(e.target.value)) }} />
                            </div>
                            <Button type='primary' className={styles.button} onClick={onMint}>铸造</Button>


                            <div className={styles.input}>
                                你把账号：<Input className={styles.text} onChange={(e) => { setBurnTokenAddress(e.target.value) }} />
                                燃烧<Input className={styles.text} onChange={(e) => { setBurnAmount(Number(e.target.value)) }} type="text" placeholder="请输入内容" />个代币
                            </div>
                            <Button type='primary' className={styles.button} onClick={onBurn}>燃烧</Button>
                        </div>
                        <div className={styles.main}>
                            <h3>NFT余额：{nftBalance}</h3>
                            <h4>nft 列表</h4>
                            {nfts.map((item: any) => {
                                return (
                                    <p style={{ border: 'solid 1px #f2f2f2', display: 'flex', alignItems: 'center', padding: '0 100px' }}>
                                        <span style={{ marginRight: '20px' }}>tokenId：{item.tokenId}</span>
                                        <Image style={{ width: '100px', verticalAlign: 'middle' }} src={item.image} />
                                    </p>
                                )
                            })
                            }
                            <div className={styles.input}>
                                你要给<Input className={styles.text} onChange={(e) => { setMintNftAddress(e.target.value) }} />铸造nft
                            </div>
                            <Button type='primary' className={styles.button} onClick={onMintNft}>铸造</Button>

                            <div className={styles.input}>
                                你把账号：<Input className={styles.text} onChange={(e) => { setBurnNftAddress(e.target.value) }} />
                                的nft<Input className={styles.text} onChange={(e) => { setBurnNftTokenId(e.target.value) }} type="text" placeholder="请输入内容" />燃烧掉
                            </div>
                            <Button type='primary' className={styles.button} onClick={onBurnNft}>燃烧</Button>
                            <div style={{ marginTop: '20px' }}>
                                <Button onClick={onApprove}>授权当前用户所有nft可托管给合约平台</Button>
                            </div>
                        </div>
                        <div>
                        </div>
                        <div className={styles.main}>
                            <h1 style={{ fontSize: '32px' }}>出售nft</h1>
                            <Form
                                {...layout}
                                name="nest-messages"
                                onFinish={onSubmit}
                                style={{ maxWidth: 1000 }}
                            >
                                <Form.Item name="nftContract" label="nft 合约地址" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='tokenId' label=" nft tokenId" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name='paymentToken' label="代币 合约地址" rules={[{ required: true }]}>
                                    <Input placeholder='plase input the url of nft link external' />
                                </Form.Item>
                                <Form.Item name='price' label="售价" rules={[{ required: true }]}>
                                    <InputNumber placeholder='plase input detail of the nft' />
                                </Form.Item>
                                <Form.Item label={null}>
                                    <Button type="primary" htmlType="submit">
                                        Submit
                                    </Button>
                                </Form.Item>
                            </Form>
                            <div>
                                输入订单号<Input style={{ width: '100px' }} onChange={(e) => { setOrderId(e.target.value) }} />
                                <Button onClick={onQueryOneOrder}>查询订单</Button>
                            </div>
                        </div>
                        <div className={styles.main}>
                            <h3>查询平台合约中的nft</h3>
                            {allOrders.map((item: any) => {
                                return (
                                    <p style={{ border: 'solid 1px #f2f2f2', display: 'flex', alignItems: 'center', padding: '0 100px' }}>
                                        <span style={{ marginRight: '20px' }}>orderId：{item.orderId}</span>
                                        <span style={{ marginRight: '20px' }}>tokenId：{item.tokenId}</span>
                                        <span style={{ marginRight: '20px' }}>price：{item.price}</span>
                                        <Image style={{ width: '100px', verticalAlign: 'middle' }} src={item.image} />
                                    </p>
                                )
                            })
                            }
                        </div>
                        <div className={styles.main}>
                            <h1 style={{ fontSize: '32px' }}>购买nft</h1>
                            <Input style={{width: '150px'}} onChange={(e) => { setBuyerApproveValue(e.target.value) }}/>
                            <div style={{margin: '20px 0'}}><Button onClick={onApprovePlatformTransferCoin}>授权平台可以转移代币</Button></div>

                            <div style={{margin: '20px 0'}}><Button onClick={queryApprovedCoin}>查询已授权金额</Button></div>
                            <Form
                                {...layout}
                                name="nest-messages"
                                onFinish={onBuyNft}
                                style={{ maxWidth: 1000 }}
                            >
                                <Form.Item name="orderId" label="订单号" rules={[{ required: true }]}>
                                    <Input style={{ width: '200px' }} />
                                </Form.Item>
                                <Form.Item label={null}>
                                    <Button type="primary" htmlType="submit">
                                        Submit
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>


                    </> :
                    <div className={styles.please_login}>请登录</div>
            }
        </div>
    )
}

export default Main;