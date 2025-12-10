import fs from "fs";
// import { ethers } from "ethers";
import { fileURLToPath } from "url";
import { network } from "hardhat";
import path from "path";
const { ethers } = await network.connect();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const deploymentsDirs = path.join(__dirname, "../ignition/deployments/chain-31337");
const paths = path.join(deploymentsDirs, 'deployed_addresses.json');
const deploymentData = JSON.parse(fs.readFileSync(paths, "utf8"));

//   "DevDexModule#TokenA": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
//   "DevDexModule#TokenB": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
//   "DevDexModule#TokenC": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
//   "DevDexModule#UniswapV2Factory": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
//   "DevDexModule#UniswapV2Pair": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
//   "UniswapV2RouterModule#UniswapV2Router": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"

const tokenAAddress = deploymentData['DevDexModule#TokenA']
const tokenBAddress = deploymentData['DevDexModule#TokenB']
const routerAddress = deploymentData['UniswapV2RouterModule#UniswapV2Router']
const pairAddress = deploymentData['DevDexModule#UniswapV2Pair']
const factoryAddress = deploymentData['DevDexModule#UniswapV2Factory']
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const privateAccount = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const signer = new ethers.Wallet(privateKey, provider);
const abiJsonA = JSON.parse(fs.readFileSync("/Users/lidongdong/web3/web3_simple_demo/contract/ignition/deployments/chain-31337/artifacts/DevDexModule#TokenA.json", "utf8"));
const abiJsonB = JSON.parse(fs.readFileSync("/Users/lidongdong/web3/web3_simple_demo/contract/ignition/deployments/chain-31337/artifacts/DevDexModule#TokenB.json", "utf8"));
const abiRouter = JSON.parse(fs.readFileSync("/Users/lidongdong/web3/web3_simple_demo/contract/ignition/deployments/chain-31337/artifacts/UniswapV2RouterModule#UniswapV2Router.json", "utf8"));
const abiPair = JSON.parse(fs.readFileSync("/Users/lidongdong/web3/web3_simple_demo/contract/ignition/deployments/chain-31337/artifacts/DevDexModule#UniswapV2Pair.json", "utf8"));
const abiFactory = JSON.parse(fs.readFileSync("/Users/lidongdong/web3/web3_simple_demo/contract/ignition/deployments/chain-31337/artifacts/DevDexModule#UniswapV2Factory.json", "utf8"));

const tokenA = new ethers.Contract(tokenAAddress, abiJsonA.abi, signer)
const tokenB = new ethers.Contract(tokenBAddress, abiJsonB.abi, signer)
const router = new ethers.Contract(routerAddress, abiRouter.abi, signer);
const pairContract = new ethers.Contract(pairAddress, abiPair.abi, signer);
const factoryContract = new ethers.Contract(factoryAddress, abiFactory.abi, signer);

// 调用合约函数测试
async function getBalance() {
    const allowanceAmount = await tokenA?.balanceOf(privateAccount);
    const allowanceAmountB = await tokenB?.balanceOf(privateAccount);
    console.log('余额', allowanceAmount, allowanceAmountB)
}
// 关键：每次交易前实时获取当前nonce（不缓存）
  const getCurrentNonce = async () => {
    const [deployer] = await ethers.getSigners();
    return await provider.getTransactionCount(deployer.address);
  };
// 授权转移代币
async function onApprove() {
    const nonce1 = await getCurrentNonce();
    const amountA = BigInt('5000');
    console.log('nonce1', nonce1)
    const txA = await tokenA?.approve(routerAddress, amountA, {nonce: nonce1 });
    await txA.wait();
    const nonce2 = await getCurrentNonce();
    console.log('nonce2', nonce2)
    const txB = await tokenB?.approve(routerAddress, amountA, {nonce: nonce2 + 1 });
    await txB.wait();
    console.log('---txA', txA);
    console.log('---txB', txB);
}

async function onAllowance() {
        const allowanceAmount = await tokenA?.allowance(privateAccount, routerAddress);
        const allowanceAmountB = await tokenB?.allowance(privateAccount, routerAddress);
        console.log('--授权金额', allowanceAmount, allowanceAmountB)

}

async function onCheck() {
    // 检查地址是否有合约代码（非空）
  const code = await provider.getCode('0x82e01223d51eb87e16a03e24687edf0f294da6f1');
  const code2 = await provider.getCode(privateAccount); // privateKey
  console.log(`合约代码长度: ${code.length} ${code2}`); // 若为 2（即 "0x"），说明不是合约
//   const iface = new ethers.Interface(abiRouter.abi);
//   const data = "0xe8e337000000000000000000000000005fbdb2315678afecb367f032d93f642f64180aa3000000000000000000000000e7f1725e7734ce288f8367e1bb143e90bb3f051200000000000000000000000000000000000000000000000000000000000007d000000000000000000000000000000000000000000000000000000000000007d000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000640000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000691c642f";
  
//   const decoded = iface.parseTransaction({ data });
//   console.log("调用的函数:", decoded.name); // 应为 "addLiquidity"
//   console.log("参数:", decoded.args); 
}

async function onPairMint() {
    const pair = '0xd592Ae97455e0e10cF436c1Cdc23b8fE80cA64c5'
    const liquidity = await pairContract(pair).mint(privateAccount);
    console.log('---liquidity', liquidity);
}
// 0xf6D685bB6B3fb76a4A54552570a4121A6b68C168
//
// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
async function onQueryPairBalance() {
    const ERC20_ABI = [
        "function balanceOf(address account) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function getReserves"
    ];
    const pairAddress = await factoryContract.getPair(tokenAAddress, tokenBAddress);
    console.log('--pairAddress', pairAddress);
    const  swapContract = new ethers.Contract(pairAddress, abiPair.abi, signer);
    const balance = await swapContract.balanceOf(privateAccount);
    const list = await swapContract.getReserves();
    console.log('--ds', list)
    const totalSupply = await swapContract.totalSupply();
    // console.log('代币A余额', reserve0);
    // console.log('代币B余额', reserve1);
    
    console.log('当前用户LP代币', ethers.formatUnits(balance, 18));
    console.log('---totalSupply', ethers.formatUnits(totalSupply, 18));
}

async function onReset() {
    // const tx = await network.send("evm_reset", []);
    // console.log('重置', tx)
}

// 调用合约函数测试
async function addLiquidity() {
    let amountA= '1000';
    let amountB= '1000';
    let amountAMin= '900';
    let amountBMin= '900';
    const facory = await router?.addLiquidity(
        tokenAAddress,
        tokenBAddress,
        amountA,
        amountB,
        amountAMin,
        amountBMin,
        privateAccount
    );

    
    console.log('facory', facory);
    router?.on("Increment", async (
        pair,
        token0,
        token1,
        token0Amount,
        token1Amount,
        token0AmountMin,
        token1AmountMin,
        a,
        b
    ) => {
        console.log('---event',
        pair,
        token0,
        token1,
        token0Amount,
        token1Amount,
        token0AmountMin,
        token1AmountMin,
        a,
        b
        )
    });
}
// 主流程
async function main(type: string) {
    try {
        console.log('-type', type)
        if (type === 'queryBalance') {
            console.log('查询合约余额')
            await getBalance();  // 执行合约方法
        } else if (type === 'approve') {
            console.log('授权合约转移代币')
            await onApprove();
        } else if (type === 'allowance') {
            console.log('查询授权金额');
            await onAllowance();
        } else if(type === 'addLiquidity') {
            console.log('添加流动性')
            await addLiquidity();
        } else if(type === 'check') {
            await onCheck();
        } else if(type === 'reset') {
            await onReset();
        } else if(type === 'mint') {
            await onPairMint();
        } else if(type === 'pairBalance') {
            await onQueryPairBalance();
        }
    } catch (error) {
        console.error("❌ 执行失败：", error.message);
    } finally {
        console.log("-------------------------\n");
    }
}

const userArgs = process.argv.slice(2); // 结果：['network=localhost', 'address=0x5FbDB2315678afecb367f032d93F642f64180aa3']
// 解析参数（简单键值对格式）
const params: Record<string, string> = {};
userArgs.forEach(arg => {
    const [key, value] = arg.split('=');
    if (key && value) params[key] = value;
});

const { type } = params;
main(type);