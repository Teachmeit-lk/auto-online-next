import React from "react";
import Image from "next/image";

import { Shake } from "@/components/data/index";

export const CustomersCard: React.FC = () => {
  return (
    <div className="flex flex-row items-center justify-center  bg-[#F8F8F8] rounded-[10px] md:pl-10 sm:pl-8 pl-7  pr-5 md:py-2 ">
      <div>
        <p className="text-[#930000] text-[14px] md:text-[24px] font-title">
          +12000
        </p>
        <p className="text-[14px] md:text-[24px] text-[#5B5B5B] font-title pr-2">
          Customers
        </p>
      </div>
      <div>
        <Image
          src={Shake}
          alt="Customers"
          className="mb-4 md:w-[106px] md:h-[95px] mt-9 w-[90px] h-[78px]"
        />
      </div>
    </div>
  );
};
