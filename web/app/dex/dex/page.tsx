'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Input, Select } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useContracts } from '@/app/contexts/DexContractContext';
import { pairABI } from '../../constants';
import { formatTokentoEth } from "@/utils";
import AccountInfo from '../accountInfo/page';
import AddLiquidity from '../addLiquidity/page';

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
    const [pairList, setPairList] = useState<any>([]);

    // 功能状态（兑换）
    const [swapTokenIn, setSwapTokenIn] = useState({ address: CONTRACTS_ADDRESSE.TOKENA_CONTRACT_ADDRESS, symbol: 'TA' });
    const [swapTokenOut, setSwapTokenOut] = useState({ address: CONTRACTS_ADDRESSE.TOKENB_CONTRACT_ADDRESS, symbol: 'TA' });
    const [swapAmountIn, setSwapAmountIn] = useState('');
    const [swapAmountOut, setSwapAmountOut] = useState('');
    const [swapLoading, setSwapLoading] = useState(false);

    // 功能状态（添加流动性）
    const [addTokenA, setAddTokenA] = useState({ address: CONTRACTS_ADDRESSE.TOKENA_CONTRACT_ADDRESS, symbol: 'TA' });
    const [addTokenB, setAddTokenB] = useState({ address: CONTRACTS_ADDRESSE.TOKENB_CONTRACT_ADDRESS, symbol: 'TA' });
    const [addAmountA, setAddAmountA] = useState('');
    const [addAmountB, setAddAmountB] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    // 功能状态（移除流动性）
    const [removePair, setRemovePair] = useState(null);
    const [removeAmount, setRemoveAmount] = useState('');
    const [removeLoading, setRemoveLoading] = useState(false);
    const [pairs, setPairs] = useState([]);


    const [mintTokenAddress, setMintTokenAddress] = useState<any>();
    const [mintTokenValue, setMintTokenValue] = useState<any>();







    // 执行添加流动性
    const handleAddLiquidity = async () => {
        if (!uniswapV2Router || !addAmountA || !addAmountB) return;
        try {
            setAddLoading(true);
            const amountA = ethers.parseUnits(addAmountA, 18);
            const amountB = ethers.parseUnits(addAmountB, 18);
            const amountAMin = (amountA * BigInt(90)) / BigInt(100); // 20%滑点
            const amountBMin = (amountB * BigInt(90)) / BigInt(100);

            const { allowanceAmount, allowanceAmountB } = await queryAllowance();
            if (Number(allowanceAmount) < Number(amountA) || Number(allowanceAmountB) < Number(amountB)) {
                console.log('授权金额不足，开始授权')
                // tokenA 或者 tokenB授权router可以转移的金额小于本次添加流动性的金额，再次授权
                await tokenAContract?.approve(CONTRACTS_ADDRESSE.ROUTER_CONTRACT_ADDRESS, amountA);
                await tokenBContract?.approve(CONTRACTS_ADDRESSE.ROUTER_CONTRACT_ADDRESS, amountB);
                // 授权成功
                console.log(`授权成功, tokenA金额：${amountA}，tokenB 金额：${amountB}`)
            }

            let tokenA = addTokenA.address;
            let tokenB = addTokenB.address;
            let amountADesired = amountA;
            let amountBDesired = amountB;
            let to = address;
            console.log('添加流动性入参',
                tokenA,
                tokenB,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                to);
            // 执行添加流动性

            console.log('--添加流动性入参',
                tokenA,
                tokenB,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                to)
                console.log('开始添加流动性')
            const tx = await uniswapV2Router?.addLiquidity(
                tokenA,
                tokenB,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                to,
            );
            await tx.wait();
            uniswapV2Router?.on("Increment", async (event) => {
                console.log('---event', event)
            });
        } catch (err) {

            console.error('添加流动性失败:', err);
            alert('添加流动性失败，请检查余额和授权');
        } finally {
            setAddLoading(false);
        }
    };







    // 计算兑换输出数量
    const calculateSwap = async () => {
        if (!uniswapV2Router || !swapAmountIn || TOKENS[0].value === swapTokenOut.address) return;

        try {
            const amountIn = ethers.parseUnits(swapAmountIn, 18);
            // const amountIn = BigInt(swapAmountIn);
            const path = [TOKENS[0].value, swapTokenOut.address];
            console.log('入参:', amountIn, path);
            const amounts = await uniswapV2Router?.getAmountsOut(amountIn, ["0xdde3Ac2E8eC5599e02F85e59721fF2a1e5Fe8c9B"]);
            console.log('---amounts', amounts);
            setSwapAmountOut(ethers.formatUnits(amounts[1], swapTokenOut.decimals));
        } catch (err) {
            console.error('计算兑换数量失败:', err);
        }
    };

    // 执行代币兑换
    const handleSwap = async () => {
        if (!uniswapV2Router || !swapAmountIn || !swapAmountOut) return;

        try {
            console.log('----')
            setSwapLoading(true);
            const amountIn = ethers.parseUnits(swapAmountIn, 18);
            console.log('---amountIn', amountIn)
            const amountOutMin = ethers.parseUnits(
                (parseFloat(swapAmountOut) * 0.80).toString(), // 5%滑点 tolerance
                swapTokenOut.decimals
            );
            console.log('---amountOutMin', amountOutMin)
            const path = [TOKENS[0].value, swapTokenOut.address];
            console.log('---path', path)
            const deadline = Math.floor(Date.now() / 1000) + 60 * 100; // 10分钟有效期
            console.log('---deadline', deadline)


            // 批准代币转账（如果不是ETH）
            if (TOKENS[0].value !== TOKENS.tokenA.address) {
                console.log('----开始授权')
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const tokenContract = new ethers.Contract(TOKENS[0].value, [
                    'function approve(address spender, uint value) external returns (bool)'
                ], signer);
                const txx = await tokenContract.approve(CONTRACTS_ADDRESSE.ROUTER_CONTRACT_ADDRESS, amountIn);
                console.log('--授权接口', txx)
            }

            // 执行兑换
            const tx = await uniswapV2Router?.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                address,
                deadline
            );
            await tx.wait();
            alert('兑换成功！');
            setSwapAmountIn('');
            setSwapAmountOut('');
        } catch (err) {
            console.error('兑换失败:', err);
            alert('兑换失败，请检查余额和授权');
        } finally {
            setSwapLoading(false);
        }
    };



    // 执行移除流动性
    const handleRemoveLiquidity = async () => {
        if (!uniswapV2Router || !removePair || !removeAmount) return;

        try {
            setRemoveLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const pairContract = new ethers.Contract(removePair.address, pairABI, signer);
            const liquidity = ethers.parseUnits(removeAmount, 18); // LP代币通常是18位小数

            // 批准LP代币转账
            await pairContract.approve(CONTRACTS_ADDRESSE.ROUTER_CONTRACT_ADDRESS, liquidity);

            // 计算最小接收数量（5%滑点）
            const [reserve0, reserve1] = await pairContract.getReserves();
            const totalSupply = await pairContract.totalSupply();
            const amount0Min = liquidity * reserve0 / totalSupply * BigInt(95) / BigInt(100);
            const amount1Min = liquidity * reserve1 / totalSupply * BigInt(95) / BigInt(100);
            const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

            // 执行移除流动性
            const tx = await uniswapV2Router.removeLiquidity(
                removePair.token0.address,
                removePair.token1.address,
                liquidity,
                amount0Min,
                amount1Min,
                address,
                deadline
            );
            await tx.wait();
            alert('移除流动性成功！');
            setRemoveAmount('');
        } catch (err) {
            console.error('移除流动性失败:', err);
            alert('移除流动性失败，请检查LP余额和授权');
        } finally {
            setRemoveLoading(false);
        }
    };

    return (
        <div className="container">
            <AccountInfo/>
            <AddLiquidity />
            {/* 添加流动性功能 */}
            {/* 代币兑换功能 */}
            <section className="card">
                <h2>代币兑换</h2>
                <div className="input-group">
                    <select
                        value={swapTokenIn.address}
                        onChange={(e) => setSwapTokenIn(TOKENS.find((t: any) => t.address === e.target.value))}
                    >
                        {TOKENS.map((item: any) => (
                            <option key={item.symbol} value={item.address}>{item.symbol}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="输入数量"
                        value={swapAmountIn}
                        onChange={(e) => setSwapAmountIn(e.target.value)}
                        onBlur={calculateSwap}
                    />
                </div>
                <button onClick={() => {
                    //   const [swapTokenIn, swapTokenOut] = [swapTokenOut, swapTokenIn];
                    //   setSwapTokenIn(swapTokenIn);
                    //   setSwapTokenOut(swapTokenOut);
                }}>交换</button>
                <div className="input-group">
                    <select
                        value={swapTokenOut.address}
                        onChange={(e) => setSwapTokenOut(TOKENS.find((t: any) => t.address === e.target.value))}
                    >
                        {TOKENS.map((token: any) => (
                            <option key={token.symbol} value={token.address}>{token.symbol}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="输出数量"
                        value={swapAmountOut}
                        readOnly
                    />
                </div>
                <button onClick={handleSwap} disabled={!address || swapLoading}>
                    {swapLoading ? '处理中...' : `兑换 ${swapTokenIn.symbol} 到 ${swapTokenOut.symbol}`}
                </button>
            </section>


            {/* 移除流动性功能 */}
            <section className="card">
                <h2>移除流动性</h2>
                <div className="input-group">
                    <select
                        value={removePair?.address || ''}
                        onChange={(e) => setRemovePair(pairs.find(p => p.address === e.target.value))}
                    >
                        {pairs.map(pair => (
                            <option key={pair.address} value={pair.address}>
                                {pair.token0.symbol}-{pair.token1.symbol}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="输入LP数量"
                        value={removeAmount}
                        onChange={(e) => setRemoveAmount(e.target.value)}
                    />
                </div>
                <button onClick={handleRemoveLiquidity} disabled={!address || !removePair || removeLoading}>
                    {removeLoading ? '处理中...' : `移除 ${removePair?.token0.symbol}-${removePair?.token1.symbol} 流动性`}
                </button>
            </section>

            <style jsx>{`
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .card { border: 1px solid #ccc; padding: 20px; margin: 10px 0; border-radius: 8px; }
        .input-group { margin: 10px 0; display: flex; gap: 10px; }
        select, input { flex: 1; padding: 8px; }
        button { width: 100%; padding: 10px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px 0; }
        button:disabled { background: #ccc; cursor: not-allowed; }
      `}</style>
        </div>
    );
}