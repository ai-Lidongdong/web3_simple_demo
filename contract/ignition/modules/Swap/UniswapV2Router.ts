import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("UniswapV2RouterModule", (m) => {
  const uniswapV2Router = m.contract("UniswapV2Router", ['0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9']);
  return { uniswapV2Router };
});