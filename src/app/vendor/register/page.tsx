"use client";

import { CommonRegisterPage } from "@/commonPages";
import { FC } from "react";
import { GuestGuard } from "@/components/authGuard";

const RegisterPage: FC = () => {
  return (
    <GuestGuard>
      <CommonRegisterPage type="vendor" />
    </GuestGuard>
  );
};
export default RegisterPage;
