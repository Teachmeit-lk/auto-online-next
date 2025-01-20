"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import {
  OService1,
  OService2,
  OService3,
  OService4,
  OService5,
} from "@/components/data/index";

import type { Swiper as SwiperType } from "swiper";

const initialProducts = [
  {
    type: "Paint & Repair",
    description: "Services from $101.50 now",
    price: "$101.50",
    image: OService1,
    rating: 4.5,
  },
  {
    type: "Electricals",
    description: "Services from $71.50 now",
    price: "$71.50",
    image: OService2,
    rating: 4.8,
  },
  {
    type: "Vehicle Valuation",
    description: "Services from $91.50 now",
    price: "$91.50",
    image: OService3,
    rating: 4.7,
  },
  {
    type: "Tyre Change",
    description: "Services from $71.50 now",
    price: "$71.50",
    image: OService4,
    rating: 4.6,
  },
  {
    type: "Vehicle Carriage & Tow",
    description: "Services from $71.50 now",
    price: "$71.50",
    image: OService5,
    rating: 4.9,
  },
  {
    type: "Electricals",
    description: "Services from $71.50 now",
    price: "$71.50",
    image: OService2,
    rating: 4.8,
  },
  {
    type: "Vehicle Valuation",
    description: "Services from $91.50 now",
    price: "$91.50",
    image: OService3,
    rating: 4.7,
  },
  {
    type: "Tyre Change",
    description: "Services from $71.50 now",
    price: "$71.50",
    image: OService4,
    rating: 4.6,
  },
];

export const ServiceCategories: React.FC = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="bg-white pb-20 px-20 pt-20" id="services">
      <h1 className="text-[32px] mb-10 text-black pl-11 font-title">
        Our Services
      </h1>
      <div className="relative flex items-center justify-center pl-[100px] pr-[80px]">
        {/* Arrow Buttons */}
        <button
          className="absolute left-0 text-[#5B5B5B] p-3 rounded-full hover:bg-gray-50 z-50"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <ChevronLeft />
        </button>

        <Swiper
          modules={[Navigation, A11y]}
          slidesPerView={5}
          spaceBetween={0}
          loop={true}
          className="flex"
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {initialProducts.map((product, index) => (
            <SwiperSlide key={index} className="w-[202px] h-[302px] pr-0 m-0">
              <div className="w-full h-full bg-white rounded-lg text-left">
                <div className="w-[202px] h-[232px] bg-[#F8F8F8] rounded-lg p-4 mb-3 flex justify-center items-center">
                  <Image
                    src={product.image}
                    alt={product.type}
                    className="object-contain w-[159px] h-[123px]"
                  />
                </div>

                <h3 className="text-[12px] font-semibold text-black font-body mt-1">
                  {product.type}
                </h3>
                <p className="text-[#000000] text-[12px] font-body ">
                  {product.description}
                </p>

                <div className="flex ">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className="text-yellow-500 text-[10px]">
                      {i < Math.floor(product.rating) ? (
                        <Star fill="#FBBF24" size="12px" />
                      ) : (
                        <Star size="12px" />
                      )}
                    </span>
                  ))}
                </div>
                <button className="bg-yellow-400 text-[#111102] text-[8px] font-bold rounded-[5px] font-body mt-13 hover:bg-yellow-500 w-[50px] h-[18px]">
                  Shop Now
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className="absolute right-[20px] text-[#5B5B5B] p-3 rounded-full hover:bg-gray-50 z-50"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
