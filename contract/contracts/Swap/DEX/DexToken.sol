// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// 代币A：仅基础功能，可直接铸造
contract TokenA is ERC20, Ownable {
    event Mint(uint256 indexed amount);
    event Burn(uint256 indexed amount);

    constructor(
        address initialOwner,
        uint256 initialTokenSupply
    ) ERC20("TokenA", "TA") Ownable(initialOwner) {
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

// 代币B：同上
contract TokenB is ERC20, Ownable {
    event Mint(uint256 indexed amount);
    event Burn(uint256 indexed amount);

    constructor(
        address initialOwner,
        uint256 initialTokenSupply
    ) ERC20("TokenB", "TB") Ownable(initialOwner) {
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

// 代币C：同上
contract TokenC is ERC20, Ownable {
    event Mint(uint256 indexed amount);
    event Burn(uint256 indexed amount);

    constructor(
        address initialOwner,
        uint256 initialTokenSupply
    ) ERC20("TokenC", "TC") Ownable(initialOwner) {
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
