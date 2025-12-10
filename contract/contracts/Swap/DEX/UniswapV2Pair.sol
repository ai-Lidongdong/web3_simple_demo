// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // 防重入攻击
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Interfaces.sol";

contract UniswapV2Pair is ERC20, ReentrancyGuard, IUniswapV2Pair {
    address public override token0;
    address public override token1;
    mapping(address account => uint256) private _balances;
    uint256 private _totalSupply;

    uint112 private reserve0; // 储备量（token0）
    uint112 private reserve1; // 储备量（token1）
    uint32 private blockTimestampLast; // 最后更新时间（防闪电贷攻击）

    // 确保代币转移成功
    using SafeERC20 for IERC20;

    // 初始化：设置代币对
    constructor() ERC20("Uniswap V2 LP", "UNI-V2") {
        (token0, token1) = (address(0), address(0)); // 临时占位，实际在initialize中设置
    }

    function initialize(address _token0, address _token1) external {
        require(token0 == address(0) && token1 == address(0), "Already initialized");
        token0 = _token0;
        token1 = _token1;
    }

    /// @inheritdoc IERC20
    function totalSupply() public view virtual override(ERC20, IERC20) returns (uint256) {
        return _totalSupply;
    }

    /// @inheritdoc IERC20
    function balanceOf(address account) public view virtual override(ERC20, IERC20) returns (uint256) {
        return _balances[account];
    }
    // 更新储备量（核心安全逻辑：防止闪电贷操纵价格）
    function update(uint balance0, uint balance1) private returns (uint step){
        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, "Overflow");
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        // 确保至少1分钟更新一次（防高频操纵）
        require(blockTimestamp > blockTimestampLast || blockTimestampLast == 0, "Invalid timestamp");
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        blockTimestampLast = blockTimestamp;
        step = reserve0;
    }

    function _update(address from, address to, uint256 value) internal virtual override {
        if (from == address(0)) {
            // Overflow check required: The rest of the code assumes that totalSupply never overflows
            _totalSupply += value;
        } else {
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) {
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            unchecked {
                // Overflow not possible: value <= fromBalance <= totalSupply.
                _balances[from] = fromBalance - value;
            }
        }

        unchecked {
            // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
            _balances[to] += value;
        }

    }

    // 获取储备量（外部调用）
    function getReserves() public view override returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }

    // 重写 _mint 方法，覆盖父类的零地址校验
    function mint(address to) public override returns (uint256 liquidity, uint step) {
        step = 1;
        (uint112 _reserve0, uint112 _reserve1, ) = getReserves();
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));
        // 1. 计算实际存入金额，防止下溢
        uint amount0 = balance0 - _reserve0; // 900 - 0
        uint amount1 = balance1 - _reserve1;
        step = 2;
        require(balance0 >= _reserve0 && balance1 >= _reserve1, "Insufficient balance");
        require(amount0 > 0 || amount1 > 0, "Zero amount added");
        // 2. 校验接收地址
        require(to != address(0), "Invalid to address");
        // 3. 计算LP代币数量
        if (_totalSupply == 0) {
        step = 3;
            liquidity = sqrt(amount0 * amount1); // 100
            // _mint(address(0), 1000); // 锁定初始LP
            _update(address(0), address(0), (1000 * 10 ** decimals()));
        } else {
        step = 4;
            require(_reserve0 > 0 && _reserve1 > 0, "Zero reserves");
            liquidity = min(amount0 * _totalSupply / _reserve0, amount1 * _totalSupply / _reserve1);
        }
      // // 4. 校验流动性非零
        step = 5;
        require(liquidity > 0, "Insufficient liquidity");
        // 向to地址，添加liquidity个LP代币
        _update(address(0), to, liquidity);

        step = 6;
        // // 5. 更新储备
        step = update(balance0, balance1);
    }

    // 移除流动性（销毁LP代币，返回代币）
    function burn(address to) external nonReentrant returns (uint amount0, uint amount1) {
        (uint112 _reserve0, uint112 _reserve1, ) = getReserves();
        address _token0 = token0;
        address _token1 = token1;
        uint balance0 = IERC20(_token0).balanceOf(address(this));
        uint balance1 = IERC20(_token1).balanceOf(address(this));
        uint liquidity = balanceOf(address(this)); // 待销毁的LP数量

        // 计算返回的代币数量（按LP占比）
        amount0 = liquidity * balance0 / _totalSupply;
        amount1 = liquidity * balance1 / _totalSupply;
        require(amount0 > 0 && amount1 > 0, "Insufficient output amount");

        // 销毁LP代币
        _burn(address(this), liquidity);
        // 转移代币给用户
        IERC20(_token0).safeTransfer(to, amount0);
        IERC20(_token1).safeTransfer(to, amount1);

        // 更新储备
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));
        update(balance0, balance1);
    }

    // 兑换逻辑（核心：恒定乘积公式）
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external nonReentrant {
        require(amount0Out > 0 || amount1Out > 0, "Insufficient output amount");
        (uint112 _reserve0, uint112 _reserve1, ) = getReserves();
        require(amount0Out <= _reserve0 && amount1Out <= _reserve1, "Insufficient reserves");

        // 计算输入代币数量（实际收到的代币 = 新余额 - 原储备）
        uint balance0;
        uint balance1;
        {
            address _token0 = token0;
            address _token1 = token1;
            require(to != _token0 && to != _token1, "Invalid to");
            // 转移输出代币给用户
            if (amount0Out > 0) IERC20(_token0).safeTransfer(to, amount0Out);
            if (amount1Out > 0) IERC20(_token1).safeTransfer(to, amount1Out);
            // 接收输入代币（由Router调用时已转移）
            if (data.length > 0) IUniswapV2Callee(to).uniswapV2Call(msg.sender, amount0Out, amount1Out, data);
            balance0 = IERC20(_token0).balanceOf(address(this));
            balance1 = IERC20(_token1).balanceOf(address(this));
        }

        // 计算实际输入的代币数量（扣除0.3%手续费后）
        uint amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, "Insufficient input amount");

        // 应用0.3%手续费（实际进入池的是997/1000）
        uint balance0Adjusted = balance0 * 1000 - amount0In * 3;
        uint balance1Adjusted = balance1 * 1000 - amount1In * 3;
        // 验证恒定乘积：(x + 0.997*in) * (y - out) = k
        require(
            balance0Adjusted * balance1Adjusted >= uint(_reserve0) * uint(_reserve1) * (1000**2),
            "Invalid K"
        );

        // 更新储备
        update(balance0, balance1);
    }

    // 辅助函数：计算平方根（用于首次LP发行）
    function sqrt(uint y) private pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    // 辅助函数：取最小值
    function min(uint x, uint y) private pure returns (uint) {
        return x < y ? x : y;
    }

}

// 用于闪电贷回调的接口（可选实现）
interface IUniswapV2Callee {
    function uniswapV2Call(address sender, uint amount0, uint amount1, bytes calldata data) external;
}