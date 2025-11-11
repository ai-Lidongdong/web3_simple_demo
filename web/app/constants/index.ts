import { sep } from "path";

const IPFS_GATEWAY = 'https://tan-capable-tiger-275.mypinata.cloud/ipfs/'; // pinata ipfs 地址

const RPC_URL = 'https://sepolia.infura.io/v3/fa962aafbec041adb087971619a3d26d';
const BACKEND_DEMAIN = 'http://localhost:4000'  // 请求backend 项目域名

const CONTRACTS_ADDRESSE: any = {
    0xaa36a7: { // 'Sepolia Testnet（以太坊测试网）',
        NFT_CONTRACT_ADDRESS: '0x85bDe626feCEA85d3F9de0A7c124fF09ddc8324f', //nft合约地址
        COIN_CONTRACT_ADDRESS: '0xb1591B2Cb244B30478afb093dd691567208bC356', //代币合约地址
        MARKET_CONTRACT_ADDRESS: '0x95D3c809924cD8AfEb281C1916d156bff9498804', //交易平台地址
    },
    0x13882: { // 'Amoy Testnet（Amoy测试网）',
        NFT_CONTRACT_ADDRESS: '0xf49c6E1328A2893922f76b66De29C306fF4e3981',
        COIN_CONTRACT_ADDRESS: '0x9519FC0D44003Be8277F60B7b56511Fa4fDacE6D',
        MARKET_CONTRACT_ADDRESS: '0xA205986041e1f6BcD9461D21d52E2aa4A2eD5B0C'
    }
}

export {
    IPFS_GATEWAY,
    RPC_URL,
    BACKEND_DEMAIN,
    CONTRACTS_ADDRESSE
}