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
const chainIds = {
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};
const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  defaultNetwork: "hardhat",
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
