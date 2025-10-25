declare global {
  // 声明自定义全局常量（示例：APP_NAME 和 CHAIN_ID）
  const APP_NAME: string;
  const CHAIN_ID: number;

  // 若需要扩展其他全局变量（如 hre），也可在此声明
  namespace NodeJS {
    interface Global {
      // 例如：扩展全局 hre 类型（Hardhat 环境）
      hre: import("hardhat/types").HardhatRuntimeEnvironment;
    }
  }
}

// 确保文件被视为模块（避免 TypeScript 报错）
export {};