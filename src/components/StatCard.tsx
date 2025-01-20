import React from "react";
import {
  CustomersCard,
  VendorsCard,
  OrdersCard,
} from "@/components/atoms/index";

export const StatsSection: React.FC = () => {
  return (
    <div className="bg-white pt-10  px-[130px]">
      <h2 className="text-[24px] font-title text-[#111102] mb-8">
        Everyday, Autoonline Parts Powers...
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CustomersCard />
        <OrdersCard />
        <VendorsCard />
      </div>
    </div>
  );
};
