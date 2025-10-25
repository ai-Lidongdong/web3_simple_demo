import { expect } from "chai";
import { network } from "hardhat";
import "hardhat";
import assert from "node:assert/strict";
const { ethers, ignition } = await network.connect();
import MyNFTModule from '../ignition/modules/MyNFT.js'

let myNFT: any;
let mintInAddress: any;

describe("MyNFT",  () => {
  before(async()=>{
    const [firstAccount] = await ethers.getSigners();
    mintInAddress = firstAccount.address;
    myNFT = await ethers.deployContract("MyNFT", [mintInAddress]);
  })
  it("test if you mint a nft successful", async function () {
    const mintUri = 'ipfs://bafkreic3nkf7aizks7niaar2kypninxsmx4rgl4xlrpzd4kfv7t3cljwmu';
    await myNFT.safeMintToAddress(mintInAddress, mintUri);
    const owner = await myNFT.ownerOf(0);
    expect(owner).to.equal(mintInAddress);
  });
  it("use other method test if you mint a nft successful", async function () {
    const { myToken } = await ignition.deploy(MyNFTModule);
    const [name, symbol, supply] = await Promise.all([
      myToken.name(),
      myToken.symbol(),
      myToken.totalSupply(),
    ]);

    assert.equal(name, "MyNFT");
    assert.equal(symbol, "NT");
    assert.equal(supply, 0n);
  });
});
