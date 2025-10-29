// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    event Mint(uint256 indexed amount); 
    event Burn(uint256 indexed amount);
    constructor(
        address initialOwner,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialTokenSupply // 初始化合约，给合约owner直接分发的代币数量
    ) ERC20(tokenName, tokenSymbol) Ownable(initialOwner) {
        _mint(initialOwner, initialTokenSupply * 10 ** decimals());
    }

    /**
     * 功能 2：增发 ERC-20 代币（仅管理员可用）
     * to：需要被分发代币的钱包地址
     * _amount：分发的代表数量
     */
    function mintToken(address to, uint256 _amount) external onlyOwner {
        _mint(to, _amount * 10 ** decimals()); // 考虑小数位数
        emit Mint(_amount);
    }

    /*
     * 功能 2：燃烧 ERC-20 代币（仅管理员可用）
     * to：需要被燃烧代币的钱包地址
     * _amount：燃烧的代表数量
    */

    function burnToken(address to, uint256 _amount) external onlyOwner {
        _burn(to, _amount * 10 ** decimals());
        emit Burn(_amount);
    }
}
