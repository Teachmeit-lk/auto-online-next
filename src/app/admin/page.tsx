"use client";

import React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AdminHome: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);
  return null;
};

export default AdminHome;


