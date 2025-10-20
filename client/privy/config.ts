
export const privyConfig = {
            // 配置支持的登录方式（按需选择）
            loginMethods: ['wallet', 'embedded'],
            // 登录成功后默认重定向路径
            defaultRedirectUri: '/',
            // 自定义钱包连接选项（可选）
            wallet: {
              connectModal: {
                featuredWallets: ['metamask', 'coinbase', 'walletConnect'], // 优先显示的钱包
              },
              // 支持的链（如 Ethereum、Polygon 等）
              chains: ['eip155:1', 'eip155:5', 'eip155:137', 'eip155:11155111', 'eip155:80002'], // 1=以太坊主网，5=Goerli 测试网
            },
            // 自定义 UI 样式（可选）
            appearance: {
              theme: 'light', // 或 'dark'
              accentColor: '#6366f1', // 主题色
            },
};
