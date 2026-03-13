import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("UniswapV2RouterModule", (m) => {
  const uniswapV2Router = m.contract("UniswapV2Router", ['0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82']);
  return { uniswapV2Router };
});