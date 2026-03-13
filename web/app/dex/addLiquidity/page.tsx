'use client';
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Button, Input, Select } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useContracts } from '@/app/contexts/DexContractContext';

type TokenOption = {
    value: string;
    label: string;
};

const Home = () => {
    const {
        tokenAContract,
        tokenBContract,
        tokenCContract,
        uniswapV2Factory,
        uniswapV2Router
    } = useContracts(); // 获取合约实例
    const { address } = useSelector((state: RootState) => state.wallet);
    const { CONTRACTS_ADDRESSE } = useSelector((state: RootState) => state.network);

    const [TOKENS, setTOKENS] = useState<TokenOption[]>([]);
    const [addToken1, setAddToken1] = useState<TokenOption | null>(null);
    const [addToken2, setAddToken2] = useState<TokenOption | null>(null);

    const [addAmount1, setAddAmount1] = useState('');
    const [addAmount2, setAddAmount2] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    const queryAllowance = useCallback(async () => {
        const allowanceTokenAmountA: string =
            (await tokenAContract?.allowance(address, CONTRACTS_ADDRESSE.ROUTER_CONTRACT_ADDRESS))?.toString() || '';
        const allowanceTokenAmountB: string =
            (await tokenBContract?.allowance(address, CONTRACTS_ADDRESSE.ROUTER_CONTRACT_ADDRESS))?.toString() || '';
        console.log('tokenA授权金额', allowanceTokenAmountA);
        console.log('tokenB授权金额', allowanceTokenAmountB);

        return {
            allowanceAmount: ethers.parseUnits(allowanceTokenAmountA, 18),
            allowanceAmountB: ethers.parseUnits(allowanceTokenAmountB, 18),
        };
    }, [tokenAContract, tokenBContract, address, CONTRACTS_ADDRESSE]);

    useEffect(() => {
        if (CONTRACTS_ADDRESSE) {
            setTOKENS([
                { value: CONTRACTS_ADDRESSE.TOKENA_CONTRACT_ADDRESS, label: 'TA' },
                { value: CONTRACTS_ADDRESSE.TOKENB_CONTRACT_ADDRESS, label: 'TB' },
                { value: CONTRACTS_ADDRESSE.TOKENC_CONTRACT_ADDRESS, label: 'TC' },
            ]);
            setAddToken1({ value: CONTRACTS_ADDRESSE.TOKENA_CONTRACT_ADDRESS, label: 'TA' });
            setAddToken2({ value: CONTRACTS_ADDRESSE.TOKENB_CONTRACT_ADDRESS, label: 'TB' });
            queryAllowance();
        }
    }, [CONTRACTS_ADDRESSE, queryAllowance]);

    // 授权金额
    const onApproveAmount = async () => {
        console.log('---tokenAContract', tokenAContract)
        console.log(CONTRACTS_ADDRESSE);
        await tokenAContract?.approve(CONTRACTS_ADDRESSE.ROUTER_CONTRACT_ADDRESS, '12');
    }

    // 执行添加流动性
    const handleAddLiquidity = async () => {
        if (!uniswapV2Router || !addAmount1 || !addAmount2 || !addToken1 || !addToken2) return;
        try {
            setAddLoading(true);
            const amountA = ethers.parseUnits(addAmount1, 18);
            const amountB = ethers.parseUnits(addAmount2, 18);
            const amountAMin = (amountA * BigInt(90)) / BigInt(100); // 20%滑点
            const amountBMin = (amountB * BigInt(90)) / BigInt(100);

            const { allowanceAmount, allowanceAmountB } = await queryAllowance();
            if (Number(allowanceAmount) < Number(amountA) || Number(allowanceAmountB) < Number(amountB)) {
                console.log('授权金额不足，开始授权')
                console.log(tokenAContract, tokenBContract);
                // tokenA 或者 tokenB授权router可以转移的金额小于本次添加流动性的金额，再次授权
                await tokenAContract?.approve(CONTRACTS_ADDRESSE.ROUTER_CONTRACT_ADDRESS, amountA);
                await tokenBContract?.approve(CONTRACTS_ADDRESSE.ROUTER_CONTRACT_ADDRESS, amountB);
                // 授权成功
                console.log(`授权成功, tokenA金额：${amountA}，tokenB 金额：${amountB}`)
            }

            let tokenA = addToken1.value;
            let tokenB = addToken2.value;
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
            (uniswapV2Router as any)?.on("Increment", async (
                to: any,
                pair: any,
                token0: any,
                token1: any,
                token0Amount: any,
                token1Amount: any,
                token0AmountMin: any,
                token1AmountMin: any,
                amountA: any,
                amountB: any,
                liquidity: any) => {
                console.log('---Increment',
                    to,
                    pair,
                    token0,
                    token1,
                    token0Amount,
                    token1Amount,
                    token0AmountMin,
                    token1AmountMin,
                    amountA,
                    amountB,
                    liquidity)
            });
        } catch (err) {
            console.error('添加流动性失败:', err);
            alert('添加流动性失败，请检查余额和授权');
        } finally {
            setAddLoading(false);
        }
    };
    // 计算添加流动性所需数量

    const calculateAddLiquidity = async () => {
        if (!uniswapV2Router || !addAmount1 || !addToken1 || !addToken2 || addToken1.value === addToken2.value) return;
        try {
            const pairAddress = await uniswapV2Factory?.getPair(addToken1.value, addToken2.value);
            if (pairAddress === ethers.ZeroAddress) {
                // 新交易对，不需要计算比例
                console.log('--新交易对，不需要计算比例')
                return;
            }
            // 已存在的交易对，计算所需的B数量
            console.log('---已存在的交易对，计算所需的B数量')
            // const amountA = ethers.parseUnits(addAmountA, 18); // eth => wei
            // const provider = new ethers.BrowserProvider(window.ethereum);
            // const signer = await provider.getSigner();
            // const pairContract = new ethers.Contract(pairAddress, PairABI.abi, provider);
            // const [reserveA, reserveB] = await pairContract.getReserves();
            // const [token0] = await pairContract.token0() === addTokenA.address ? [reserveA, reserveB] : [reserveB, reserveA];

            // const amountB = amountA * reserveB / reserveA;
            // setAddAmountB(ethers.formatUnits(amountB, addTokenB.decimals));
        } catch (err) {
            console.error('计算流动性数量失败:', err);
        }
    };

    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            {
                TOKENS.length > 0 ? (
                    <section className="card">
                        <Button onClick={onApproveAmount}>授权金额</Button>
                        <h2>添加流动性</h2>
                        <div style={{ display: 'flex', alignItems: 'center' }} className="input-group">
                            <Select
                                style={{ marginRight: '15px', width: 120 }}
                                labelInValue
                                defaultValue={{ value: TOKENS[0].value, label: TOKENS[0].label }}
                                onChange={(value) => {
                                    setAddToken1(value)
                                }}
                                options={TOKENS}
                            />
                            <Input
                                type="text"
                                placeholder="输入数量"
                                value={addAmount1}
                                onChange={(e) => setAddAmount1(e.target.value)}
                                onBlur={calculateAddLiquidity}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }} className="input-group">
                            <Select
                                style={{ marginRight: '15px', width: 120 }}
                                labelInValue
                                defaultValue={{ value: TOKENS[1].value, label: TOKENS[1].label }}
                                onChange={(value) => { setAddToken2(value) }}
                                options={TOKENS}
                            />
                            <Input
                                type="text"
                                placeholder="输入数量"
                                value={addAmount2}
                                onChange={(e) => setAddAmount2(e.target.value)}
                                onBlur={calculateAddLiquidity}
                            />
                        </div>
                        <div className="input-group">
                        </div>
                        <Button type="primary" onClick={handleAddLiquidity} disabled={!address || addLoading}>
                            {addLoading ? '处理中...' : `添加 ${addToken1?.label}-${addToken2?.label} 执行流动1性`}
                        </Button>
                    </section>
                ) : null
            }

        </div>
    );
}

export default Home;
