import React from "react";
import Image from "next/image";

import { Lorry } from "@/assets/images";

export const OrdersCard: React.FC = () => {
  return (
    <div className="flex flex-row items-center justify-center  bg-[#F8F8F8] rounded-[10px] md:py-0 py-[7px] md:pl-4 sm:pl-7 pl-4   ">
      <div>
        <p className="text-[#930000] text-[14px] md:text-[24px] font-title">
          +15000
        </p>
        <p className="text-[14px] md:text-[24px] text-[#5B5B5B] font-title pr-10">
          Orders
        </p>
      </div>
      <div>
        <Image
          src={Lorry}
          alt="Orders"
          className="mb-4 md:w-[102px] md:h-[83px] mt-5 w-[90px] h-[78px]"
        />
      </div>
    </div>
  );
};
