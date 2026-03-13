import { sep } from "path";

const IPFS_GATEWAY = 'https://tan-capable-tiger-275.mypinata.cloud/ipfs/'; // pinata ipfs 地址

const RPC_URL = 'https://sepolia.infura.io/v3/fa962aafbec041adb087971619a3d26d';
const BACKEND_DEMAIN = 'http://localhost:4000'  // 请求backend 项目域名

const CONTRACTS_ADDRESSE: any = {
    0xaa36a7: { // 'Sepolia Testnet（以太坊测试网）',
        NFT_CONTRACT_ADDRESS: '0x85bDe626feCEA85d3F9de0A7c124fF09ddc8324f', //nft合约地址
        COIN_CONTRACT_ADDRESS: '0xb1591B2Cb244B30478afb093dd691567208bC356', //代币合约地址
        MARKET_CONTRACT_ADDRESS: '0x95D3c809924cD8AfEb281C1916d156bff9498804', //交易平台地址

        FACTORY_CONTRACT_ADDRESS: '0x1b82cB7a3B560480d50FAc679C2E3019dB44EBe7', // DEX Factory 地址
        ROUTER_CONTRACT_ADDRESS: '0xB0EE237f2758ab2dA3f26A9C7bd8033eDA580547', // DEX Router 地址
        PAIR_CONTRACT_ADDRESS: '0x99Afb9D450889095B74bA0869D2A2a4aEa214a19', //DEX  Pair 地址
        TOKENA_CONTRACT_ADDRESS: '0xdde3Ac2E8eC5599e02F85e59721fF2a1e5Fe8c9B', //DEX  TokenA 地址
        TOKENB_CONTRACT_ADDRESS: '0x30847a25e5079200E6618797eC2d9A1d295b1ac0', //DEX  TokenB 地址
        TOKENC_CONTRACT_ADDRESS: '0xd67F27c8F7707a7b005280d0ef4e3C8AD1Fe3D0c', //DEX  TokenC 地址
    },
    0x13882: { // 'Amoy Testnet（Amoy测试网）',
        NFT_CONTRACT_ADDRESS: '0xf49c6E1328A2893922f76b66De29C306fF4e3981',
        COIN_CONTRACT_ADDRESS: '0x9519FC0D44003Be8277F60B7b56511Fa4fDacE6D',
        MARKET_CONTRACT_ADDRESS: '0xA205986041e1f6BcD9461D21d52E2aa4A2eD5B0C',

        TOKENA_CONTRACT_ADDRESS: '0x61BB8F17Ea594697fB151428f99Eb0b40dEf9bA2', //DEX  TokenA 地址
        TOKENB_CONTRACT_ADDRESS: '0xB1f3124007061EE149c1c0c4D9cDacb0D4A031b9', //DEX  TokenB 地址
        TOKENC_CONTRACT_ADDRESS: '0x314A107EAf025B70B941D8338e267011584F8b4c', //DEX  TokenC 地址

        FACTORY_CONTRACT_ADDRESS: '0xdd23162437A321A6e7b96392E4DbD5e079f81424',
        ROUTER_CONTRACT_ADDRESS: '0x2f88C13836e93451C5fbEF5D5D9Eb9aF2654b67c', // DEX Router 地址
        PAIR_CONTRACT_ADDRESS: '0x47Ee406ceE13aC5815aBA3dB095143E6671Cf6c5', //DEX  Pair 地址
    },
    31337: { // 'localhost（本地网）',
        NFT_CONTRACT_ADDRESS: '0xf49c6E1328A2893922f76b66De29C306fF4e3981',
        COIN_CONTRACT_ADDRESS: '0x9519FC0D44003Be8277F60B7b56511Fa4fDacE6D',
        MARKET_CONTRACT_ADDRESS: '0xA205986041e1f6BcD9461D21d52E2aa4A2eD5B0C',

        TOKENA_CONTRACT_ADDRESS: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788', //DEX  TokenA 地址
        TOKENB_CONTRACT_ADDRESS: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e', //DEX  TokenB 地址
        TOKENC_CONTRACT_ADDRESS: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0', //DEX  TokenC 地址

        FACTORY_CONTRACT_ADDRESS: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
        PAIR_CONTRACT_ADDRESS: '0x9A676e781A523b5d0C0e43731313A708CB607508', //DEX  Pair 地址
        ROUTER_CONTRACT_ADDRESS: '0x0B306BF915C4d645ff596e518fAf3F9669b97016', // DEX Router 地址
    }
}

const pairABI = [
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address) public view returns (uint256)",
    "function approve(address, uint256) public virtual returns (bool)"
];

    // function approve(address spender, uint256 value) public virtual returns (bool) {
    //     address owner = _msgSender();
    //     _approve(owner, spender, value);
    //     return true;
    // }
export {
    IPFS_GATEWAY,
    RPC_URL,
    BACKEND_DEMAIN,
    CONTRACTS_ADDRESSE,
    pairABI
}