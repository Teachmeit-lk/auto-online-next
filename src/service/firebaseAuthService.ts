import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { auth, db, getSecondaryAuth } from "@/config/firebase";
import { SignupRequest, LoginRequest } from "@/interfaces/requests/authRequests";
import { User } from "@/app/store/slice/authslice";

// Firestore collections
const USERS_COLLECTION = "users";
const BUYERS_COLLECTION = "buyers";
const VENDORS_COLLECTION = "vendors";

export interface FirebaseAuthError {
  code: string;
  message: string;
}

export interface UserProfile extends User {
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  profileImage?: string;
  whatsApp?: string;
  address?: string;
  city?: string;
  district?: string;
  zipCode?: string;
  NIC?: string;
  conmpanyBR?: string;
  locationLink?: string;
  mainCategories?: string[];
  vehicleBrand?: string[];
  vehicleModel?: string[];
}

// Mobile-as-email domain for buyer auth
const MOBILE_EMAIL_DOMAIN = "yourapp.com";

const stripToDigits = (value: string): string => (value || "").replace(/\D/g, "");

const formatMobileAsEmail = (phone: string): string => {
  // Normalize SL numbers to 94XXXXXXXXX (9 digits after 94)
  let digits = stripToDigits(phone);
  if (digits.startsWith("0") && digits.length === 10) {
    digits = `94${digits.slice(1)}`;
  } else if (digits.startsWith("94") && digits.length === 11) {
    // already in international form
  } else if (digits.length === 9) {
    digits = `94${digits}`;
  } else if (digits.startsWith("+")) {
    digits = digits.slice(1);
  }
  return `${digits}@${MOBILE_EMAIL_DOMAIN}`;
};

// Register new user with email/password
export const registerUser = async (
  userData: SignupRequest,
  userType: "buyer" | "vendor"
): Promise<{ user: FirebaseUser; profile: UserProfile }> => {
  try {
    // Determine auth email: buyers use mobile-as-email, vendors use provided email
    const authEmail = userType === "buyer"
      ? formatMobileAsEmail(userData.phone)
      : userData.email;

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      authEmail,
      userData.password
    );
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`,
    });

    // Create user profile in Firestore (store the user's real email if provided)
    const userProfile: UserProfile = {
      id: user.uid,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      role: userType,
      whatsApp: userData.whatsApp,
      address: userData.address,
      city: userData.city,
      district: userData.district,
      zipCode: userData.zipCode,
      NIC: userData.NIC,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    // Save to main users collection
    await setDoc(doc(db, USERS_COLLECTION, user.uid), userProfile);

    // Save to role-specific collection
    const roleCollection = userType === "buyer" ? BUYERS_COLLECTION : VENDORS_COLLECTION;
    await setDoc(doc(db, roleCollection, user.uid), {
      ...userProfile,
      userId: user.uid,
      [`${userType}Id`]: user.uid,
    });

    return { user, profile: userProfile };
  } catch (error: any) {
    console.error("Firebase registration error:", error);
    throw {
      code: error.code,
      message: getFirebaseErrorMessage(error.code),
    } as FirebaseAuthError;
  }
};

// Admin-only: create a new admin user without altering current session
export const createUserWithRole = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: "admin" | "buyer" | "vendor"
): Promise<{ user: FirebaseUser; profile: UserProfile }> => {
  const secondaryAuth = getSecondaryAuth();
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const user = cred.user;

    await updateProfile(user, { displayName: `${firstName} ${lastName}` });

    const userProfile: UserProfile = {
      id: user.uid,
      firstName,
      lastName,
      email,
      phone: "",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    await setDoc(doc(db, USERS_COLLECTION, user.uid), userProfile);

    if (role === "admin") {
      await setDoc(doc(db, "admins", user.uid), { ...userProfile, adminId: user.uid });
    } else if (role === "buyer") {
      await setDoc(doc(db, BUYERS_COLLECTION, user.uid), { ...userProfile, userId: user.uid, buyerId: user.uid });
    } else if (role === "vendor") {
      await setDoc(doc(db, VENDORS_COLLECTION, user.uid), { ...userProfile, userId: user.uid, vendorId: user.uid });
    }

    return { user, profile: userProfile };
  } catch (error: any) {
    throw {
      code: error.code,
      message: getFirebaseErrorMessage(error.code),
    } as FirebaseAuthError;
  }
};

// Back-compat helper
export const createAdminUser = (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => createUserWithRole(firstName, lastName, email, password, "admin");

// Admin: fetch all users from USERS_COLLECTION
export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    return snap.docs.map((d) => {
      const data = d.data() as any;
      // Ensure id present
      if (!data.id) data.id = d.id;
      return data as UserProfile;
    });
  } catch (error: any) {
    throw {
      code: error.code || "firestore/error",
      message: error.message || "Failed to load users",
    } as FirebaseAuthError;
  }
};

// Login user with email/password
export const loginUser = async (
  credentials: LoginRequest,
  userType: "buyer" | "vendor" | "admin"
): Promise<{ user: FirebaseUser; profile: UserProfile }> => {
  try {
    let userCredential;
    let email: string | null = null;

    if ("email" in credentials) {
      email = credentials.email;
      userCredential = await signInWithEmailAndPassword(auth, email, credentials.password);
    } else {
      // Try multiple mobile-as-email variants for robustness
      const raw = credentials.phone;
      const variants = new Set<string>();
      const digits = stripToDigits(raw);
      variants.add(formatMobileAsEmail(raw));
      variants.add(`${digits}@${MOBILE_EMAIL_DOMAIN}`);
      if (digits.startsWith("94") && digits.length === 11) {
        variants.add(`${digits}@${MOBILE_EMAIL_DOMAIN}`);
        variants.add(`${`0${digits.slice(2)}`}@${MOBILE_EMAIL_DOMAIN}`);
      }

      let lastError: any = null;
      for (const candidate of variants) {
        try {
          email = candidate;
          userCredential = await signInWithEmailAndPassword(auth, candidate, credentials.password);
          lastError = null;
          break;
        } catch (e: any) {
          lastError = e;
          if (e?.code !== "auth/invalid-credential") {
            // Stop early on network/other errors
            break;
          }
        }
      }
      if (!userCredential) {
        throw lastError || new Error("auth/invalid-credential");
      }
    }

    const user = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
    if (!userDoc.exists()) {
      throw new Error("User profile not found");
    }

    const profile = userDoc.data() as UserProfile;

    // Verify user type matches
    if (profile.role !== userType) {
      await signOut(auth);
      throw new Error(`Invalid user type. Expected ${userType}, got ${profile.role}`);
    }

    return { user, profile };
  } catch (error: any) {
    console.error("Firebase login error:", error);
    throw {
      code: error.code || "auth/invalid-credentials",
      message: error.message || getFirebaseErrorMessage(error.code),
    } as FirebaseAuthError;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Firebase logout error:", error);
    throw {
      code: error.code,
      message: getFirebaseErrorMessage(error.code),
    } as FirebaseAuthError;
  }
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as UserProfile;
  } catch (error: any) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    // Update main users collection
    await updateDoc(doc(db, USERS_COLLECTION, userId), updateData);

    // Update role-specific collection
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      const roleCollection = userData.role === "buyer" ? BUYERS_COLLECTION : VENDORS_COLLECTION;
      await updateDoc(doc(db, roleCollection, userId), updateData);
    }
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    throw {
      code: error.code,
      message: getFirebaseErrorMessage(error.code),
    } as FirebaseAuthError;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Password reset error:", error);
    throw {
      code: error.code,
      message: getFirebaseErrorMessage(error.code),
    } as FirebaseAuthError;
  }
};

// Change password with reauthentication
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw { code: "auth/no-current-user", message: "No authenticated user found." } as FirebaseAuthError;
  }
  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw {
      code: error.code || "auth/error-updating-password",
      message: getFirebaseErrorMessage(error.code) || error.message || "Failed to update password.",
    } as FirebaseAuthError;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Helper function to map Firebase error codes to user-friendly messages
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please use a different email or try logging in.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled. Please contact support.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email. Please check your email or register.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return "An error occurred during authentication. Please try again.";
  }
};