import React from "react";
import Image from "next/image";

import {
  Toyota,
  Bmw,
  Audi,
  Suzuki,
  Chr,
  Nissan,
  Service1,
  Service2,
  Service3,
} from "@/components/data/index";

const brands = [
  { name: "TOYOTA", logo: Toyota },
  { name: "BMW", logo: Bmw },
  { name: "Audi", logo: Audi },
  { name: "Nissan", logo: Nissan },
  { name: "Suzuki", logo: Suzuki },
  { name: "Chrysler", logo: Chr },
];

export const AutoServices: React.FC = () => {
  return (
    <div className="md:px-20 py-5  md:py-10 bg-white">
      {/* Brands Section */}
      <div className="grid grid-cols-6 md:space-x-6 space-x-4 md:mb-12 mb-6 w-full mt-1 md:mt-0 pl-1 pr-3 md:px-0">
        {brands.map((brand, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center"
          >
            <Image
              src={brand.logo}
              alt={brand.name}
              className="w-[32px] h-[32px] md:w-[94px] md:h-[56px] object-contain"
            />
          </div>
        ))}
      </div>

      {/* Services and Products Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:mx-10 ml-3 mr-4">
        {/* Best Services Card */}
        <div className="bg-[#F8F8F8]  md:py-6 md:px-[60px] py-6 pl-6 pr-4 rounded-lg flex items-center justify-between ml-[5px]">
          <div className="flex flex-col justify-between rounded-[16x]">
            <h3 className="text-[22px] md:text-[32px]  text-black  font-title">
              Best Services
            </h3>
            <p className="text-black text-[17px]  font-[400] mb-4 font-title md:text-[20px]">
              from us
            </p>
            <button className="bg-yellow-400 text-[#111102] rounded font-body font-[600] hover:bg-yellow-500 md:w-[100px] md:h-[32px] w-[76px] h-[22px] md:text-[14px] text-[10px] flex items-center justify-center">
              Shop Now
            </button>
          </div>
          <Image
            src={Service1}
            alt="Best Services"
            className="md:w-[152px] md:h-[99px] w-[113px] h-[74px] object-contain "
          />
        </div>

        {/* Best Products Card */}
        <div className="bg-[#F8F8F8] rounded-lg md:px-12 md:py-6 px-6 py-6 flex items-center justify-between md:ml-5 ml-[4px]">
          <div className="flex flex-col justify-between rounded-[16x] md:pl-[10px] ">
            <h3 className="text-[22px] md:text-[32px]  text-black  font-title ">
              Best Products
            </h3>
            <p className="text-black font-[400] mb-4 md:text-[20px] text-[17px] font-title">
              from us
            </p>
            <button className="bg-yellow-400 text-[#111102] rounded font-body font-[600] hover:bg-yellow-500 md:w-[100px] md:h-[32px] w-[76px] h-[22px] text-[10px] md:text-[14px] flex items-center justify-center">
              Shop Now
            </button>
          </div>
          <div className="relative md:right-[45px] right-[30px]">
            <Image
              src={Service3}
              alt="Best Products"
              className="  md:w-[113px] md:h-[84px] w-[82px] h-[63px] object-contain  "
            />
            <Image
              src={Service2}
              alt="Best Products"
              className="absolute md:w-[96px] md:h-[81px] w-[70px] h-[60px] object-contain md:top-[30px] top-[20px] md:left-[53px] left-[40px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
