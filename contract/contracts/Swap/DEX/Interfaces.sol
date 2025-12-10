// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2Factory {
    // 创建交易对，返回Pair合约地址（确保代币对唯一）
    function createPair(address tokenA, address tokenB) external returns (address pair);
    // 获取代币对对应的Pair地址
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}
interface IUniswapV2Pair is IERC20 {
    // 获取当前储备量（token0, token1, 最后更新时间）
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    // 获取代币地址（0和1按排序确定）
    function token0() external view returns (address);
    function token1() external view returns (address);
    // 兑换函数（输入代币，输出到指定地址）
    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external;
    // 添加流动性（发行LP代币）
    function mint(address to) external returns (uint256 liquidity, uint step);
    // 移除流动性（销毁LP代币）
    function burn(address to) external returns (uint256 amount0, uint256 amount1);
    
}

interface IUniswapV2Router {
    // 添加流动性
    // function addLiquidity(
    //     address tokenA,
    //     address tokenB,
    //     uint256 amountADesired,
    //     uint256 amountBDesired,
    //     uint256 amountAMin,
    //     uint256 amountBMin,
    //     address to,
    //     uint256 deadline
    // ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);

    // 移除流动性
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);

    // 精确输入兑换（用tokenA兑换tokenB）
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}