import React from "react";

import { CustomersCard, VendorsCard, OrdersCard } from "@/components/atoms";

export const OurStatusSection: React.FC = () => {
  return (
    <div className="bg-white xl:pt-5  xl:px-[130px]  lg:px-[55px] md:px-10 pt-5 px-5">
      <h2 className="text-[16px] md:text-[24px] font-title text-[#111102] md:mb-8 mb-4">
        Everyday, Autoonline Parts Powers...
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CustomersCard />
        <OrdersCard />
        <VendorsCard />
      </div>
    </div>
  );
};
