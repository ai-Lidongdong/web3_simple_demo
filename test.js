const a = '222';
const b = '222'

const abb = {
    id: 1,
    user: {
        id: 1,
        name: 'a'
    } 
}
const acc = {
    users: {
        1: { id: 1, name: 'a' }
    },
    posts: { 
        1: { id: 1, userId: 1 }
    }
}
let abd = 20
// let obj1 = {
//   "DevDexModule#TokenA": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
//   "DevDexModule#TokenB": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
//   "DevDexModule#TokenC": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
//   "DevDexModule#UniswapV2Factory": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
//   "DevDexModule#UniswapV2Pair": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
// }
// let list = Object.keys(obj1);

// console.log('--list', list)

// require(block.timestamp <= deadline, "Expired");
        // // 1. 基础参数校验（新增）
        // require(tokenA != address(0), "Invalid tokenA");
        // require(tokenB != address(0), "Invalid tokenB");
        // require(tokenA != tokenB, "Same token"); // 避免相同代币创建交易对
        // require(to != address(0), "Invalid to");
        // require(amountADesired > 0 && amountBDesired > 0, "Zero amount");
        // require(amountAMin <= amountADesired, "Min A > desired A");
        // require(amountBMin <= amountBDesired, "Min B > desired B");
        // require(factory != address(0), "Invalid factory"); // 校验工厂地址

        // // 2. 校验 factory 是有效合约（新增）
        // require(factory.code.length > 0, "Factory not a contract");

        // // 检查交易对，不存在则创建
        // address pair = IUniswapV2Factory(factory).getPair(tokenA, tokenB);
        // if (pair == address(0)) {
        //     pair = IUniswapV2Factory(factory).createPair(tokenA, tokenB);
        // }
        // (address token0, ) = sortTokens(tokenA, tokenB);
        // (uint112 reserve0, uint112 reserve1, ) = IUniswapV2Pair(pair).getReserves();

        // // 计算最优输入数量（确保比例与池内一致）
        // if (reserve0 == 0 && reserve1 == 0) {
        //     // 首次添加：直接使用用户输入的数量
        //     (amountA, amountB) = (amountADesired, amountBDesired);
        // } else {
        //     // 非首次：按池内比例计算所需数量
        //     uint256 amountBOptimal = quote(amountADesired, reserve0, reserve1);
        //     if (amountBOptimal <= amountBDesired) {
        //         require(amountBOptimal >= amountBMin, "Insufficient B");
        //         (amountA, amountB) = (amountADesired, amountBOptimal);
        //     } else {
        //         uint256 amountAOptimal = quote(amountBDesired, reserve1, reserve0);
        //         assert(amountAOptimal <= amountADesired);
        //         require(amountAOptimal >= amountAMin, "Insufficient A");
        //         (amountA, amountB) = (amountAOptimal, amountBDesired);
        //     }
        // }

        // // 转移代币到Pair合约
        // IERC20(tokenA).safeTransferFrom(msg.sender, pair, amountA);
        // IERC20(tokenB).safeTransferFrom(msg.sender, pair, amountB);
        // // 发行LP代币
        // liquidity = IUniswapV2Pair(pair).mint(to);


// token0 数量 = (yourLPSupply / totalSupply) × reserve0
let ab1 = 2;
let ab2 = 5
ab2 -= 2
// console.log('---s', 14142135623730951488 - 14142135623730950488)

// min(amount0 * _totalSupply / _reserve0, amount1 * _totalSupply / _reserve1)
// min(1000 * 6000 / 4000, 1000 * 6000 / 4000)
console.log(0x5FbDB2315678afecb367f032d93F642f64180aa3 < 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)