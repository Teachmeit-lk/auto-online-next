"use client"; 

import { FC } from "react";

import { CompletedOrders as TempCompletedOrdersCommon } from "@/commonPages";
import withAuth from "@/components/authGuard/withAuth";

const CompletedOrders: FC = () => {
  return <TempCompletedOrdersCommon type="vendor" />;
};
export default withAuth(CompletedOrders);
