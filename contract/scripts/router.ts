import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";


// 使用 Ignition 部署合约并返回合约地址
function deployWithIgnition() {
  console.log("🚀 开始部署合约...");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  execSync(
    `npx hardhat ignition deploy ignition/modules/Swap/UniswapV2Router.ts --network localhost`,
    { stdio: "inherit" } // 直接输出部署过程，方便观察
  );

  // Ignition 部署记录目录（localhost 的链 ID 是 31337）
  const deploymentsDir = path.join(__dirname, "../ignition/deployments/chain-31337/artifacts");
  if (!fs.existsSync(deploymentsDir)) {
    throw new Error("未找到部署记录目录");
  }


  const deploymentsDirs = path.join(__dirname, "../ignition/deployments/chain-31337");
  const lab = path.join(deploymentsDirs, 'deployed_addresses.json');
  const deploymentData = JSON.parse(fs.readFileSync(lab, "utf8"));
  return deploymentData['UniswapV2RouterModule#UniswapV2Router']
}

// 调用合约函数测试
// async function callContractFunctions(tokenAddress) {
//   const provider = new ethers.JsonRpcProvider("http://localhost:8545");
//   console.log("📞 开始调用合约函数...", tokenAddress);
//   const abiJson = JSON.parse(fs.readFileSync("/Users/lidongdong/web3/web3_simple_demo/contract/ignition/deployments/chain-31337/artifacts/UniswapV2RouterModule#UniswapV2Router.json", "utf8"));
//   const routerABI = abiJson.abi;
//   // 2. 方法1：通过私钥创建签名者（已知私钥时）
//   const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
//   const signer = new ethers.Wallet(privateKey, provider);
// }

// 主流程
async function main() {
  try {
    const tokenAddress = deployWithIgnition();  //部署、获取合约地址
    // await callContractFunctions(tokenAddress);  // 执行合约方法
  } catch (error) {
    console.error("❌ 执行失败：", error.message);
  } finally {
    console.log("-------------------------\n");
  }
}

main();