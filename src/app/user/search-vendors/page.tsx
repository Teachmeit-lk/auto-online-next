"use client";

import React, { useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import { TabLayout, ViewVendorProfileModal } from "@/components";

import { GetQuotationModal } from "@/components/";
import { withAuth } from "@/components/authGuard/withAuth";
import VendorProducts from "@/app/vendor/products/page";

const SearchVendors: React.FC = () => {
  const [entries, setEntries] = useState(10);
  const [getQuotationModalOpen, setGetQuotationModalOpen] = useState(false);
  const [ViewVendorProfileModalOpen, setViewVendorProfileModalOpen] =
    useState(false);

  const vendors = Array.from({ length: entries }, (_, i) => ({
    no: i + 1,
    name: "ABC Company",
    address: "No 134, Maladeniya",
  }));

  return (
    <TabLayout type="user">
      <div
        className="w-full p-8 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] "
        id="searchvendors"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          Vendors List
        </h1>

        <div className="flex flex-row items-center  mb-2">
          <div className="font-body font-[500] mr-[108px]  text-[14px] text-[#111102]">
            Main Category
          </div>
          <div className="font-body font-[500] text-[14px] text-[#111102] mr-[40px]">
            Country of Manufactured
          </div>
          <div className="font-body font-[500] text-[14px] mr-[105px] text-[#111102]">
            Vendor District
          </div>
          <div className="font-body font-[500] text-[14px] mr-[470px] text-[#111102]">
            Show
          </div>{" "}
          <div className="font-body font-[500] text-[14px]  text-[#111102]">
            Search
          </div>
        </div>
        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <select
              className="rounded-[5px] px-3  text-[12px] font-body text-gray-600 w-[181px] h-[28px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              defaultValue="All Categories"
            >
              <option>All Categories</option>
              <option>Category 1</option>
              <option>Category 2</option>
            </select>

            <select
              className="rounded-[5px] px-3  text-[12px] font-body text-gray-600 w-[181px] h-[28px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              defaultValue="All Countries"
            >
              <option>All Countries</option>
              <option>Country 1</option>
              <option>Country 2</option>
            </select>

            <select
              className="rounded-[5px] px-3  text-[12px] font-body text-gray-600 w-[181px] h-[28px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              defaultValue="All Districts"
            >
              <option>All Districts</option>
              <option>District 1</option>
              <option>District 2</option>
            </select>

            <select
              className="rounded-[5px] px-3  text-[12px] font-body text-gray-600 w-[131px] h-[28px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              onChange={(e) => setEntries(Number(e.target.value))}
              defaultValue="10"
            >
              <option value="10">10 Entries</option>
              <option value="20">20 Entries</option>
              <option value="50">50 Entries</option>
            </select>
          </div>

          <div className="relative flex items-center rounded-[5px] text-sm text-gray-600 w-[263px] h-[28px]">
            <input
              type="text"
              placeholder="Search"
              className="w-full h-full pl-3 pr-8 rounded-[5px] text-[12px] font-body text-gray-600 outline-none focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Search
                strokeWidth="2px"
                color="#5B5B5B"
                size="17px"
                className="text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-tl-[10px] rounded-tr-[10px]">
          <table className="w-full border-collapse ">
            <thead>
              <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500] ">
                <th className="border border-r-2 border-b-2 border-white px-[30px] py-2 ">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white px-[60px] py-2">
                  Company Name
                </th>
                <th className="border border-r-2 border-b-2 border-white px-[140px] py-2">
                  Address
                </th>
                <th className="border px-4 py-2 border-b-1 border-white flex items-center justify-center space-x-2">
                  <ClipboardCheck size="19px" />
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 bg-white text-[12px] text-[#111102] "
                >
                  <td className="border border-r-2 border-b-2  border-[#F8F8F8] px-4 py-2 text-center">
                    {vendor.no}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] px-8 py-2 ">
                    {vendor.name}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] px-8 py-2 ">
                    {vendor.address}
                  </td>
                  <td className="grid grid-cols-2 text-center w-full h-full">
                    <button
                      className="bg-[#D1D1D1] border-r-2 border-white px-3 py-3  text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 active:bg-yellow-500"
                      // onClick={() => setIsModalOpen1(true)}
                      onClick={() => setGetQuotationModalOpen(true)}
                    >
                      Get Quotation
                    </button>
                    <button
                      className="bg-[#D1D1D1] px-3 py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 active:bg-yellow-500"
                      // onClick={() => setIsModalOpen2(true)}
                      onClick={() => setViewVendorProfileModalOpen(true)}
                    >
                      View More
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing 1-{entries} Entries
        </div>

        {/* <FilterModal
        isOpen={isModalOpen1}
        onClose={() => setIsModalOpen1(false)}
      />

      <CompanyProfileModal
        isOpen={isModalOpen2}
        onClose={() => setIsModalOpen2(false)}
      /> */}
      </div>
      <GetQuotationModal
        isOpen={getQuotationModalOpen}
        onClose={() => setGetQuotationModalOpen(false)}
      />
      <ViewVendorProfileModal
        isOpen={ViewVendorProfileModalOpen}
        onClose={() => setViewVendorProfileModalOpen(false)}
      />
    </TabLayout>
  );
};
export default withAuth(VendorProducts);
