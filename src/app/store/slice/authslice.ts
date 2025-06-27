import { createSlice, PayloadAction } from '@reduxjs/toolkit';


export type User = {
  id?: number;
  userId?: number;
  buyerId?: number;
  vendorId?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'buyer' | 'vendor';
  phone?: string;
};

interface IAuthState {
  isAuthenticated: boolean;
  user: User | null;
}

const initialState: IAuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;