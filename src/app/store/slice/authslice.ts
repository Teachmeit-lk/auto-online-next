import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = {
  id?: number;
  userId?: number;
  buyerId?: number;
  vendorId?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "buyer" | "vendor";
  phone?: string;
};

interface IAuthState {
  isAuthenticated: boolean;
  user: User | null;
}

const storedUser = typeof window !== "undefined"
  ? sessionStorage.getItem("user")
  : null;

const initialState: IAuthState = {
  isAuthenticated: !!storedUser,
  user: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      sessionStorage.setItem("user", JSON.stringify(action.payload)); // 🔐 persist
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
