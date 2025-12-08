"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

import {
  FirestoreService,
  COLLECTIONS,
  Service,
} from "@/service/firestoreService";

export const ServiceCategories: React.FC = () => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const authState = useSelector((state: RootState) => state.auth as any);
  const user = authState.user as any;

  const shopNowPath =
    user?.role === "vendor"
      ? "/vendor/purchase-orders"
      : "/user/search-vendors";

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const list = await FirestoreService.getAll<Service>(
          COLLECTIONS.SERVICES,

          undefined,
          "sortOrder",
          "asc"
        );

        const active = list.filter((s) => (s as any).isActive !== false);

        setServices(active);
      } catch (e) {
        console.error("Failed to load services", e);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const getDescription = (service: Service) => {
    return service.description || "Services available now";
  };

  const getRating = (service: Service): number => {
    return 4.5;
  };

  const visibleServicesSmall = showAll ? services : services.slice(0, 2);
  const visibleServicesMedium = showAll ? services : services.slice(0, 4);
  const visibleServicesLarge = showAll ? services : services.slice(0, 5);

  return (
    <div className="bg-white xl:pt-5 xl:pb-20 xl:px-20 lg:px-10 md:px-5  pb-5">
      <h1 className="md:text-[32px] text-[16px] xl:mb-10  text-black xl:pl-11 pl-5  font-title">
        Our Services
      </h1>

      {/* Small Screen Display */}
      <div className="block 2xl:hidden">
        <div className="lg:hidden grid lg:grid-cols-4 grid-cols-2 px-1">
          {loading ? (
            <div className="col-span-2 text-center py-10 text-gray-500 text-[10px]">
              Loading...
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-gray-500 text-[10px]">
              No services available
            </div>
          ) : (
            visibleServicesSmall.map((service, index) => {
              const rating = getRating(service);
              return (
                <div key={index} className="bg-white rounded-lg p-4">
                  <div className="w-full h-[117px] bg-[#F8F8F8] rounded-lg flex justify-center items-center">
                    {service.imageUrl ? (
                      <Image
                        src={service.imageUrl}
                        alt={service.name}
                        className="object-contain w-[84px] h-[66px] rounded-[10px]"
                        width={84}
                        height={66}
                        unoptimized
                      />
                    ) : (
                      <div className="w-[84px] h-[66px] bg-gray-200 flex items-center justify-center text-[8px] text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="text-[10px] pl-1 font-semibold text-black mt-2">
                    {service.name}
                  </h3>
                  <p className="text-[8px] pl-1 text-gray-600 mt-[1px]">
                    {getDescription(service)}
                  </p>
                  <div className="flex mt-1 pl-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className="text-yellow-500 text-[12px]">
                        {i < Math.floor(rating) ? (
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
              );
            })
          )}
        </div>

        <div className="lg:grid hidden lg:grid-cols-4 px-1">
          {loading ? (
            <div className="col-span-4 text-center py-10 text-gray-500 text-[10px]">
              Loading...
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-4 text-center py-10 text-gray-500 text-[10px]">
              No services available
            </div>
          ) : (
            visibleServicesMedium.map((service, index) => {
              const rating = getRating(service);
              return (
                <div key={index} className="bg-white rounded-lg p-4">
                  <div className="w-full h-[117px] bg-[#F8F8F8] rounded-lg flex justify-center items-center">
                    {service.imageUrl ? (
                      <Image
                        src={service.imageUrl}
                        alt={service.name}
                        className="object-contain w-[84px] h-[66px] rounded-[10px]"
                        width={84}
                        height={66}
                        unoptimized
                      />
                    ) : (
                      <div className="w-[84px] h-[66px] bg-gray-200 flex items-center justify-center text-[8px] text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="text-[10px] pl-1 font-semibold text-black mt-2">
                    {service.name}
                  </h3>
                  <p className="text-[8px] pl-1 text-gray-600 mt-[1px]">
                    {getDescription(service)}
                  </p>
                  <div className="flex mt-1 pl-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className="text-yellow-500 text-[12px]">
                        {i < Math.floor(rating) ? (
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
              );
            })
          )}
        </div>

        {!loading && services.length > 0 && !showAll && (
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
        {!loading && services.length > 0 && showAll && (
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
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No services available
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-4">
              {visibleServicesLarge.map((service, index) => {
                const rating = getRating(service);
                return (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="w-full h-[232px] bg-[#F8F8F8] rounded-lg flex justify-center items-center mb-3">
                      {service.imageUrl ? (
                        <Image
                          src={service.imageUrl}
                          alt={service.name}
                          className="object-contain w-[159px] h-[123px] rounded-[10px]"
                          width={159}
                          height={123}
                          unoptimized
                        />
                      ) : (
                        <div className="w-[159px] h-[123px] bg-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <h3 className="text-[12px] font-semibold text-black font-body mt-1">
                      {service.name}
                    </h3>
                    <p className="text-[#000000] text-[12px] font-body mt-[1px]">
                      {getDescription(service)}
                    </p>

                    <div className="flex mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="text-yellow-500 text-[10px]">
                          {i < Math.floor(rating) ? (
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
                );
              })}
            </div>

            {services.length > 5 && !showAll && (
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
            {services.length > 5 && showAll && (
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
          </>
        )}
      </div>
    </div>
  );
};
