// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // 防重入攻击

// 平台合约：管理 NFT 交易
contract NFTMarketPlace is ReentrancyGuard {
    // 平台管理员（可收取手续费）
    address public admin;
    // 交易手续费比例（千分比，如 25 表示 2.5%）
    uint256 public platformFee = 25;

    // 订单结构体：记录 NFT 出售信息
    struct Order {
        uint256 orderId; // 订单 ID
        address seller; // 卖家地址
        address nftContract; // NFT 合约地址（支持多集合）
        uint256 tokenId; // NFT 唯一 ID
        uint256 price; // 售价（单位：支付代币的最小单位）
        address paymentToken; // 支付代币地址（address(0) 表示 ETH）
        bool isActive; // 订单是否有效
        bool isEscrowed; // NFT 是否托管在平台
    }

    // 订单 ID → 订单信息
    mapping(uint256 => Order) public orders;
    // 自增订单 ID
    uint256 public nextOrderId;

    // 事件：记录订单生命周期（供链下服务监听）
    event OrderCreated(
        uint256 indexed orderId,
        address indexed seller,
        address nftContract,
        uint256 indexed tokenId,
        uint256 price,
        address paymentToken,
        uint256 timestamp
        bool isActive,
        bool isEscrowed
    );
    event OrderCancelled(
        uint256 indexed orderId,
        uint256 indexed timestamp
    );
    event OrderExecuted(
        uint256 indexed orderId,
        address indexed buyer,
        uint256 timestamp
    );

    // 初始化：设置管理员为部署者
    constructor() {
        admin = msg.sender;
    }

    /**
     * 功能 1：创建出售订单（非托管模式）
     * 说明：NFT 仍在卖家手中，依赖授权让平台后续可转移
     */
    function createOrder(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address paymentToken
    ) external nonReentrant {
        IERC721 nft = IERC721(nftContract);

        // 检查：卖家必须是 NFT 所有者
        require(nft.ownerOf(tokenId) == msg.sender, unicode"不是 NFT 所有者");
        // 检查：平台必须获得 NFT 转移授权（通过 approve 或 setApprovalForAll）
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
                nft.getApproved(tokenId) == address(this),
            unicode"请先授权平台转移 NFT"
        );
        // 检查：价格必须大于 0
        require(price > 0, unicode"价格必须大于 0");

        // 创建订单
        uint256 id = nextOrderId++;
        orders[id] = Order({
            orderId: id,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            paymentToken: paymentToken,
            isActive: true,
            isEscrowed: false
        });
        uint256 timestamp = block.timestamp;
        emit OrderCreated(
            id,
            msg.sender,
            nftContract,
            tokenId,
            price,
            paymentToken,
            timestamp,
            true,
            false
        );
    }

    /**
     * 功能 2：创建出售订单（托管模式）
     * 说明：NFT 转移到平台托管，更安全（避免卖家私自转移）
     */
    function createOrderWithEscrow(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address paymentToken
    ) external nonReentrant {
        IERC721 nft = IERC721(nftContract);

        // 检查：卖家是所有者且已授权
        require(nft.ownerOf(tokenId) == msg.sender, unicode"不是 NFT 所有者");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
                nft.getApproved(tokenId) == address(this),
            unicode"请先授权平台转移 NFT"
        );
        require(price > 0, unicode"价格必须大于 0");

        // 将 NFT 从卖家转移到平台托管
        nft.transferFrom(msg.sender, address(this), tokenId);

        // 创建订单（标记为托管）
        uint256 id = nextOrderId++;
        orders[id] = Order({
            orderId: id,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            paymentToken: paymentToken,
            isActive: true,
            isEscrowed: true
        });

        uint256 timestamp = block.timestamp;
        emit OrderCreated(
            id,
            msg.sender,
            nftContract,
            tokenId,
            price,
            paymentToken,
            timestamp,
            true,
            true
        );
    }

    /**
     * 功能 3：取消订单
     * 说明：仅卖家可取消，若为托管模式需将 NFT 转回卖家
     */
    function cancelOrder(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];

        // 检查：订单存在且有效
        require(order.isActive, unicode"订单无效或已取消");
        // 检查：调用者必须是卖家
        require(order.seller == msg.sender, unicode"无权取消订单");

        // 若 NFT 托管在平台，转回卖家
        if (order.isEscrowed) {
            IERC721(order.nftContract).transferFrom(
                address(this), // 从平台地址转出
                order.seller, // 转到卖家地址
                order.tokenId
            );
        }

        // 标记订单无效
        order.isActive = false;
        uint256 timestamp = block.timestamp;
        emit OrderCancelled(
            _orderId,
            timestamp
        );
    }

    /**
     * 功能 4：执行购买（核心交易逻辑）
     * 说明：买家支付代币，自动获得 NFT，卖家收到付款（扣除手续费）
     */
    function buyNFT(uint256 _orderId) external payable nonReentrant {
        Order storage order = orders[_orderId];

        // 检查：订单有效
        require(order.isActive, unicode"订单无效或已取消");
        // 检查：买家不能是卖家
        require(msg.sender != order.seller, unicode"不能购买自己的 NFT");

        address seller = order.seller;
        address nftContract = order.nftContract;
        uint256 tokenId = order.tokenId;
        uint256 price = order.price;
        address paymentToken = order.paymentToken;

        // 计算手续费和卖家实际收入
        uint256 platformFeeAmount = (price * platformFee) / 1000; // 千分比计算
        uint256 sellerAmount = price - platformFeeAmount;

        // 1. 处理支付（区分 ETH 和 ERC-20 代币）
        if (paymentToken == address(0)) {
            // 支付方式：ETH
            require(msg.value == price, unicode"支付的 ETH 数量不匹配");

            // 向卖家转账（扣除手续费）
            (bool sellerSuccess, ) = seller.call{value: sellerAmount}("");
            require(sellerSuccess, unicode"卖家 ETH 转账失败");

            // 向平台转账手续费
            (bool adminSuccess, ) = admin.call{value: platformFeeAmount}("");
            require(adminSuccess, unicode"平台手续费转账失败");
        } else {
            // 支付方式：ERC-20 代币（如 USDC）
            IERC20 token = IERC20(paymentToken);

            // 从买家扣钱（需提前授权平台）
            require(
                token.allowance(msg.sender, address(this)) >= price,
                unicode"请先授权平台转移代币"
            );
            // 转账给卖家
            require(
                token.transferFrom(msg.sender, seller, sellerAmount),
                unicode"卖家代币转账失败"
            );
            // 转账手续费给平台
            require(
                token.transferFrom(msg.sender, admin, platformFeeAmount),
                unicode"平台手续费转账失败"
            );
        }

        // 2. 转移 NFT 给买家
        IERC721 nft = IERC721(nftContract);
        if (order.isEscrowed) {
            // 从平台托管地址转移
            nft.transferFrom(address(this), msg.sender, tokenId);
        } else {
            // 从卖家地址转移（依赖前期授权）
            nft.transferFrom(seller, msg.sender, tokenId);
        }

        // 3. 标记订单无效
        order.isActive = false;
        uint256 timestamp = block.timestamp;
        emit OrderExecuted(
            _orderId,
            msg.sender,
            timestamp
        );
    }

    // 允许合约接收 ETH（托管或买家支付时需要）
    receive() external payable {}
}
