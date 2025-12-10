import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

// 清理 Ignition 旧部署记录（确保每次都是全新部署）
function cleanOldDeployments() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const deploymentsDir = path.join(__dirname, "../ignition/deployments/chain-31337");
  if (fs.existsSync(deploymentsDir)) {
    fs.rmSync(deploymentsDir, { recursive: true, force: true });
    console.log("✅ 已清理旧部署记录");
  }
}

// 使用 Ignition 部署合约并返回合约地址
function deployWithIgnition() {
  console.log("🚀 开始部署合约...");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  execSync(
    `npx hardhat ignition deploy ignition/modules/Swap/DevDex.ts --network localhost`,
    { stdio: "inherit" } // 直接输出部署过程，方便观察
  );

  // Ignition 部署记录目录（localhost 的链 ID 是 31337）
  const deploymentsDir = path.join(__dirname, "../ignition/deployments/chain-31337/artifacts");
  if (!fs.existsSync(deploymentsDir)) {
    throw new Error("未找到部署记录目录");
  }

  // 找到最新的部署记录文件（文件名格式：deployment-<timestamp>.json）
  const deploymentFiles = fs.readdirSync(deploymentsDir)
    .filter(file => file.startsWith("DevDexModule") && file.endsWith(".json"))
    .sort((a, b) => b.localeCompare(a)); // 按时间倒序，取最新的
    console.log('---deploymentFiles', deploymentFiles)
  if (deploymentFiles.length === 0) {
    throw new Error("未找到部署记录文件");
  }

  const deploymentsDirs = path.join(__dirname, "../ignition/deployments/chain-31337");
  const lab = path.join(deploymentsDirs, 'deployed_addresses.json');
  const deploymentData = JSON.parse(fs.readFileSync(lab, "utf8"));
  return deploymentData;
}

// 主流程
async function main() {
  try {
    cleanOldDeployments();  // 清除部署记录
    const tokenAddress = deployWithIgnition();  //重新部署、获取合约地址
  } catch (error) {
    console.error("❌ 执行失败：", error.message);
  } finally {
    console.log("-------------------------\n");
  }
}

main();