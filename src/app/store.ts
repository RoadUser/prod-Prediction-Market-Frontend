import { configureStore } from '@reduxjs/toolkit';
import snackbarReducer from '@/features/snackbar/snackbarSlice';
import authReducer from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    snackbar: snackbarReducer,
    auth: authReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
