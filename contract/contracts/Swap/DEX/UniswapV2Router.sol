// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // 防重入攻击
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Interfaces.sol";
import "./UniswapV2Factory.sol";

contract UniswapV2Router is IUniswapV2Router, ReentrancyGuard {
    using SafeERC20 for IERC20;
    address public immutable factory; //Factory合约地址
    uint256 public x;

    event Increment(
        address to,
        address pair,
        address token0,
        address token1,
        uint token0Amount,
        uint token1Amount,
        uint token0AmountMin,
        uint token1AmountMin,
        uint amountA,
        uint amountB,
        uint liquidity
    );
    event RemoveEvent(
        uint step,
        address pair,
        uint allowance,
        address spender
    );

    // 优化后：用 struct 封装参数
    constructor(address _factory) {
        factory = _factory;
    }

    // 排序代币（与Factory保持一致）
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "Identical tokens");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }

    // 计算兑换输出数量（含手续费）
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256 amountOut) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient reserves");
        uint256 amountInWithFee = amountIn * 997; // 扣除0.3%手续费
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 1000 + amountInWithFee;
        amountOut = numerator / denominator;
    }

    // 计算添加流动性时所需的另一种代币数量
    // 100 100 200 =>10000000000 * 20000000000 / 10000000000
    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) internal pure returns (uint256 amountB) {
        require(amountA > 0, "Insufficient amount");
        require(reserveA > 0 && reserveB > 0, "Insufficient reserves");
        amountB = (amountA * reserveB) / reserveA;
    }

    // 添加代币
    function addMintCoin(
        address token0, // token0地址
        address token1, // token1地址
        address pair,   // token0和 token1 的交易对地址
        uint amountA,    // 实际要添加的token0代币金额
        uint amountB,    // 实际要添加的token1代币金额
        address to
    ) internal returns (uint256 liquidity) {
        // 当前用户从token0地址向pair地址转 amountA个代币
        IERC20(token0).safeTransferFrom(msg.sender, pair, amountA);
        // 当前用户从token1地址向pair地址转 amountB个代币
        IERC20(token1).safeTransferFrom(msg.sender, pair, amountB);
        liquidity = IUniswapV2Pair(pair).mint(to);
    }

    // 排序代币（与Factory保持一致）
    function handlePairSort(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to
    ) internal pure returns (
        address token0,
        address token1,
        uint token0Amount,
        uint token1Amount,
        uint token0AmountMin,
        uint token1AmountMin
    ) {
        require(tokenA != address(0) && tokenB != address(0) && to != address(0), "ZERO_ADDRESS");
        require(tokenA != tokenB, "this tokens can'ts same!");
        require(amountADesired > 0 && amountBDesired > 0, "Zero amount");
        require(amountAMin <= amountADesired && amountBMin <= amountBDesired, "min amount > desire amount");
        (
        token0,
        token1,
        token0Amount,
        token1Amount,
        token0AmountMin,
        token1AmountMin
        ) = tokenA < tokenB ? (
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        ) : (
            tokenB,
            tokenA,
            amountBDesired,
            amountADesired,
            amountBMin,
            amountAMin
        );
    }
    // 添加流动性
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to
    ) external virtual returns (uint amountA, uint amountB, uint liquidity)  {
        require(factory != address(0), "Invalid factory");
        (
        address token0,
        address token1,
        uint token0Amount,  // 期望添加的token0金额
        uint token1Amount,  // 期望添加的token1金额
        uint token0AmountMin,
        uint token1AmountMin
        ) = handlePairSort(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            to
        );
        address pair = IUniswapV2Factory(factory).getPair(token0, token1);
        if (pair == address(0)) { // 暂无这两个代币的交易对
            // 创建新的交易对
            pair = IUniswapV2Factory(factory).createPair(token0, token1);
        }
        // 获取该交易对的两种代币余额
        (uint112 reserve0, uint112 reserve1, ) = IUniswapV2Pair(pair).getReserves();
        // 计算最优输入数量（确保比例与池内一致）
        if (reserve0 == 0 && reserve1 == 0) {
            // 两种代币都为0，代表首次添加：直接使用用户输入的数量
            (amountA, amountB) = (token0Amount, token1Amount);
        } else {
            // 非首次：按池内比例计算所需数量
            uint256 amountBOptimal = quote(token0Amount, reserve0, reserve1);
            if (amountBOptimal <= token1Amount) { // 如果token1实际要添加数量，小于等于预期添加数量，则正常运行
                require(amountBOptimal >= token1AmountMin, "Insufficient B");
                (amountA, amountB) = (token0Amount, amountBOptimal);
            } else {
                // 如果token1实际要添加数量大于预期数量，无法添加。则根据token1预期金额去计算token0的要添加数量。
                uint256 amountAOptimal = quote(token1Amount, reserve1, reserve0);
                require(amountAOptimal <= token0Amount && amountAOptimal >= token0AmountMin, "Insufficient A");
                (amountA, amountB) = (amountAOptimal, token1Amount);
            }
        }
        liquidity = addMintCoin(
            token0, // token0地址
            token1, // token1地址
            pair,   // token0和 token1 的交易对地址
            amountA,    // 实际要添加的token0代币金额
            amountB,    // 实际要添加的token1代币金额
            to  // 接收LP 代币的地址
        );
        emit Increment(
        to,
        pair,
        token0,
        token1,
        token0Amount,
        token1Amount,
        token0AmountMin,
        token1AmountMin,
        amountA,
        amountB,
        liquidity);
    }

    // 移除流动性
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external nonReentrant override returns (uint256 amountA, uint256 amountB) {
        uint256 amountA = 1;
        uint256 amountB = 2;
        address pair = IUniswapV2Factory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "Pair not exists");
        
        uint allowance = IUniswapV2Pair(pair).allowance(msg.sender, address(this));
        require(allowance >= liquidity, "UniswapV2Router: INSUFFICIENT_ALLOWANCE");

        // // 转移LP代币到Pair合约并销毁

        // IUniswapV2Pair(pair).transferFrom(msg.sender, pair, liquidity);
        address spender = _msgSender();

        // (amountA, amountB) = IUniswapV2Pair(pair).burn(to);

        // // 验证返回数量不低于最小值
        // (address token0, ) = sortTokens(tokenA, tokenB);
        // (amountA, amountB) = tokenA == token0 ? (amountA, amountB) : (amountB, amountA);
        emit RemoveEvent(
            5,
            pair,
            allowance,
            spender
        );
        // require(amountA >= amountAMin, "Insufficient A");
        // require(amountB >= amountBMin, "Insufficient B");
    }

    // 精确输入兑换（path为兑换路径，如[ETH, USDC]）
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external nonReentrant returns (uint256[] memory amounts) {
        require(path.length >= 2, "Invalid path");
        require(block.timestamp <= deadline, "Expired");
        // 计算各步骤兑换数量
        amounts = getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Insufficient output");
        // 转移输入代币到第一个Pair
        IERC20(path[0]).safeTransferFrom(msg.sender, IUniswapV2Factory(factory).getPair(path[0], path[1]), amounts[0]);
        // 执行兑换
        _swap(amounts, path, to);
    }

    // 计算兑换路径上的输出数量
    function getAmountsOut(uint256 amountIn, address[] memory path) public view returns (uint256[] memory amounts) {
        require(path.length >= 2, "Invalid path");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        for (uint256 i = 0; i < path.length - 1; i++) {
            (uint112 reserveIn, uint112 reserveOut, ) = IUniswapV2Pair(IUniswapV2Factory(factory).getPair(path[i], path[i + 1])).getReserves();
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }

    // 执行兑换（内部函数）
    function _swap(uint256[] memory amounts, address[] memory path, address to) internal {
        for (uint256 i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
            // 调用Pair合约的swap函数
            IUniswapV2Pair(IUniswapV2Factory(factory).getPair(input, output)).swap(
                amount0Out,
                amount1Out,
                i == path.length - 2 ? to : IUniswapV2Factory(factory).getPair(output, path[i + 2]),
                ""
            );
        }
    }
}