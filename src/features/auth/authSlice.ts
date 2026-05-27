import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IdentityState {
  publicKeyHex: string | null;
  connected: boolean;
}

const initialState: IdentityState = {
  publicKeyHex: null,
  connected: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIdentity: (state, action: PayloadAction<{ publicKeyHex: string }>) => {
      state.publicKeyHex = action.payload.publicKeyHex;
      state.connected = true;
    },
    clearIdentity: (state) => {
      state.publicKeyHex = null;
      state.connected = false;
    }
  }
});

export const { setIdentity, clearIdentity } = authSlice.actions;
export default authSlice.reducer;
