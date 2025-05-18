import React from "react";

import { CustomersCard, VendorsCard, OrdersCard } from "@/components/atoms";

export const StatsSection: React.FC = () => {
  return (
    <div className="bg-white md:pt-5  md:px-[130px] pt-5 px-5">
      <h2 className="text-[16px] md:text-[24px] font-title text-[#111102] md:mb-8 mb-4">
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
