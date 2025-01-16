"use client";

import React, { useState } from "react";
import FilterModal from "../modal/FilterModal";

const SearchVendors: React.FC = () => {
  const [entries, setEntries] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const vendors = Array.from({ length: entries }, (_, i) => ({
    no: i + 1,
    name: "ABC Company",
    address: "No 134, Maladeniya",
  }));

  return (
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
            className="rounded-[5px] px-3  text-sm text-gray-600 w-[181px] h-[28px]"
            defaultValue="All Categories"
          >
            <option>All Categories</option>
            <option>Category 1</option>
            <option>Category 2</option>
          </select>

          <select
            className="rounded-[5px] px-3  text-sm text-gray-600 w-[181px] h-[28px]"
            defaultValue="All Countries"
          >
            <option>All Countries</option>
            <option>Country 1</option>
            <option>Country 2</option>
          </select>

          <select
            className="rounded-[5px] px-3  text-sm text-gray-600 w-[181px] h-[28px]"
            defaultValue="All Districts"
          >
            <option>All Districts</option>
            <option>District 1</option>
            <option>District 2</option>
          </select>

          <select
            className="rounded-[5px] px-3  text-sm text-gray-600 w-[131px] h-[28px]"
            onChange={(e) => setEntries(Number(e.target.value))}
            defaultValue="10"
          >
            <option value="10">10 Entries</option>
            <option value="20">20 Entries</option>
            <option value="50">50 Entries</option>
          </select>
        </div>

        <div className="relative flex items-center rounded-[5px] text-sm text-gray-600 w-[263px] h-[28px] ">
          <input
            type="text"
            placeholder="Search"
            className="w-full h-full pl-3 pr-8 rounded-[5px] text-sm text-gray-600 outline-none"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-2 h-4 w-4 text-[#5B5B5B"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
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
                <svg
                  width="13"
                  height="14"
                  viewBox="0 0 13 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.34203 6.62402C1.13493 6.20064 1.00733 5.73745 0.966535 5.26094C0.925737 4.78442 0.972538 4.30392 1.10426 3.8469C1.23598 3.38987 1.45005 2.96528 1.73422 2.59739C2.01838 2.2295 2.36709 1.92552 2.7604 1.70283L3.84666 1.08648L4.11377 0.935183C4.35917 0.796116 4.63096 0.719637 4.90816 0.711648C5.18536 0.70366 5.46056 0.764375 5.71251 0.889109L9.9547 2.84091L9.55523 4.1172L7.03234 3.59237L8.3389 6.26604L10.4423 10.5702L9.41764 11.1508L7.31418 6.84534L6.80804 7.13204L7.73533 9.03093L6.7112 9.61116L5.78394 7.71228L5.27778 7.99898L5.99379 9.46455L4.96908 10.0451L4.25306 8.57954L3.74665 8.86873L4.23806 9.87733L3.21365 10.4563L2.72224 9.44773L1.34231 6.62309L1.34203 6.62402ZM11.1398 9.98938C11.3527 10.2188 11.4977 10.511 11.5564 10.8291C11.6152 11.1472 11.5852 11.477 11.4701 11.7767C11.3551 12.0764 11.1601 12.3327 10.9099 12.5133C10.6597 12.6938 10.3654 12.7904 10.0642 12.791C9.82018 12.7907 9.57974 12.7274 9.36311 12.6063C9.14648 12.4852 8.95997 12.31 8.81924 12.0952C8.67852 11.8805 8.58767 11.6325 8.55433 11.3722C8.52099 11.1118 8.54613 10.8466 8.62764 10.5989L8.3588 10.0516C8.17898 10.3763 8.08219 10.7464 8.07827 11.1244C8.07435 11.5024 8.16345 11.8748 8.3365 12.2037C8.50956 12.5326 8.76039 12.8063 9.06351 12.9969C9.36663 13.1876 9.71121 13.2884 10.0622 13.2891C10.5766 13.289 11.0709 13.074 11.4411 12.6894C11.8113 12.3048 12.0285 11.7806 12.047 11.227C12.0656 10.6734 11.884 10.1336 11.5405 9.72132C11.197 9.30899 10.7183 9.05625 10.2053 9.01627L10.4756 9.56977C10.7268 9.64573 10.9556 9.79027 11.1398 9.98938Z"
                    fill="#111102"
                  />
                </svg>
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
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#D1D1D1] border-r-2 border-white px-3 py-3  text-[#111102] text-[12px] w-full h-full"
                  >
                    Get Quotation
                  </button>
                  <button className="bg-[#D1D1D1] px-3 py-3 text-[#111102] text-[12px] w-full h-full">
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

      <FilterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default SearchVendors;
