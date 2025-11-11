"use client";

import { FC } from "react";
import { GuestGuard } from "@/components/authGuard";

import { CommonLoginPage } from "@/commonPages";

const LoginPage: FC = () => {
  return (
    <GuestGuard>
      <CommonLoginPage type="buyer" />
    </GuestGuard>
  );
};

export default LoginPage;
