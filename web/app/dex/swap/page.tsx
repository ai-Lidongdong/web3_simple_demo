// src/pages/SwapPage.tsx
'use client';
import { useState, useEffect } from "react";
import { Button, Input } from 'antd';
import { ethers } from "ethers";
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useContracts } from '@/app/contexts/DexContractContext';
import NFTHeader from '@/app/components/NFTHeader';
import { CONTRACTS_ADDRESSE } from '../../constants'
import styles from './page.module.css';
import UniswapV2FactoryABI from "../../constants/artifacts/UniswapV2FactoryModule#UniswapV2Factory.json"
import UniswapV2RouterABI from "../../constants/artifacts/UniswapV2RouterModule#UniswapV2Router.json"
import UniswapV2PairABI from "../../constants/artifacts/UniswapV2PairModule#UniswapV2Pair.json"
const ContractModule = {
  UniswapV2Factory: '0x1b82cB7a3B560480d50FAc679C2E3019dB44EBe7',
  UniswapV2Router: '0xB0EE237f2758ab2dA3f26A9C7bd8033eDA580547',
  UniswapV2Pair: '0x99Afb9D450889095B74bA0869D2A2a4aEa214a19',
}

const ApproveCoin = () => {
  const { chainId } = useSelector((state: RootState) => state.network);
  const { tokenA, tokenB, tokenC } = useContracts();
  const [approveTokenAAmount, setApproveTokenAAmount] = useState(0);
  const [approveTokenBAmount, setApproveTokenBAmount] = useState(0);
  const [approveTokenCAmount, setApproveTokenCAmount] = useState(0);

  // 授权Router可以转移TokenA代币
  const onApproveTransferTokenA = async () => {
    const tx = await tokenA?.approve(CONTRACTS_ADDRESSE[chainId].ROUTER_CONTRACT_ADDRESS, approveTokenAAmount);
    console.log('-授权Router可以转移TokenA代币--结果', tx)
  }

  // 授权Router可以转移TokenB代币
  const onApproveTransferTokenB = async () => {
    const tx = await tokenB?.approve(CONTRACTS_ADDRESSE[chainId].ROUTER_CONTRACT_ADDRESS, approveTokenBAmount);
    console.log('-授权Router可以转移TokenB代币--结果', tx)
  }

  // 授权Router可以转移TokenC代币
  const onApproveTransferTokenC = async () => {
    const tx = await tokenC?.approve(CONTRACTS_ADDRESSE[chainId].ROUTER_CONTRACT_ADDRESS, approveTokenCAmount);
    console.log('-授权Router可以转移TokenC代币--结果', tx)
  }
  return (
    <div>
      <div style={{ marginTop: '10px' }}>
        <Input className={styles.common_input} value={approveTokenAAmount} onChange={(e: any) => setApproveTokenAAmount(e.target.value)} />
        <Button onClick={onApproveTransferTokenA}>授权Router可以转移TokenA代币</Button></div>
      <div style={{ marginTop: '10px' }}>
        <Input className={styles.common_input} value={approveTokenBAmount} onChange={(e: any) => setApproveTokenBAmount(e.target.value)} />
        <Button onClick={onApproveTransferTokenB}>授权Router可以转移TokenB代币</Button></div>
      <div style={{ marginTop: '10px' }}>
        <Input className={styles.common_input} value={approveTokenCAmount} onChange={(e: any) => setApproveTokenCAmount(e.target.value)} />
        <Button onClick={onApproveTransferTokenC}>授权Router可以转移TokenC代币</Button></div>
    </div>
  )
}


const SwapPage = () => {
  const { tokenA, tokenB, tokenC } = useContracts();

  // const { dexRouter, dexPair, tokenA, tokenB, tokenC } = useContracts();
  // if (!dexRouter || !dexPair) return;
  const { address } = useSelector((state: RootState) => state.wallet);
  const { chainId } = useSelector((state: RootState) => state.network);
  const [tokenIn, setTokenIn] = useState("ETH"); // 输入代币
  const [tokenOut, setTokenOut] = useState("USDC"); // 输出代币
  const [amountIn, setAmountIn] = useState("0"); // 输入数量
  const [amountOut, setAmountOut] = useState("0"); // 预估输出数量
  const [loading, setLoading] = useState(false);

  const [tokenABalance, setTokenABalance] = useState<number | string>(0);
  const [tokenBBalance, setTokenBBalance] = useState<number | string>(0);
  const [tokenCBalance, setTokenCBalance] = useState<number | string>(0);


  const [liquidityTokenA, setLiquidityTokenA] = useState(0);
  const [liquidityTokenB, setLiquidityTokenB] = useState(0);

  useEffect(() => {
    getTokenBalance()
    getPairBalance();
  }, []);

  const getPairBalance = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    // 初始化智能合约实例
    const contract = new ethers.Contract(
      ContractModule.UniswapV2Pair,
      UniswapV2PairABI.abi,
      signer
    );
    const [reserveA, reserveB] = await contract.getReserves();
    console.log('---abb', reserveA, reserveB);
  }


  const getTokenBalance = async () => {
    const userTokenABalance = await tokenA?.balanceOf(address);
    const balanceA = ethers.formatUnits(userTokenABalance, 18); // 把wei转换为eth单位
    const formattedBalanceA = parseFloat(balanceA).toFixed(2);
    setTokenABalance(formattedBalanceA);

    const userTokenBBalance = await tokenA?.balanceOf(address);
    const balanceB = ethers.formatUnits(userTokenBBalance, 18); // 把wei转换为eth单位
    const formattedBalanceB = parseFloat(balanceB).toFixed(2);
    setTokenBBalance(formattedBalanceB);

    const userTokenCBalance = await tokenA?.balanceOf(address);
    const balanceC = ethers.formatUnits(userTokenCBalance, 18); // 把wei转换为eth单位
    const formattedBalanceC = parseFloat(balanceC).toFixed(2);
    setTokenCBalance(formattedBalanceC);

    // 查询Pair合约余额
    // const reserve0 = await dexPair?.getReserves();
    // console.log('-----reserve0', reserve0)
  }

  // 计算预估兑换数量
  const handleCalculate = async () => {
    // if (!(dexRouter || dexPair) || !amountIn || amountIn === "0") return;
    // try {
    //   // const { router, pair } = contracts;
    //   const reserve0 = await dexPair?.reserve0();
    //   const reserve1 = await dexPair?.reserve1();
    //   const amountInWei = ethers.parseEther(amountIn); // 假设是 ETH 单位

    //   // 调用 Router 计算输出
    //   const amountOutWei = await dexRouter?.getAmountOut(
    //     amountInWei,
    //     reserve0, // 假设 tokenIn 对应 reserve0
    //     reserve1
    //   );
    //   setAmountOut(ethers.formatEther(amountOutWei));
    // } catch (err) {
    //   console.error("计算失败:", err);
    // }
  };

  // // 执行兑换
  const handleSwap = async () => {
    // if (!(dexRouter || dexPair) || !address || amountIn === "0") return;
    // setLoading(true);
    // try {
    //   // const { router, pair } = contracts;
    //   const amountInWei = ethers.parseEther(amountIn);
    //   const amountOutMin = ethers.parseEther((parseFloat(amountOut) * 0.95).toString()); // 5% 滑点保护

    //   // 授权 Router 花费 tokenIn（如果是 ERC20）
    //   // 这里简化处理，假设 tokenIn 是 ETH（无需授权）

    //   // 调用兑换函数
    //   const tx = await dexRouter?.swapExactTokensForTokens(
    //     amountInWei,
    //     amountOutMin,
    //     "0xTokenInAddress", // tokenIn 合约地址
    //     "0xTokenOutAddress", // tokenOut 合约地址
    //     address,
    //     dexPairs.target, // 交易对地址
    //     { gasLimit: 300000 }
    //   );
    //   console.log('---tx', tx);
    //   await tx.wait();
    //   alert("兑换成功！");
    // } catch (err) {
    //   console.error("兑换失败:", err);
    //   alert("兑换失败，请重试");
    // } finally {
    //   setLoading(false);
    // }
  };



  // 添加流动性，确定 TokenA 数量，计算出 TokenB 需要的数量
  const confirmLiquidityTokenA = () => {

  }

  // 添加流动性，确定 TokenB 数量，计算出 TokenA 需要的数量
  const confirmLiquidityTokenB = () => {
    // liquidityTokenA
  }

  // 确认添加流动性
  const confirmAddLiquidity = () => {
    // liquidityTokenB
  }



  return (
    <div className="swap-container">
      <NFTHeader />
      <h2 style={{ fontSize: '22px', color: 'blue' }}>交易所是数据</h2>
      <div>TokenA余额：<span>{tokenABalance}</span></div>
      <div>TokenB余额：<span>{tokenBBalance}</span></div>
      <div>TokenC余额：<span>{tokenCBalance}</span></div>

      {/* 用户为交易提供流动性逻辑 */}
      <h2>用户为交易提供流动性</h2>
      <div>
        tokenA<Input className={styles.common_input} value={liquidityTokenA} onChange={(e: any) => setLiquidityTokenA(e.target.value)} />
        <Button onClick={confirmLiquidityTokenA}>确认金额</Button>
      </div>
      <div>
        tokenB<Input className={styles.common_input} value={liquidityTokenB} onChange={(e: any) => setLiquidityTokenB(e.target.value)} />
        <Button onClick={confirmLiquidityTokenB}>确认金额</Button>
        <ApproveCoin />
        <Button onClick={confirmAddLiquidity}></Button>
      </div>


      


      {/* 代币兑换逻辑 */}
      <h2 style={{ fontSize: '22px', color: 'blue', marginTop: '20px' }}>代币兑换</h2>
      <div className="input-section">
        <ApproveCoin />
        <label>输入代币: tokenA</label>
        <Input
          type="text"
          style={{ width: '150px', margin: '10px 10px' }}
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
          placeholder="输入数量"
        /><Button type="primary" onClick={handleCalculate}>计算可兑换数量</Button>
      </div>

      <div className="output-section" style={{ marginTop: '20px' }}>
        <label>可输出代币: tokenB</label>
        <Input type="text"
          style={{ width: '150px', margin: '10px 10px' }} value={amountOut} readOnly />
        <Button type="primary" onClick={handleSwap} disabled={loading || !amountOut}>
          {loading ? "处理中..." : "确认兑换"}
        </Button>
      </div>
    </div>
  );
};

export default SwapPage;