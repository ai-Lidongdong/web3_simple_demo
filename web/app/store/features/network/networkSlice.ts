// src/store/features/network/networkSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/app/store';

// 网络状态类型
export interface NetworkState {
  chainId: number | string; // 当前链 ID（如 5 对应 Goerli）
  CONTRACTS_ADDRESSE: {
    NFT_CONTRACT_ADDRESS: string,
    COIN_CONTRACT_ADDRESS: string,
    MARKET_CONTRACT_ADDRESS: string
  };
  isLoading: boolean; // 网络状态是否正在加载
  error: string | null; // 网络错误信息（如切换链失败）
}

// 初始状态
const initialState: NetworkState = {
  chainId: '',
  CONTRACTS_ADDRESSE: {
    NFT_CONTRACT_ADDRESS: '',
    COIN_CONTRACT_ADDRESS: '',
    MARKET_CONTRACT_ADDRESS: ''
  },
  isLoading: true,
  error: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    // 更新链 ID
    setChainId: (state, action: PayloadAction<number | string>) => {
      state.chainId = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    // 更新链 ID
    setContractAddress: (state, action: PayloadAction<any | null>) => {
      state.CONTRACTS_ADDRESSE = action.payload;
    },
    // 更新加载状态
    setNetworkLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // 记录网络错误
    setNetworkError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    // 重置网络状态
    resetNetwork: (state) => {
      state.chainId = '';
      state.isLoading = false;
      state.error = null;
    },
  },
});
export const selectIsNetworkReady = (state: RootState) => {
  return !state.network.isLoading && state.network.chainId !== null && !state.network.error;
};
export const { setChainId, setContractAddress, setNetworkLoading, setNetworkError, resetNetwork } = networkSlice.actions;
export default networkSlice.reducer;