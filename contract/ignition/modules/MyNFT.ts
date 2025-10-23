import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyNFTModule", (m) => {
    const account1 = m.getAccount(0);
  // TODO: Set addresses for the contract arguments below
  const myToken = m.contract("MyNFT", [account1]);
  return { myToken };
});
