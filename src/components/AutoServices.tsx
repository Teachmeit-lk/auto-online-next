import React from "react";
import Image from "next/image";

// Import your images
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
} from "@/components/atoms/index";

const brands = [
  { name: "TOYOTA", logo: Toyota },
  { name: "BMW", logo: Bmw },
  { name: "Audi", logo: Audi },
  { name: "Nissan", logo: Nissan },
  { name: "Suzuki", logo: Suzuki },
  { name: "Chrysler", logo: Chr },
];

const AutoServices: React.FC = () => {
  return (
    <div className="px-20 py-10 bg-white">
      {/* Brands Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        {brands.map((brand, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center"
          >
            <Image
              src={brand.logo}
              alt={brand.name}
              className="w-[94px] h-[56px] "
            />
            <p className="text-sm font-bold mt-2 text-center">{brand.name}</p>
          </div>
        ))}
      </div>

      {/* Services and Products Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mx-10">
        {/* Best Services Card */}
        <div className="bg-[#F8F8F8]  py-6 px-[60px] rounded-lg flex items-center justify-between ml-[5px]">
          <div className="flex flex-col justify-between rounded-[16x]">
            <h3 className="text-[24px] lg:text-[32px]  text-black  font-title">
              Best Services
            </h3>
            <p className="text-black font-[400] mb-4 font-title text-[20px]">
              from us
            </p>
            <button className="bg-yellow-400 text-[#111102] rounded font-body font-[600] hover:bg-yellow-500 w-[100px] h-[32px] text-[14px] flex items-center justify-center">
              Shop Now
            </button>
          </div>
          <Image
            src={Service1}
            alt="Best Services"
            className="w-[152px] h-[99px] object-contain "
          />
        </div>

        {/* Best Products Card */}
        <div className="bg-[#F8F8F8] rounded-lg px-12 py-6 flex items-center justify-between ml-5">
          <div className="flex flex-col justify-between rounded-[16x] pl-[10px]">
            <h3 className="text-[24px] lg:text-[32px]  text-black  font-title ">
              Best Products
            </h3>
            <p className="text-black font-[400] mb-4 text-[20px] font-title">
              from us
            </p>
            <button className="bg-yellow-400 text-[#111102] rounded font-body font-[600] hover:bg-yellow-500 w-[100px] h-[32px] text-[14px] flex items-center justify-center">
              Shop Now
            </button>
          </div>
          <div className="relative right-[45px]">
            <Image
              src={Service3}
              alt="Best Products"
              className="  w-[113px] h-[84px] object-contain  "
            />
            <Image
              src={Service2}
              alt="Best Products"
              className="absolute w-[96px] h-[81px] object-contain top-[30px] left-[53px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoServices;
