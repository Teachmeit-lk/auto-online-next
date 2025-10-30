"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import Image from "next/image";

import { CarImage1 } from "@/assets/Images";
import {
  OpenChatConfirmationModal,
  TabLayout,
  ViewQuotationRequestModal,
  ViewQuotationModal,
} from "@/components";
import withAuth from "@/components/authGuard/withAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { FirestoreService, COLLECTIONS, QuotationRequest, Quotation } from "@/service/firestoreService";
// import {
//   DeleteQuotationModalAlert,
//   NewPriceChatAlert,
//   RequestedQuotationModal,
//   SentQuotationModal,
// } from "@/app/modal";

const NewPriceRequests: React.FC = () => {
  const [entries, setEntries] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  // const [isModalOpen3, setIsModalOpen3] = useState(false);
  // const [isModalOpen4, setIsModalOpen4] = useState(false);

  const [popupImage, setPopupImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("New Quotations Requested");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [vendorQuotations, setVendorQuotations] = useState<Quotation[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.id) return;
      setLoading(true);
      try {
        const [reqs, quotes] = await Promise.all([
          FirestoreService.getAll<QuotationRequest>(
            COLLECTIONS.QUOTATION_REQUESTS,
            [{ field: "vendorId", operator: "==", value: currentUser.id }]
          ),
          FirestoreService.getAll<Quotation>(
            COLLECTIONS.QUOTATIONS,
            [{ field: "vendorId", operator: "==", value: currentUser.id }]
          ),
        ]);
        const toMs = (t: any) => t?.seconds ? (t.seconds * 1000 + (t.nanoseconds || 0) / 1e6) : (t instanceof Date ? t.getTime() : 0);
        const sorted = [...reqs].sort((a: any, b: any) => (toMs(b?.createdAt) - toMs(a?.createdAt)));
        setRequests(sorted);
        setVendorQuotations(quotes);
      } catch (e) {
        console.error("Failed to load vendor price requests", e);
        setRequests([]);
        setVendorQuotations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?.id]);

  const requestRows = useMemo(() => {
    const quotedRequestIds = new Set((vendorQuotations || []).map((q: any) => q.quotationRequestId));
    return (requests || []).map((r: any) => {
      const createdAt = r?.createdAt;
      const d = createdAt?.seconds ? new Date(createdAt.seconds * 1000) : (createdAt instanceof Date ? createdAt : null);
      return {
        id: r.id,
        cname: r.buyerName || "-",
        mcategory: "-",
        vtype: r.vehicleType || "-",
        vbrand: r.country || "-",
        image: (r.attachedImages && r.attachedImages[0]) || CarImage1.src,
        minformation: "Click to View",
        date: d ? d.toLocaleDateString() : "-",
        qrequests: quotedRequestIds.has(r.id) ? "Quotations Sent" : "New Quotations Requested",
        raw: r as QuotationRequest,
      };
    });
  }, [requests, vendorQuotations]);

  const filteredVendors = useMemo(() => {
    const list = (filter
      ? requestRows.filter((row) => row.qrequests === filter)
      : requestRows).filter((row) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          row.cname.toLowerCase().includes(q) ||
          row.vtype.toLowerCase().includes(q) ||
          row.vbrand.toLowerCase().includes(q)
        );
      });
    return list.slice(0, entries);
  }, [requestRows, filter, search, entries]);

  const newQuotationsCount = useMemo(() => requestRows.filter((r) => r.qrequests === "New Quotations Requested").length, [requestRows]);
  const quotationsSentCount = useMemo(() => requestRows.filter((r) => r.qrequests === "Quotations Sent").length, [requestRows]);

  const handleImageClick = (imageSrc: string) => {
    setPopupImage(imageSrc);
  };

  const closePopup = () => {
    setPopupImage(null);
  };

  // const handleConfirmChat = () => {
  //   console.log("Chat confirmed!");
  //   setIsModalOpen2(false);
  // };

  // const handleDeleteQuotation = () => {
  //   console.log("Quotation Deleted!");
  //   setIsModalOpen4(false);
  // };

  return (
    <TabLayout type="vendor">
      <div
        className={`w-full p-8 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] ${
          newQuotationsCount < 3 ||
          (quotationsSentCount < 3 &&
            newQuotationsCount > 0 &&
            quotationsSentCount > 0)
            ? "mb-[94px]"
            : ""
        }     ${
          newQuotationsCount == 0 || quotationsSentCount == 0
            ? "mb-[164px]"
            : ""
        }`}
        id="quotationrequests"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          New Price Requests
        </h1>

        <div className="flex flex-row items-center justify-between  mb-4">
          <div className="flex flex-row">
            <div>
              <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1">
                Show
              </div>
              <div className="flex space-x-4">
                <select
                  className="rounded-[5px] px-3 font-body  text-[12px] text-gray-600 w-[131px] h-[28px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  onChange={(e) => setEntries(Number(e.target.value))}
                  defaultValue="5"
                >
                  <option value="5">5 Entries</option>
                  <option value="10">10 Entries</option>
                  <option value="20">20 Entries</option>
                </select>
              </div>
            </div>
            <div className="ml-10">
              <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1 ">
                Quotations
              </div>
              <div className="flex space-x-4">
                <select
                  className="rounded-[5px] px-3 font-body  text-[12px] text-gray-600 w-auto h-[28px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  onChange={(e) => setFilter(e.target.value)}
                  defaultValue="New Quotations Requested"
                >
                  <option value="New Quotations Requested">
                    New Quotations Requested
                  </option>
                  <option value="Quotations Sent">Quotations Sent</option>
                </select>
              </div>
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
                className="w-full h-full pl-3 pr-8 font-body rounded-[5px] text-[12px] text-gray-600 outline-none focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                <th className="border border-r-2 border-b-2 border-white px-1  py-2 ">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Customer Name
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Main Category
                </th>
                <th className="border border-r-2 border-b-2 border-white  py-2">
                  Vehicle Type
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Vehicle Brand
                </th>
                <th className="border border-r-2 border-b-2 border-white  py-2">
                  More Information
                </th>
                <th className="border border-r-2 border-b-2 border-white  py-2">
                  Date
                </th>
                <th className="border px-1 py-2 border-b-1 border-white flex items-center justify-center space-x-2">
                  <ClipboardCheck size="19px" />
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-3" colSpan={8}>Loading...</td></tr>
              ) : filteredVendors.length === 0 ? (
                <tr><td className="px-4 py-3" colSpan={8}>No requests found.</td></tr>
              ) : filteredVendors.map((vendor, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 bg-white text-[12px] font-body text-[#111102] "
                >
                  <td className="border border-r-2 border-b-2  border-[#F8F8F8]   py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {vendor.cname}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {vendor.mcategory}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {vendor.vtype}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {vendor.vbrand}
                  </td>
                  <td
                    className="border border-r-2 border-b-2 border-[#F8F8F8] text-center py-2 text-[8px] cursor-pointer"
                    onClick={() => handleImageClick(vendor.image)}
                  >
                    <div className="flex justify-center">
                      <Image
                        src={vendor.image}
                        alt="carImage"
                        width={62}
                        height={32}
                        className="h-[32px] w-[62px] object-contain"
                      />
                    </div>
                    {vendor.minformation}
                  </td>

                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {vendor.date}
                  </td>

                  {vendor.qrequests === "New Quotations Requested" ? (
                    <>
                      <td className="grid grid-cols-2 gap-1 text-center w-full h-full">
                        <button
                          className="bg-[#D1D1D1] py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500"
                          onClick={() => { setSelectedRequest(vendor.raw); setIsModalOpen2(true); }}
                        >
                          Quotation
                        </button>
                        <button
                          className="bg-[#D1D1D1] py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500"
                          onClick={() => setIsModalOpen(true)}
                        >
                          Chat
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="grid grid-cols-3 gap-1 text-center w-full h-full">
                        <button
                          className="bg-[#D1D1D1] py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500"
                          onClick={() => {
                            const quote = vendorQuotations.find((q: any) => q.quotationRequestId === vendor.raw.id);
                            setSelectedQuotation(quote || null);
                            setIsQuoteModalOpen(true);
                          }}
                        >
                          Quotation
                        </button>
                        <button
                          className="bg-[#D1D1D1] py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500"
                          // onClick={() => setIsModalOpen(true)}
                        >
                          Chat
                        </button>

                        <button
                          className="bg-[#D1D1D1] py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500"
                          // onClick={() => setIsModalOpen4(true)}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {popupImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closePopup}
          >
            <div className="relative h-[400px] w-[500px]">
              <Image
                src={popupImage}
                alt="Popup Image"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing 1-{Math.min(entries, requestRows.length)} of {requestRows.length} Entries
        </div>

        <ViewQuotationRequestModal
          isOpen={isModalOpen2}
          onClose={() => setIsModalOpen2(false)}
          request={selectedRequest}
        />

      <ViewQuotationModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        quotation={selectedQuotation as any}
      />

        <OpenChatConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            alert("in development");
            setIsModalOpen(false);
          }}
        />

        {/* <NewPriceChatAlert
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmChat}
      />


      <SentQuotationModal
        isOpen={isModalOpen3}
        onClose={() => setIsModalOpen3(false)}
      />

      <DeleteQuotationModalAlert
        isOpen={isModalOpen4}
        onClose={() => setIsModalOpen4(false)}
        onConfirm={handleDeleteQuotation}
      /> */}
      </div>
    </TabLayout>
  );
};
export default withAuth(NewPriceRequests);
