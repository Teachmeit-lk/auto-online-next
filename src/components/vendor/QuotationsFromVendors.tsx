"use client";

import React, { useState, useEffect } from "react";
import { Search, ClipboardCheck } from "lucide-react";

// import { EstimateModal,AlertModal, ChatModal } from "@/app/modal";

interface Vendor {
  no: number;
  rcode: string;
  vcode: string;
  cname: string;
  pname: string;
  idate: string;
  status: string;
}

export const QuotationsFromVendors: React.FC = () => {
  const [entries, setEntries] = useState(5);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  // const [isModalOpen1, setIsModalOpen1] = useState(false);
  // const [isModalOpen2, setIsModalOpen2] = useState(false);
  // const [isModalOpen3, setIsModalOpen3] = useState(false);

  useEffect(() => {
    const generatedVendors = Array.from({ length: entries }, (_, i) => ({
      no: i + 1,
      rcode: "83356245921",
      vcode: "VD6464512",
      cname: "NMK Motors",
      pname: "NMK Motors",
      idate: "November 13, 2024",
      status: Math.random() > 0.5 ? "Pending" : "Finished",
    }));
    setVendors(generatedVendors);
  }, [entries]);

  // const handleConfirmAlert = () => {
  //   console.log("Estimate confirmed!");
  //   setIsModalOpen3(false);
  // };

  // const handleConfirmChat = () => {
  //   console.log("Chat confirmed!");
  //   setIsModalOpen2(false);
  // };

  return (
    <div
      className="w-full p-8 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] "
      id="quotationsfromvendors"
    >
      <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
        Quotations from Vendors
      </h1>

      <div className="flex flex-row items-center justify-between  mb-4">
        <div>
          <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1">
            Show
          </div>
          <div className="flex space-x-4">
            <select
              className="rounded-[5px] px-3 text-[12px] font-body text-gray-600 w-[131px] h-[28px]"
              onChange={(e) => setEntries(Number(e.target.value))}
              defaultValue="5"
            >
              <option value="5">5 Entries</option>
              <option value="10">10 Entries</option>
              <option value="20">20 Entries</option>
            </select>
          </div>
        </div>

        <div>
          <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1">
            Search
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-tl-[10px] rounded-tr-[10px]">
        <table className="w-full border-collapse ">
          <thead>
            <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500] ">
              <th className="border border-r-2 border-b-2 border-white px-2  py-2 ">
                No.
              </th>
              <th className="border border-r-2 border-b-2  border-white  py-2">
                Requested Code
              </th>
              <th className="border border-r-2 border-b-2 border-white py-2">
                Vendor Code
              </th>
              <th className="border border-r-2 border-b-2 border-white  py-2">
                Company Name
              </th>
              <th className="border border-r-2 border-b-2 border-white py-2">
                Part Name
              </th>
              <th className="border border-r-2 border-b-2 border-white  py-2">
                Issued Date
              </th>
              <th className="border border-r-2 border-b-2 border-white  py-2">
                Status
              </th>
              <th className="border px-1 py-2 border-b-1 border-white flex items-center justify-center space-x-2">
                <ClipboardCheck size="19px" />
                <span>Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 bg-white text-[12px] text-[#111102] font-body"
              >
                <td className="border border-r-2 border-b-2  border-[#F8F8F8]  py-2 text-center">
                  {vendor.no}
                </td>
                <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                  {vendor.rcode}
                </td>
                <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                  {vendor.vcode}
                </td>
                <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                  {vendor.cname}
                </td>
                <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                  {vendor.pname}
                </td>
                <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                  {vendor.idate}
                </td>
                <td
                  className={`border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ${
                    vendor.status === "Pending"
                      ? "text-[#F9C301]"
                      : "text-blue-600"
                  }`}
                >
                  {vendor.status}
                </td>

                <td className="grid grid-cols-3 text-center w-full h-full font-body">
                  <button
                    className="bg-[#D1D1D1]  border-r-2 px-1 py-3 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500 active:bg-yellow-500 focus:hover:bg-yellow-500"
                    // onClick={() => setIsModalOpen1(true)}
                  >
                    View
                  </button>
                  <button
                    className="bg-[#D1D1D1] px-1 py-3 border-x-2 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500 active:bg-yellow-500 focus:hover:bg-yellow-500"
                    // onClick={() => setIsModalOpen2(true)}
                  >
                    Chat
                  </button>
                  <button
                    className="bg-[#D1D1D1] px-1 border-l-2 py-3 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500 active:bg-yellow-500 focus:hover:bg-yellow-500"
                    // onClick={() => setIsModalOpen3(true)}
                  >
                    Confirm
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

      {/* <EstimateModal
        isOpen={isModalOpen1}
        onClose={() => setIsModalOpen1(false)}
      />
      <ChatModal
        isOpen={isModalOpen2}
        onClose={() => setIsModalOpen2(false)}
        onConfirm={handleConfirmChat}
      />

      <AlertModal
        isOpen={isModalOpen3}
        onClose={() => setIsModalOpen3(false)}
        onConfirm={handleConfirmAlert}
      /> */}
    </div>
  );
};
