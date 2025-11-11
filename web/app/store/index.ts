// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import networkReducer from './features/network/networkSlice'; // 网络状态（chainId）
import walletReducer from './features/wallet/walletSlice'; // 钱包状态（signer）

// 配置 Store：传入各 Slice 的 Reducer
export const makeStore = () => {
  return configureStore({
    reducer: {
      wallet: walletReducer,
      network: networkReducer,
    // 后续添加其他 Slice：user: userReducer, 等
  },}); 
}

// 导出 Store 的类型（用于 TypeScript 类型提示）
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];