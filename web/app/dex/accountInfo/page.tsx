'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Input } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { formatTokentoEth } from "@/utils";
import { useContracts } from '@/app/contexts/DexContractContext';
import { pairABI } from '../../constants';

export default function Home() {
    const {
        tokenAContract,
        tokenBContract,
        tokenCContract,
        uniswapV2Factory,
        uniswapV2Router
    } = useContracts(); // 获取合约实例
    const { address } = useSelector((state: RootState) => state.wallet);
    const { CONTRACTS_ADDRESSE } = useSelector((state: RootState) => state.network);
    const [TOKENS, setTOKENS] = useState<any>([]);
    const [tokenABalance, setTokenABalance] = useState<number | string>(0);
    const [tokenBBalance, setTokenBBalance] = useState<number | string>(0);
    const [tokenCBalance, setTokenCBalance] = useState<number | string>(0);

    const [mintTokenAddress, setMintTokenAddress] = useState<any>();
    const [mintTokenValue, setMintTokenValue] = useState<any>();

    const [pairList, setPairList] = useState<any>([]);

    // 初始化合约
    useEffect(() => {
        if (address && tokenAContract && tokenBContract && tokenCContract) {
            getTokenAccountBalance();
            getAllPair();
        }
    }, [address, tokenAContract, tokenBContract, tokenCContract]);

    if (!uniswapV2Router) return;

    // 查询代币合约tokenA、tokenB、tokenC 的余额
    const getTokenAccountBalance = async () => {
        const userBalanceA = await tokenAContract?.balanceOf(address);
        const userBalanceB = await tokenBContract?.balanceOf(address);
        const userBalanceC = await tokenCContract?.balanceOf(address);
        setTokenABalance(formatTokentoEth(userBalanceA));
        setTokenBBalance(formatTokentoEth(userBalanceB));
        setTokenCBalance(formatTokentoEth(userBalanceC));
        // 查询指定区块范围的 DebugTransfer 事件
    }

    // 获取单个交易对信息
    const queryPairContractInfo = async (pairAddress: string) => {
        const provider = new ethers.BrowserProvider(window.ethereum); // 浏览器环境
        // 2. 交易对（Pair）合约地址（需替换为目标地址）
        // const pairAddress = "0xCc182BE0048AEF6df6d8dC929b6678a65a963b57"; // 示例：ETH-USDC 交易对
        const pairContract = new ethers.Contract(pairAddress, pairABI, provider);
        // 4.1 获取关联的两种代币地址
        const [token0, token1] = await Promise.all([
            pairContract.token0(),
            pairContract.token1()
        ]);
        const { reserve0, reserve1, blockTimestampLast } = await pairContract.getReserves();
        const totalSupply = await pairContract.totalSupply();
        console.log('--reserve1', Number(reserve1))
        const totalNum = ethers.formatUnits(totalSupply, 18);

        const myBalance = await pairContract.balanceOf(address);
        const myLP = ethers.formatUnits(myBalance, 18);
        return {
            pairAddress: pairAddress,
            tokenAAddress: token1,
            tokenBAddress: token0,
            tokenABalance: ethers.formatUnits(reserve1, 18),
            tokenBBalance: ethers.formatUnits(reserve0, 18),
            LpBalance: parseFloat(totalNum).toFixed(2),
            myLpBalance: parseFloat(myLP).toFixed(2),
            lastUpdateTime: new Date(Number(blockTimestampLast) * 1000).toString()
        }
    }

    // 获取所有交易对
    const getAllPair = async () => {
        console.log('--查询交易对')
        let list = [];
        const pairLength = await uniswapV2Factory?.allPairsLength();
        console.log('--pairLength', pairLength)
        for (let i = 0; i < Number(pairLength); i++) {
            const pairAddress = await uniswapV2Factory?.allPairs(i);
            const pairObj = await queryPairContractInfo(pairAddress)
            list.push(pairObj)
        }
        console.log('-list', list)
        setPairList(list)
    }
    // 连接钱包
    const connectWallet = async () => {
        // if (window.ethereum) {
        //   try {
        //     const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        //     const _provider = new ethers.providers.Web3Provider(window.ethereum);
        //     const _signer = _provider.getSigner();
        //     const _chainId = await _provider.getNetwork().then(net => net.chainId);

        //     setProvider(_provider);
        //     setSigner(_signer);
        //     setAccount(accounts[0]);

        //     // 监听账户切换
        //     window.ethereum.on('accountsChanged', (accounts) => {
        //       setAccount(accounts[0] || null);
        //     });

        //     // 监听网络切换
        //     window.ethereum.on('chainChanged', () => {
        //       window.location.reload();
        //     });
        //   } catch (err) {
        //     console.error('连接钱包失败:', err);
        //   }
        // } else {
        //   alert('请安装MetaMask钱包');
        // }
    };
    const mintTokenToAddress = async (type: string) => {
        // const provider = new ethers.JsonRpcProvider("http://localhost:8545");
        // const provider = new ethers.BrowserProvider(window.ethereum);

        // const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        // const signer = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
        // // const signer = await provider.getSigner();
        // const tokenAss = new ethers.Contract('0x5FbDB2315678afecb367f032d93F642f64180aa3', TokenAJSONAbi.abi, signer);
        // console.log('-------dsssss--->', tokenAss);
        // const amountA = BigInt('5000');
        // const nonce = await provider.getTransactionCount('0x5FbDB2315678afecb367f032d93F642f64180aa3', 'pending');
        // console.log('---nonce', nonce)
        // const txA = await tokenAss?.mintToken('0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', amountA);
        // console.log('---ass', txA);
        const tx = await tokenAContract?.mintToken("0x5FC8d32690cc91D4c39d9d3abcBD16989F875707", BigInt('10'), {
            gasLimit: ethers.toBigInt(60000), // 推荐：用BigInt明确Gas限制
            timeout: '60000', // 仅对当前 mint 交易生效，单位：毫秒
            // gasPrice: ethers.parseUnits('1', 'gwei'), // 本地节点可省略，自动获取
        });
        console.log('----tx', tx);

        return
        // if(type === 'tokenA') {
        //     console.log('--mintTokenAddress, mintTokenValue', mintTokenAddress, mintTokenValue)
        //     tokenAContract?.mintToken(mintTokenAddress, BigInt(mintTokenValue))
        //     tokenAContract?.on("Mint", async (event) => {
        //         console.log('---铸造成功', event)
        //     });
        // } else if(type === 'tokenB')  {
        //     tokenBContract?.mintToken(mintTokenAddress, mintTokenValue);
        //     tokenBContract?.on("Mint", async (event) => {
        //         console.log('---铸造成功', event)
        //     });
        // } else if(type === 'tokenC')  {
        //     tokenCContract?.mintToken(mintTokenAddress, mintTokenValue);
        //     tokenCContract?.on("Mint", async (event) => {
        //         console.log('---铸造成功', event)
        //     });
        // }
    }

    return (
        <header style={{ padding: '40px 0' }}>
            {address ? (
                <p style={{ margin: '30px 0', fontSize: '24px' }}>已连接: {address.slice(0, 6)}...{address.slice(-4)}</p>
            ) : (
                <button onClick={connectWallet}>连接钱包</button>
            )}
            <h2 style={{ fontWeight: 'bold', color: 'blue', }}>现有账户信息</h2>
            <div style={{ marginBottom: '30px' }}>
                <div>
                    <div>tokenA账户余额：{tokenABalance}</div>
                    给<Input onChange={(e) => { setMintTokenAddress(e.target.value) }} style={{ width: '400px', margin: '10px' }} /><Button type="primary" onClick={() => {
                        mintTokenToAddress('tokenA')
                    }}>铸造</Button><Input onChange={(e) => { setMintTokenValue(e.target.value) }} style={{ width: '100px', margin: '0 10px' }} />个代币
                </div>
                <div>
                    <div>tokenB账户余额：{tokenBBalance}</div>
                    给<Input onChange={(e) => { setMintTokenAddress(e.target.value) }} style={{ width: '400px', margin: '10px' }} /><Button type="primary" onClick={() => {
                        mintTokenToAddress('tokenB')
                    }}>铸造</Button><Input onChange={(e) => { setMintTokenValue(e.target.value) }} style={{ width: '100px', margin: '0 10px' }} />个代币
                </div>
                <div>
                    <div>tokenC账户余额：{tokenCBalance}</div>
                    给<Input onChange={(e) => { setMintTokenAddress(e.target.value) }} style={{ width: '400px', margin: '10px' }} /><Button type="primary" onClick={() => {
                        mintTokenToAddress('tokenC')
                    }}>铸造</Button><Input onChange={(e) => { setMintTokenValue(e.target.value) }} style={{ width: '100px', margin: '0 10px' }} />个代币
                </div>
            </div>
            <h2 style={{ fontWeight: 'bold', color: 'blue' }}>现有交易对</h2>
            {
                pairList.length > 0? pairList.map((item: any) => {
                    return (
                        <div>
                            <div style={{ color: '#ff0000' }}>合约地址：{item?.pairAddress}</div>
                            <div style={{ color: 'blue' }}>交易对总LP代币：{item?.LpBalance}</div>
                            <div style={{ color: 'blue' }}>我的LP代币：{item?.myLpBalance}</div>
                            <div style={{ paddingLeft: '20px' }}>
                                <div>token1地址：{item?.tokenAAddress}</div>
                                <div>token1余额：{item?.tokenABalance}</div>
                                <div>token2地址：{item?.tokenBAddress}</div>
                                <div>token2余额：{item?.tokenBBalance}</div>
                            </div>
                        </div>
                    )
                }) : '暂无交易对信息'
            }
        </header>
    )
}