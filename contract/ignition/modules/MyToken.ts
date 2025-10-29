import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyTokenModule", (m) => {
    const account1 = m.getAccount(0);
  // TODO: Set addresses for the contract arguments below
  const myToken = m.contract("MyToken", [account1, 'MyToken', 'LDS', 1000]);
  return { myToken };
});
