// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./Interfaces.sol";
import "./UniswapV2Pair.sol";

contract UniswapV2Factory is IUniswapV2Factory {
    // 存储已创建的交易对（tokenA => tokenB => pair地址）
    mapping(address => mapping(address => address)) public override getPair;
    // 所有交易对列表
    address[] public allPairs;

    // 创建交易对时触发（记录交易对信息）
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    // 核心函数：创建交易对（确保tokenA < tokenB以避免重复）
    function createPair(address tokenA, address tokenB) external override returns (address pair) {
        require(tokenA != tokenB, "UniswapV2: IDENTICAL_ADDRESSES");
        // 按地址排序，确保(token0, token1)唯一
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "UniswapV2: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "UniswapV2: PAIR_EXISTS");

        // 部署新的Pair合约
        bytes memory bytecode = type(UniswapV2Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        // 初始化Pair合约（设置代币地址）
        UniswapV2Pair(pair).initialize(token0, token1);
        // 记录交易对
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    // 获取所有交易对数量
    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }
}