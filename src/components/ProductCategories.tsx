"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Product1,
  Product2,
  Product3,
  Product4,
  Product5,
  RightArrow,
  LeftArrow,
} from "@/components/atoms/index";

const initialProducts = [
  {
    name: "Filters",
    description: "Best filters from $71.50 now",
    price: "$71.50",
    image: Product1,
    rating: 4.5,
  },
  {
    name: "Batteries",
    description: "Best batteries from $71.50 now",
    price: "$71.50",
    image: Product2,
    rating: 4.8,
  },
  {
    name: "Tyres",
    description: "Best tyres from $71.50 now",
    price: "$71.50",
    image: Product3,
    rating: 4.7,
  },
  {
    name: "Alloy Wheels",
    description: "Best filters from $71.50 now",
    price: "$71.50",
    image: Product4,
    rating: 4.6,
  },
  {
    name: "Engine Parts",
    description: "Best filters from $71.50 now",
    price: "$71.50",
    image: Product5,
    rating: 4.9,
  },
];

const ProductCategories: React.FC = () => {
  const [products, setProducts] = useState(initialProducts);

  const handleLeftClick = () => {
    const updatedProducts = [...products];
    const firstProduct = updatedProducts.shift();
    if (firstProduct) {
      updatedProducts.push(firstProduct);
    }
    setProducts(updatedProducts);
  };

  const handleRightClick = () => {
    const updatedProducts = [...products];
    const lastProduct = updatedProducts.pop();
    if (lastProduct) {
      updatedProducts.unshift(lastProduct);
    }
    setProducts(updatedProducts);
  };

  return (
    <div className="bg-white pt-10 pb-20 px-20">
      <h1 className="text-[32px]  mb-10 text-black pl-11 font-title">
        Product Categories
      </h1>
      <div className="relative flex items-center justify-center">
        {/* Arrow Buttons */}
        <button
          className="absolute left-10  text-[#5B5B5B] p-3 rounded-full  hover:bg-gray-50 z-10"
          onClick={handleLeftClick}
        >
          <LeftArrow />
        </button>
        <button
          className="absolute right-10  text-[#5B5B5B] p-3 rounded-full  hover:bg-gray-50 z-10"
          onClick={handleRightClick}
        >
          <RightArrow />
        </button>

        {/* Product Cards */}
        <div className="flex space-x-6">
          {products.map((product, index) => (
            <div
              key={index}
              className="w-[202px] h-[302px] bg-white rounded-lg  text-left"
            >
              <div className="w-[202px] h-[232px] bg-[#F8F8F8] rounded-lg p-4 mb-3 flex justify-center items-center">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="object-contain w-[159px] h-[123px]"
                />
              </div>

              <h3 className="text-[12px] font-semibold  text-black font-body">
                {product.name}
              </h3>
              <p className="text-[#000000] text-[12px]  font-body">
                {product.description}
              </p>

              <div className="flex w-[5px] h-[5px] mt-[2px] ">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-yellow-500 text-[10px]  ${
                      i < Math.floor(product.rating)
                        ? "fas fa-star"
                        : "far fa-star"
                    }`}
                  ></span>
                ))}
              </div>
              <button className="bg-yellow-400 text-[#111102] text-[8px] font-bold rounded-[5px] font-body  mt-3 hover:bg-yellow-500 w-[50px] h-[18px]">
                Shop Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCategories;
