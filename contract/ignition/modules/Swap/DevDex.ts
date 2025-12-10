import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DevDexModule", (m) => {
  // TODO: Set addresses for the contract arguments below
  const account1 = m.getAccount(0);
  const tokenA = m.contract("TokenA", [account1, 1000]);
  const tokenB = m.contract("TokenB", [account1, 1000]);
  const tokenC = m.contract("TokenC", [account1, 1000]);
  const uniswapV2Pair = m.contract("UniswapV2Pair", []);
  const uniswapV2Factory = m.contract("UniswapV2Factory", []);

  return { tokenA, tokenB, tokenC, uniswapV2Pair, uniswapV2Factory };
});
