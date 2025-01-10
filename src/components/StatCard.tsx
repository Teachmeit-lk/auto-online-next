import React from "react";
import Image from "next/image";
import { Shake, Lorry, People } from "@/components/atoms/index";

const CustomersCard: React.FC = () => {
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

const OrdersCard: React.FC = () => {
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

const VendorsCard: React.FC = () => {
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

const StatsSection: React.FC = () => {
  return (
    <div className="bg-white pt-10 pb-20 px-[130px]">
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

export default StatsSection;
