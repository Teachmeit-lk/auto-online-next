import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { User as FirebaseUser } from "firebase/auth";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUserProfile,
  onAuthStateChange,
  UserProfile,
  FirebaseAuthError
} from "@/service/firebaseAuthService";
import { SignupRequest, LoginRequest } from "@/interfaces/requests/authRequests";

export type User = {
  id?: string;
  userId?: string;
  buyerId?: string;
  vendorId?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "buyer" | "vendor";
  phone?: string;
  profileImage?: string;
  whatsApp?: string;
  address?: string;
  city?: string;
  district?: string;
  zipCode?: string;
  NIC?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

interface IAuthState {
  isAuthenticated: boolean;
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: IAuthState = {
  isAuthenticated: false,
  user: null,
  firebaseUser: null,
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks for Firebase operations
export const registerUserAsync = createAsyncThunk(
  "auth/register",
  async (
    { userData, userType }: { userData: SignupRequest; userType: "buyer" | "vendor" },
    { rejectWithValue }
  ) => {
    try {
      const { user: firebaseUser, profile } = await registerUser(userData, userType);
      return { firebaseUser: firebaseUser.toJSON(), profile };
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      return rejectWithValue(firebaseError.message);
    }
  }
);

export const loginUserAsync = createAsyncThunk(
  "auth/login",
  async (
    { credentials, userType }: { credentials: LoginRequest; userType: "buyer" | "vendor" },
    { rejectWithValue }
  ) => {
    try {
      const { user: firebaseUser, profile } = await loginUser(credentials, userType);
      return { firebaseUser: firebaseUser.toJSON(), profile };
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      return rejectWithValue(firebaseError.message);
    }
  }
);

export const logoutUserAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      return rejectWithValue(firebaseError.message);
    }
  }
);

export const refreshUserProfile = createAsyncThunk(
  "auth/refreshProfile",
  async (_, { rejectWithValue }) => {
    try {
      const profile = await getCurrentUserProfile();
      return profile;
    } catch (error) {
      return rejectWithValue("Failed to refresh user profile");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setFirebaseUser(state, action: PayloadAction<FirebaseUser | null>) {
      state.firebaseUser = action.payload;
      if (!action.payload) {
        state.isAuthenticated = false;
        state.user = null;
      }
    },
    setUser(state, action: PayloadAction<UserProfile>) {
      const profile = action.payload;
      state.user = {
        id: profile.id,
        userId: profile.id,
        buyerId: profile.role === "buyer" ? profile.id : undefined,
        vendorId: profile.role === "vendor" ? profile.id : undefined,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        profileImage: profile.profileImage,
        whatsApp: profile.whatsApp,
        address: profile.address,
        city: profile.city,
        district: profile.district,
        zipCode: profile.zipCode,
        NIC: profile.NIC,
        isActive: profile.isActive,
        createdAt: profile.createdAt instanceof Date ? profile.createdAt : new Date(),
        updatedAt: profile.updatedAt instanceof Date ? profile.updatedAt : new Date(),
      };
      state.isAuthenticated = true;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
    },
    logout(state) {
      state.user = null;
      state.firebaseUser = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Register user
    builder
      .addCase(registerUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.firebaseUser = action.payload.firebaseUser as any;
        state.user = {
          id: action.payload.profile.id,
          userId: action.payload.profile.id,
          buyerId: action.payload.profile.role === "buyer" ? action.payload.profile.id : undefined,
          vendorId: action.payload.profile.role === "vendor" ? action.payload.profile.id : undefined,
          firstName: action.payload.profile.firstName,
          lastName: action.payload.profile.lastName,
          email: action.payload.profile.email,
          role: action.payload.profile.role,
          phone: action.payload.profile.phone,
          profileImage: action.payload.profile.profileImage,
          whatsApp: action.payload.profile.whatsApp,
          address: action.payload.profile.address,
          city: action.payload.profile.city,
          district: action.payload.profile.district,
          zipCode: action.payload.profile.zipCode,
          NIC: action.payload.profile.NIC,
          isActive: action.payload.profile.isActive,
          createdAt: action.payload.profile.createdAt instanceof Date ? action.payload.profile.createdAt : new Date(),
          updatedAt: action.payload.profile.updatedAt instanceof Date ? action.payload.profile.updatedAt : new Date(),
        };
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Login user
    builder
      .addCase(loginUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.firebaseUser = action.payload.firebaseUser as any;
        state.user = {
          id: action.payload.profile.id,
          userId: action.payload.profile.id,
          buyerId: action.payload.profile.role === "buyer" ? action.payload.profile.id : undefined,
          vendorId: action.payload.profile.role === "vendor" ? action.payload.profile.id : undefined,
          firstName: action.payload.profile.firstName,
          lastName: action.payload.profile.lastName,
          email: action.payload.profile.email,
          role: action.payload.profile.role,
          phone: action.payload.profile.phone,
          profileImage: action.payload.profile.profileImage,
          whatsApp: action.payload.profile.whatsApp,
          address: action.payload.profile.address,
          city: action.payload.profile.city,
          district: action.payload.profile.district,
          zipCode: action.payload.profile.zipCode,
          NIC: action.payload.profile.NIC,
          isActive: action.payload.profile.isActive,
          createdAt: action.payload.profile.createdAt instanceof Date ? action.payload.profile.createdAt : new Date(),
          updatedAt: action.payload.profile.updatedAt instanceof Date ? action.payload.profile.updatedAt : new Date(),
        };
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout user
    builder
      .addCase(logoutUserAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.firebaseUser = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh user profile
    builder
      .addCase(refreshUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = {
            id: action.payload.id,
            userId: action.payload.id,
            buyerId: action.payload.role === "buyer" ? action.payload.id : undefined,
            vendorId: action.payload.role === "vendor" ? action.payload.id : undefined,
            firstName: action.payload.firstName,
            lastName: action.payload.lastName,
            email: action.payload.email,
            role: action.payload.role,
            phone: action.payload.phone,
            profileImage: action.payload.profileImage,
            whatsApp: action.payload.whatsApp,
            address: action.payload.address,
            city: action.payload.city,
            district: action.payload.district,
            zipCode: action.payload.zipCode,
            NIC: action.payload.NIC,
            isActive: action.payload.isActive,
            createdAt: action.payload.createdAt instanceof Date ? action.payload.createdAt : new Date(),
            updatedAt: action.payload.updatedAt instanceof Date ? action.payload.updatedAt : new Date(),
          };
        }
      })
      .addCase(refreshUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setFirebaseUser, 
  setUser, 
  clearError, 
  setInitialized, 
  logout 
} = authSlice.actions;

export default authSlice.reducer;

// Firebase auth state listener setup
export const initializeFirebaseAuth = () => (dispatch: any) => {
  return onAuthStateChange(async (firebaseUser) => {
    dispatch(setFirebaseUser(firebaseUser));
    
    if (firebaseUser) {
      // Get user profile from Firestore
      try {
        const profile = await getCurrentUserProfile();
        if (profile) {
          dispatch(setUser(profile));
        }
      } catch (error) {
        console.error("Error getting user profile:", error);
      }
    }
    
    dispatch(setInitialized(true));
  });
};
