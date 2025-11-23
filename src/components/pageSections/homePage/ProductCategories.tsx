"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import { ChevronRight, ChevronLeft, Star } from "lucide-react";

import type { Swiper as SwiperType } from "swiper";
import {
  FirestoreService,
  COLLECTIONS,
  Product,
  Category,
} from "@/service/firestoreService";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import {
  Product1,
  Product2,
  Product3,
  Product4,
  Product5,
} from "@/assets/Images";
import Link from "next/link";

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

export const ProductCategories: React.FC = () => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Firebase state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<
    Array<{
      category: Category;
      product: Product;
      lowestPrice: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Firebase
  useEffect(() => {
    let isMounted = true;

    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);

        const categoriesData = await FirestoreService.getAll<Category>(
          COLLECTIONS.CATEGORIES,
          undefined,
          "sortOrder",
          "asc"
        );

        if (!isMounted) return;
        setCategories(categoriesData);

        const allProducts = await FirestoreService.getAll<Product>(
          COLLECTIONS.PRODUCTS,
          [{ field: "isActive", operator: "==", value: true }]
        );

        if (!isMounted) return;

        const categoryMap = new Map<
          string,
          { product: Product; lowestPrice: number }
        >();

        allProducts.forEach((product) => {
          const categoryId = String(product.mainCategory || "").trim();
          const price = product.price || 0;

          if (!categoryId) return;

          if (!categoryMap.has(categoryId)) {
            categoryMap.set(categoryId, { product, lowestPrice: price });
          } else {
            const existing = categoryMap.get(categoryId)!;
            if (price < existing.lowestPrice) {
              categoryMap.set(categoryId, { product, lowestPrice: price });
            }
          }
        });

        const categoryProductList = categoriesData
          .map((category) => {
            const categoryId = (category as any).id || category.name;
            const productData = categoryMap.get(categoryId);

            if (productData) {
              return {
                category,
                product: productData.product,
                lowestPrice: productData.lowestPrice,
              };
            }
            return null;
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        if (!isMounted) return;
        setCategoryProducts(categoryProductList);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategoryProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white xl:pt-10 xl:pb-20 xl:px-20 lg:px-10 md:px-5 pt-5 pb-10">
      <h1 className="md:text-[32px] text-[16px] xl:mb-10 text-black xl:pl-11 pl-5 font-title">
        Product Categories
      </h1>

      <div className="block 2xl:hidden">
        <div className="lg:hidden grid lg:grid-cols-4 grid-cols-2  px-1">
          {loading ? (
            <div className="col-span-2 text-center py-10 text-gray-500 text-[10px]">
              Loading...
            </div>
          ) : categoryProducts.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-gray-500 text-[10px]">
              No products available
            </div>
          ) : (
            (showAll ? categoryProducts : categoryProducts.slice(0, 2)).map(
              ({ category, product, lowestPrice }, index) => {
                const categoryId = (category as any).id || category.name;

                return (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="w-full h-[117px] bg-[#F8F8F8] rounded-lg flex justify-center items-center">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={category.name}
                          width={84}
                          height={66}
                          className="object-cover w-[84px] h-[66px] rounded-md"
                          unoptimized
                        />
                      ) : (
                        <div className="w-[84px] h-[66px] bg-gray-200 flex items-center justify-center text-[8px] text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <h3 className="text-[10px] font-semibold text-black mt-2 pl-1">
                      {category.name}
                    </h3>
                    <p className="text-[8px] text-gray-600 pl-1">
                      Best {category.name.toLowerCase()} from $
                      {lowestPrice.toFixed(2)} now
                    </p>
                    <div className="flex mt-1 pl-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="text-yellow-500 text-[12px]">
                          {i < 4 ? (
                            <Star fill="#FBBF24" size="10px" />
                          ) : (
                            <Star size="10px" />
                          )}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/user/search-vendors?category=${encodeURIComponent(
                        categoryId
                      )}`}
                      className="bg-yellow-400 ml-1 w-[68px] h-[24px] text-black text-[8px] font-bold rounded mt-2 py-1 px-2 hover:bg-yellow-500 flex items-center justify-center"
                    >
                      Shop Now
                    </Link>
                  </div>
                );
              }
            )
          )}
        </div>

        <div className="lg:grid hidden lg:grid-cols-4   px-1">
          {loading ? (
            <div className="col-span-4 text-center py-10 text-gray-500 text-[10px]">
              Loading...
            </div>
          ) : categoryProducts.length === 0 ? (
            <div className="col-span-4 text-center py-10 text-gray-500 text-[10px]">
              No products available
            </div>
          ) : (
            (showAll ? categoryProducts : categoryProducts.slice(0, 4)).map(
              ({ category, product, lowestPrice }, index) => {
                const categoryId = (category as any).id || category.name;

                return (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="w-full h-[117px] bg-[#F8F8F8] rounded-lg flex justify-center items-center">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={category.name}
                          width={84}
                          height={66}
                          className="object-cover w-[84px] h-[66px] rounded-md"
                          unoptimized
                        />
                      ) : (
                        <div className="w-[84px] h-[66px] bg-gray-200 flex items-center justify-center text-[8px] text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <h3 className="text-[10px] font-semibold text-black mt-2 pl-1">
                      {category.name}
                    </h3>
                    <p className="text-[8px] text-gray-600 pl-1">
                      Best {category.name.toLowerCase()} from $
                      {lowestPrice.toFixed(2)} now
                    </p>
                    <div className="flex mt-1 pl-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="text-yellow-500 text-[12px]">
                          {i < 4 ? (
                            <Star fill="#FBBF24" size="10px" />
                          ) : (
                            <Star size="10px" />
                          )}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/user/search-vendors?category=${encodeURIComponent(
                        categoryId
                      )}`}
                      className="bg-yellow-400 ml-1 w-[68px] h-[24px] text-black text-[8px] font-bold rounded mt-2 py-1 px-2 hover:bg-yellow-500 flex items-center justify-center"
                    >
                      Shop Now
                    </Link>
                  </div>
                );
              }
            )
          )}
        </div>

        {/* View More/Less Buttons */}
        {!showAll && !loading && categoryProducts.length > 2 && (
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
        {showAll && !loading && categoryProducts.length > 2 && (
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

      {/* Large Screen Swiper */}
      <div className="hidden 2xl:flex relative items-center justify-center pl-[100px] pr-[80px]">
        <button
          className="absolute left-0 text-[#5B5B5B] p-3 rounded-full hover:bg-gray-50 z-50"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <ChevronLeft />
        </button>
        <button
          className="absolute right-[15px] text-[#5B5B5B] p-3 rounded-full hover:bg-gray-50 z-50"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <ChevronRight />
        </button>

        {/* Content */}
        <div className="w-full flex items-center justify-center">
          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading...</div>
          ) : categoryProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No products available
            </div>
          ) : (
            <Swiper
              modules={[Navigation, A11y]}
              slidesPerView={5}
              //spaceBetween={10}
              spaceBetween={0}
              loop={categoryProducts.length >= 5}
              className="w-full"
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
            >
              {categoryProducts.map(
                ({ category, product, lowestPrice }, index) => {
                  const categoryId = (category as any).id || category.name;

                  return (
                    <SwiperSlide
                      key={index}
                      className="w-[202px] h-[302px] pr-0 m-0"
                    >
                      <div className="w-full h-full bg-white rounded-lg text-left">
                        <div className="w-[202px] h-[232px] bg-[#F8F8F8] rounded-lg p-4 mb-3 flex justify-center items-center">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={category.name}
                              width={159}
                              height={123}
                              className="object-cover w-[159px] h-[123px] rounded-md"
                              unoptimized
                            />
                          ) : (
                            <div className="w-[159px] h-[123px] bg-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>

                        <h3 className="text-[12px] font-semibold text-black font-body mt-1">
                          {category.name}
                        </h3>
                        <p className="text-[#000000] text-[12px] font-body">
                          Best {category.name.toLowerCase()} from $
                          {lowestPrice.toFixed(2)} now
                        </p>

                        <div className="flex mt-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className="text-yellow-500 text-[10px]"
                            >
                              {i < 4 ? (
                                <Star fill="#FBBF24" size="12px" />
                              ) : (
                                <Star size="12px" />
                              )}
                            </span>
                          ))}
                        </div>

                        <Link
                          href={`/user/search-vendors?category=${encodeURIComponent(
                            categoryId
                          )}`}
                          className="bg-yellow-400 text-[#111102] text-[8px] font-bold rounded-[5px] font-body mt-2 hover:bg-yellow-500 w-[50px] h-[18px] flex items-center justify-center"
                        >
                          Shop Now
                        </Link>
                      </div>
                    </SwiperSlide>
                  );
                }
              )}
            </Swiper>
          )}
        </div>
      </div>
    </div>
  );
};
