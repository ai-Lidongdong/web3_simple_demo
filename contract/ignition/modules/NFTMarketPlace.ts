import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("NFTMarketPlaceModule", (m) => {
  // TODO: Set addresses for the contract arguments below
  const NFTMarketPlace = m.contract("NFTMarketPlace");
  return { NFTMarketPlace };
});
