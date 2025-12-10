import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("UniswapV2PairModule", (m) => {
    // const account1 = m.getAccount(0);
  // TODO: Set addresses for the contract arguments below
  const uniswapV2Pair = m.contract("UniswapV2Pair", []);
  return { uniswapV2Pair };
});
// npx hardhat ignition deploy ignition/modules/Swap/UniswapV2Pair.ts --network sepolia