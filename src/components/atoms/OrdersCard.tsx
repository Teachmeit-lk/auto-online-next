import React from "react";
import Image from "next/image";

import { Lorry } from "@/components/data/index";

export const OrdersCard: React.FC = () => {
  return (
    <div className="flex flex-row items-center  bg-[#F8F8F8] rounded-[10px]  pl-[80px] ">
      <div>
        <p className="text-[#930000] text-[24px] font-title">+15000</p>
        <p className="text-[24px] text-[#5B5B5B] font-title pr-10">Orders</p>
      </div>
      <div>
        <Image
          src={Lorry}
          alt="Orders"
          className="mb-4 w-[102px] h-[83px] mt-5 "
        />
      </div>
    </div>
  );
};
