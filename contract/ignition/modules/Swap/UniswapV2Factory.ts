import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("UniswapV2FactoryModule", (m) => {
    // const account1 = m.getAccount(0);
  // TODO: Set addresses for the contract arguments below
  const uniswapV2Factory = m.contract("UniswapV2Factory", []);
  return { uniswapV2Factory };
});
// npx hardhat ignition deploy ignition/modules/Swap/UniswapV2Factory.ts --network sepolia