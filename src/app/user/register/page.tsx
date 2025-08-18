"use client";

import { CommonRegisterPage } from "@/commonPages";
import { FC, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/app/store/store";

const RegisterPage: FC = () => {
  const { isAuthenticated, user, initialized, loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && isAuthenticated) {
      if (user?.role === "buyer") router.replace("/user/search-vendors");
      else if (user?.role === "vendor") router.replace("/vendor/products");
      else router.replace("/");
    }
  }, [initialized, loading, isAuthenticated, user, router]);

  return <CommonRegisterPage type="buyer" />;
};
export default RegisterPage;
