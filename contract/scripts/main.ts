import fs from "fs";
import { ethers } from "ethers";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const deploymentsDirs = path.join(__dirname, "../ignition/deployments/chain-31337");
const paths = path.join(deploymentsDirs, 'deployed_addresses.json');
const deploymentData = JSON.parse(fs.readFileSync(paths, "utf8"));


// 调用合约函数测试
async function callContractFunctions() {
    const tokenAAddress = deploymentData['DevDexModule#TokenA'];
    const tokenBAddress = deploymentData['DevDexModule#TokenB'];
    const routerAddress = deploymentData['UniswapV2RouterModule#UniswapV2Router'];
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const abiJson = JSON.parse(fs.readFileSync("/Users/lidongdong/web3/web3_simple_demo/contract/ignition/deployments/chain-31337/artifacts/UniswapV2RouterModule#UniswapV2Router.json", "utf8"));
    const routerABI = abiJson.abi;
    // 2. 方法1：通过私钥创建签名者（已知私钥时）
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const privateAccount = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
    const signer = new ethers.Wallet(privateKey, provider);


    let addTokenA= tokenAAddress;
    let addTokenB= tokenBAddress;
    let amountA= '2000';
    let amountB= '2000';
    let amountAMin= '1600';
    let amountBMin= '1600';
    let address= privateAccount;
    let deadline= Math.floor(Date.now() / 1000) + 60 * 100;
    let nonce = 0;
    
    const tokenContractA = new ethers.Contract(tokenAAddress, ['function approve(address, uint) returns (bool)'], signer);
    const txA = await tokenContractA?.approve(routerAddress, BigInt(amountA), { nonce: nonce });
    await txA.wait();
    const tokenContractB = new ethers.Contract(tokenBAddress, ['function approve(address, uint) returns (bool)'], signer);
    const txB = await tokenContractB?.approve(routerAddress, BigInt(amountB), { nonce: nonce + 1 });
    await txB.wait();
    console.log('---授权完成')
    const router = new ethers.Contract(routerAddress, routerABI, signer);
    const tx = await router?.addLiquidity(
        addTokenA,
        addTokenB,
        amountA,
        amountB,
        amountAMin,
        amountBMin,
        address,
        deadline
    );
    await tx.wait();
    console.log('-------tx', tx)
}

// 主流程
async function main() {
    try {
        await callContractFunctions();  // 执行合约方法
    } catch (error) {
        console.error("❌ 执行失败：", error.message);
    } finally {
        console.log("-------------------------\n");
    }
}

main();