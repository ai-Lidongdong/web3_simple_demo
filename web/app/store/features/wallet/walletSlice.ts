// src/store/features/wallet/walletSlice.ts（修正版）
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 只存储可序列化的信息（地址、连接状态）
interface WalletState {
  address: string; // 可序列化（字符串）
  isConnected: boolean; // 可序列化（布尔值）
  // 移除 signer 字段（不可序列化）
}

const initialState: WalletState = {
  address: '',
  isConnected: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletInfo: (
      state,
      action: PayloadAction<{
        address: string;
        isConnected: boolean;
      }>
    ) => {
      state.address = action.payload.address;
      state.isConnected = action.payload.isConnected;
      // 不再存储 signer
    },
    resetWallet: (state) => {
      state.address = '';
      state.isConnected = false;
    },
  },
});

export const { setWalletInfo, resetWallet } = walletSlice.actions;
export default walletSlice.reducer;