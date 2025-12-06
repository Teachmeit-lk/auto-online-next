"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import {
  OService1,
  OService2,
  OService3,
  OService4,
  OService5,
} from "@/assets/Images";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

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
  const [showAll, setShowAll] = useState(false);
  const authState = useSelector((state: RootState) => state.auth as any);
  const user = authState.user as any;

  const shopNowPath =
    user?.role === "vendor"
      ? "/vendor/purchase-orders"
      : "/user/search-vendors";

  return (
    <div className="bg-white xl:pt-5 xl:pb-20 xl:px-20 lg:px-10 md:px-5  pb-5">
      <h1 className="md:text-[32px] text-[16px] xl:mb-10  text-black xl:pl-11 pl-5  font-title">
        Our Services
      </h1>

      {/* Small Screen Display */}
      <div className="block 2xl:hidden">
        <div className="lg:hidden grid lg:grid-cols-4 grid-cols-2 px-1">
          {(showAll ? initialProducts : initialProducts.slice(0, 2)).map(
            (product, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="w-full h-[117px] bg-[#F8F8F8] rounded-lg flex justify-center items-center">
                  <Image
                    src={product.image}
                    alt={product.type}
                    className="object-contain w-[84px] h-[66px]"
                  />
                </div>
                <h3 className="text-[10px] pl-1 font-semibold text-black mt-2">
                  {product.type}
                </h3>
                <p className="text-[8px] pl-1 text-gray-600 mt-[1px]">
                  {product.description}
                </p>
                <div className="flex mt-1 pl-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className="text-yellow-500 text-[12px]">
                      {i < Math.floor(product.rating) ? (
                        <Star fill="#FBBF24" size="10px" />
                      ) : (
                        <Star size="10px" />
                      )}
                    </span>
                  ))}
                </div>
                <Link
                  href={shopNowPath}
                  className="bg-yellow-400 ml-1 w-[68px] h-[24px] text-black text-[8px] font-bold rounded mt-2 py-1 px-2 hover:bg-yellow-500 flex items-center justify-center"
                >
                  Shop Now
                </Link>
              </div>
            )
          )}
        </div>
        <div className="lg:grid hidden lg:grid-cols-4 px-1">
          {(showAll ? initialProducts : initialProducts.slice(0, 4)).map(
            (product, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="w-full h-[117px] bg-[#F8F8F8] rounded-lg flex justify-center items-center">
                  <Image
                    src={product.image}
                    alt={product.type}
                    className="object-contain w-[84px] h-[66px]"
                  />
                </div>
                <h3 className="text-[10px] pl-1 font-semibold text-black mt-2">
                  {product.type}
                </h3>
                <p className="text-[8px] pl-1 text-gray-600 mt-[1px]">
                  {product.description}
                </p>
                <div className="flex mt-1 pl-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className="text-yellow-500 text-[12px]">
                      {i < Math.floor(product.rating) ? (
                        <Star fill="#FBBF24" size="10px" />
                      ) : (
                        <Star size="10px" />
                      )}
                    </span>
                  ))}
                </div>
                <Link
                  href={shopNowPath}
                  className="bg-yellow-400 ml-1 w-[68px] h-[24px] text-black text-[8px] font-bold rounded mt-2 py-1 px-2 hover:bg-yellow-500 flex items-center justify-center"
                >
                  Shop Now
                </Link>
              </div>
            )
          )}
        </div>
        {!showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-4 flex items-center justify-center text-[12px] text-[#111102] font-medium font-body w-full"
          >
            View More
            <ChevronRight
              strokeWidth="2px"
              size="15px"
              color="#111102"
              className="ml-1 mt-[2px] "
            />
          </button>
        )}
        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="mt-4 flex items-center justify-center text-[12px] text-[#111102] font-medium font-body w-full"
          >
            View Less
            <ChevronRight
              strokeWidth="2px"
              size="15px"
              color="#111102"
              className="ml-1 mt-[2px] "
            />
          </button>
        )}
      </div>

      {/* Large Screen Grid */}
      <div className="hidden 2xl:block px-20">
        <div className="grid grid-cols-5 gap-4">
          {(showAll ? initialProducts : initialProducts.slice(0, 5)).map(
            (product, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="w-full h-[232px] bg-[#F8F8F8] rounded-lg flex justify-center items-center mb-3">
                  <Image
                    src={product.image}
                    alt={product.type}
                    className="object-contain w-[159px] h-[123px]"
                  />
                </div>

                <h3 className="text-[12px] font-semibold text-black font-body mt-1">
                  {product.type}
                </h3>
                <p className="text-[#000000] text-[12px] font-body mt-[1px]">
                  {product.description}
                </p>

                <div className="flex mt-1">
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

                <Link
                  href={shopNowPath}
                  className="bg-yellow-400 text-[#111102] text-[8px] font-bold rounded-[5px] font-body mt-2 hover:bg-yellow-500 w-[50px] h-[18px] flex items-center justify-center"
                >
                  Shop Now
                </Link>
              </div>
            )
          )}
        </div>

        {/* View More/Less Buttons for Large Screen */}
        {!showAll && initialProducts.length > 5 && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-6 flex items-center justify-center text-[14px] text-[#111102] font-medium font-body w-full"
          >
            View More
            <ChevronRight
              strokeWidth="2px"
              size="18px"
              color="#111102"
              className="ml-1"
            />
          </button>
        )}
        {showAll && initialProducts.length > 5 && (
          <button
            onClick={() => setShowAll(false)}
            className="mt-6 flex items-center justify-center text-[14px] text-[#111102] font-medium font-body w-full"
          >
            View Less
            <ChevronRight
              strokeWidth="2px"
              size="18px"
              color="#111102"
              className="ml-1"
            />
          </button>
        )}
      </div>
    </div>
  );
};
