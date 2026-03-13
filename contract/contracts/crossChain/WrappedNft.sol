// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { SourceNft } from "./SourceNft.sol";

contract WrappedNft is SourceNft {
    constructor(string memory tokenName, string memory tokenSymbol) 
    SourceNft(tokenName, tokenSymbol) {}

    function mintWithSpecificTokenId(address to, uint256 _tokenId) public {
        _safeMint(to, _tokenId);
    }
}