import React from "react";
import Image from "next/image";

import { People } from "@/components/data/index";

export const VendorsCard: React.FC = () => {
  return (
    <div className="flex flex-row items-center  bg-[#F8F8F8] rounded-[10px]  pl-[80px]">
      <div>
        <p className="text-[#930000] text-[24px] font-title">+6500</p>
        <p className="text-[24px] text-[#5B5B5B] font-title pr-7">Vendors</p>
      </div>
      <div>
        <Image
          src={People}
          alt="Vendors"
          className="mb-4 w-[95px] h-[105px] mt-9"
        />
      </div>
    </div>
  );
};
