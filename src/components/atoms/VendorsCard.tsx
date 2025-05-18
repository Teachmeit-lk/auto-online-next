import React from "react";
import Image from "next/image";

import { People } from "@/assets/images";

export const VendorsCard: React.FC = () => {
  return (
    <div className="flex flex-row justify-center items-center  bg-[#F8F8F8] rounded-[10px] ">
      <div>
        <p className="text-[#930000] text-[14px] md:text-[24px] font-title">
          +6500
        </p>
        <p className="md:text-[24px] text-[14px] text-[#5B5B5B] font-title pr-7">
          Vendors
        </p>
      </div>
      <div>
        <Image
          src={People}
          alt="Vendors"
          className="mb-4 md:w-[95px]  md:h-[105px] md:mt-9 mt-6 w-[75px] h-[88px]"
        />
      </div>
    </div>
  );
};
