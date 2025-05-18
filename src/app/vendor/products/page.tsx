"use client";

import React, { useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import { VendorLayout } from "@/components";

export const VendorProducts: React.FC = () => {
  const [entries, setEntries] = useState(10);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isModalOpen2, setIsModalOpen2] = useState(false);
  // const [isModalOpen3, setIsModalOpen3] = useState(false);

  const vendors = Array.from({ length: entries }, (_, i) => ({
    no: i + 1,
    pcode: "83356245921",
    name: "VD6464512",
    mcategory: "NMK Motors",
    brand: "NMK Motors",
    model: "Model",
  }));

  // const handleConfirmAlert = () => {
  //   console.log("Table Row Deleted!");
  //   setIsModalOpen3(false);
  // };

  return (
    <VendorLayout>
      <div
        className="w-full p-8 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] "
        id="searchvendors"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          Vendor Products
        </h1>
        <div className="flex items-center justify-between mb-4">
          {/* Show Entries Dropdown */}
          <div className="flex flex-col ">
            <div>
              <label className="font-body font-[500] text-[14px] text-[#111102]">
                Show
              </label>
            </div>

            <select
              className="rounded-[5px] px-3 text-[12px] font-body text-gray-600  w-[131px] h-[28px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              onChange={(e) => setEntries(Number(e.target.value))}
              defaultValue="10"
            >
              <option value="10">10 Entries</option>
              <option value="20">20 Entries</option>
              <option value="50">50 Entries</option>
            </select>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center space-x-4">
            {/* Search Input Container */}
            <div className="relative w-[263px]">
              {/* Search Label */}
              <label
                htmlFor="search"
                className="font-body font-[500] text-[14px] text-[#111102] block mb-1"
              >
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search"
                className="w-full h-[28px] pl-3 pr-8 rounded-[5px] font-body text-[12px] text-gray-600 outline-none focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
              {/* Search Icon */}
              <div className="absolute right-2 top-[73%] transform -translate-y-1/2">
                <Search
                  strokeWidth="2px"
                  color="#5B5B5B"
                  size="17px"
                  className="text-gray-600"
                />
              </div>
            </div>
            {/* Add Now Button */}
            <button
              className="px-4 py-1 w-[89px] h-[28px]  mt-[25px] rounded-[5px] bg-[#F9C301] font-body text-[#111102] hover:bg-yellow-500 text-[12px] "
              // onClick={() => setIsModalOpen(true)}
            >
              Add now
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-tl-[10px] rounded-tr-[10px]">
          <table className="w-full border-collapse ">
            <thead>
              <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500] ">
                <th className="border border-r-2 border-b-2 border-white  py-2 px-1">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Product Code
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Name
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Main Category
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Brand
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Model
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
                  <td className="border border-r-2 border-b-2  border-[#F8F8F8]   py-2 text-center">
                    {vendor.no}
                  </td>
                  <td className="border border-r-2 border-b-2  border-[#F8F8F8] pl-7  py-2 ">
                    {vendor.pcode}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7  py-2 ">
                    {vendor.name}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {vendor.mcategory}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {vendor.brand}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {vendor.model}
                  </td>
                  <td className="grid grid-cols-2 text-center w-full h-full">
                    <button
                      className="bg-[#D1D1D1] border-r-2 border-white  py-3  text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 "
                      // onClick={() => setIsModalOpen2(true)}
                    >
                      View
                    </button>
                    <button
                      className="bg-[#D1D1D1]  py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 "
                      // onClick={() => setIsModalOpen3(true)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing 1-{entries} of {entries} Entries
        </div>

        {/* <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ViewProductModal
        isOpen={isModalOpen2}
        onClose={() => setIsModalOpen2(false)}
      />

      <DeleteTableItemAlert
        isOpen={isModalOpen3}
        onClose={() => setIsModalOpen3(false)}
        onConfirm={handleConfirmAlert}
      /> */}
      </div>
    </VendorLayout>
  );
};
export default VendorProducts;
