"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { initializeFirebaseAuth } from "@/app/store/slice/authslice";

interface FirebaseContextType {
  user: FirebaseUser | null;
  loading: boolean;
  initialized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  initialized: false,
});

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { firebaseUser, loading, initialized } = useSelector((state: RootState) => state.auth);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    if (!authInitialized) {
      // Initialize Firebase auth state listener
      const unsubscribe = dispatch(initializeFirebaseAuth() as any);
      setAuthInitialized(true);

      // Cleanup listener on unmount
      return () => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      };
    }
  }, [dispatch, authInitialized]);

  const value: FirebaseContextType = {
    user: firebaseUser,
    loading,
    initialized,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};