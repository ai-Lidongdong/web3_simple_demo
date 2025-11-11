import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import * as envEncConfig from "@chainlink/env-enc";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-ethers";

// export default {
//   plugins: [hardhatEthers],
// };
envEncConfig.config();  // 加载env-enc加密的环境变量，可通过process.env.直接访问解密后的变量值

const  PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const AMOY_URL = process.env.AMOY_URL;
const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  typechain: {
    // 生成的类型文件输出目录（建议放在前端可访问的路径，如 src/typechain-types）
    outDir: "../web/app/typechain-types",
    // 目标库（ethers-v5 或 ethers-v6 或 viem）
    target: "ethers-v6",
    // 可选：是否为每个合约生成单独的文件（默认 true）
    // alwaysGenerateOverloads: false, // 不生成重载方法的重复类型
    // 可选：自定义合约类型名称前缀（默认无）
    // namePrefix: "I",
  },
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    sepolia: {
      type: "http",
      chainType: "l1",
      url: SEPOLIA_URL!,
      accounts: [PRIVATE_KEY!],

    },
    amoy: {
      type: "http",
      chainType: "l1",
      url: AMOY_URL!,
      accounts: [PRIVATE_KEY!],
    }
  },
};

export default config;
