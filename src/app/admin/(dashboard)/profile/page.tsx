"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

const AdminProfilePage: React.FC = () => {
  const authState = useSelector((state: RootState) => state.auth as any);
  const user = authState.user;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="bg-white rounded shadow p-4 space-y-2 text-sm">
        <div><span className="text-gray-500">Name:</span> {user?.firstName} {user?.lastName}</div>
        <div><span className="text-gray-500">Email:</span> {user?.email}</div>
        <div><span className="text-gray-500">Role:</span> {user?.role}</div>
      </div>
    </div>
  );
};

export default AdminProfilePage;


