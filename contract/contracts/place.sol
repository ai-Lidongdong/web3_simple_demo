// contracts/NFTMarketplace.sol
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarketplace is ReentrancyGuard {
    // 交易对：NFT 合约 + 支付代币合约
    struct Order {
        address seller; // 卖家地址
        address nftContract;    // nft合约地址
        uint256 tokenId;    // 售卖的 nft tokenId
        address paymentToken; // 此处指定为 MyToken 合约地址
        uint256 price;  // 售卖价格
        bool isActive;  // 订单是否有效
        bool isEscrowed;        // NFT 是否托管在平台
    }
    // 订单 ID → 订单信息
    mapping(uint256 => Order) public orders;
    // 自增订单 ID
    uint256 public nextOrderId;

    event OrderCreated(uint256 orderId, address seller, uint256 tokenId, uint256 price);
    event OrderExecuted(uint256 orderId, address buyer);

    // 创建订单（用 MyToken 作为支付代币）
    function createOrder(
        address nftContract,
        uint256 tokenId,
        address paymentToken, // 传入 MyToken 合约地址
        uint256 price
    ) external {
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "不是 NFT 所有者");
        require(nft.isApprovedForAll(msg.sender, address(this)), "未授权平台");

        orders[nextOrderId] = Order({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            paymentToken: paymentToken,
            price: price,
            isActive: true
        });

        emit OrderCreated(nextOrderId, msg.sender, tokenId, price);
        nextOrderId++;
    }

    // 购买 NFT（用 MyToken 支付）
    function buyNFT(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.isActive, "订单无效");
        require(msg.sender != order.seller, "不能购买自己的 NFT");

        IERC20 paymentToken = IERC20(order.paymentToken);
        IERC721 nft = IERC721(order.nftContract);

        // 检查买家是否有足够的代币并授权
        require(paymentToken.balanceOf(msg.sender) >= order.price, "代币不足");
        require(paymentToken.allowance(msg.sender, address(this)) >= order.price, "未授权代币");

        // 1. 代币从买家转移给卖家
        paymentToken.transferFrom(msg.sender, order.seller, order.price);

        // 2. NFT 从卖家转移给买家
        nft.transferFrom(order.seller, msg.sender, order.tokenId);

        // 3. 标记订单无效
        order.isActive = false;
        emit OrderExecuted(orderId, msg.sender);
    }
}