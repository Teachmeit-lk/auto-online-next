import React from "react";
import Image from "next/image";

import { Shake } from "@/components/data/index";

export const CustomersCard: React.FC = () => {
  return (
    <div className="flex flex-row items-center  bg-[#F8F8F8] rounded-[10px]  pl-[80px] pr-5 py-2 ">
      <div>
        <p className="text-[#930000] text-[24px] font-title">+12000</p>
        <p className="text-[24px] text-[#5B5B5B] font-title pr-2">Customers</p>
      </div>
      <div>
        <Image
          src={Shake}
          alt="Customers"
          className="mb-4 w-[106px] h-[95px] mt-9"
        />
      </div>
    </div>
  );
};
