"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardCheck, CirclePlus } from "lucide-react";
import Image from "next/image";

import { CarImage1 } from "@/assets/Images";
import {
  OpenChatConfirmationModal,
  TabLayout,
  ViewQuotationRequestModal,
  ViewQuotationModal,
  DeleteItemConfirmation,
} from "@/components";
import withAuth from "@/components/authGuard/withAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { useRouter } from "next/navigation";
import {
  FirestoreService,
  COLLECTIONS,
  QuotationRequest,
  Quotation,
} from "@/service/firestoreService";
import * as Dialog from "@radix-ui/react-dialog";
import { BankDetailsRequiredModal } from "./BankDetailsRequiredModal";
import { useRefactoredId } from "@/components/hooks/useRefactoredId";
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(
    null
  );

  const [filter, setFilter] = useState<string>("New Quotations Requested");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [vendorQuotations, setVendorQuotations] = useState<Quotation[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<QuotationRequest | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [currentRequestImages, setCurrentRequestImages] = useState<string[]>(
    []
  );
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;
  const [bankModalOpen, setBankModalOpen] = useState(false);

  const router = useRouter();

  const hasBankDetails = (v: any) => {
    const bankName = (v?.bankName || "").trim();
    const bankBranch = (v?.bankBranch || "").trim();
    const accountName = (v?.accountName || "").trim();
    const accountNumber = (v?.accountNumber || "").trim();
    return !!(bankName && bankBranch && accountName && accountNumber);
  };

  const ensureVendorBankDetails = async () => {
    if (!currentUser?.id) return false;

    const vendorDoc: any = await FirestoreService.getById(
      COLLECTIONS.VENDORS,
      currentUser.id
    );

    const bankOk =
      vendorDoc?.bankName &&
      vendorDoc?.bankBranch &&
      vendorDoc?.accountName &&
      vendorDoc?.accountNumber;

    if (bankOk) return true;

    setBankModalOpen(true);
    return false;
  };

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
          FirestoreService.getAll<Quotation>(COLLECTIONS.QUOTATIONS, [
            { field: "vendorId", operator: "==", value: currentUser.id },
          ]),
        ]);
        const toMs = (t: any) =>
          t?.seconds
            ? t.seconds * 1000 + (t.nanoseconds || 0) / 1e6
            : t instanceof Date
            ? t.getTime()
            : 0;
        const sorted = [...reqs].sort(
          (a: any, b: any) => toMs(b?.createdAt) - toMs(a?.createdAt)
        );
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
  }, [currentUser?.id, reloadToken]);

  const handleQuotationSubmitted = () => {
    setIsModalOpen2(false);
    setReloadToken((t) => t + 1);
  };

  const handleDeleteQuotation = async () => {
    if (!quotationToDelete) return;

    try {
      const quotationToRemove = vendorQuotations.find(
        (q: any) => q.quotationRequestId === quotationToDelete
      );

      if (quotationToRemove?.id) {
        await FirestoreService.delete(
          COLLECTIONS.QUOTATIONS,
          quotationToRemove.id
        );
        setIsDeleteModalOpen(false);
        setQuotationToDelete(null);
        setReloadToken((t) => t + 1);
      }
    } catch (error) {
      console.error("Failed to delete quotation:", error);
      alert("Failed to delete quotation. Please try again.");
    }
  };

  const requestRows = useMemo(() => {
    const quotedRequestIds = new Set(
      (vendorQuotations || []).map((q: any) => q.quotationRequestId)
    );
    return (requests || []).map((r: any) => {
      const createdAt = r?.createdAt;
      const d = createdAt?.seconds
        ? new Date(createdAt.seconds * 1000)
        : createdAt instanceof Date
        ? createdAt
        : null;
      return {
        id: r.id,
        cname: r.buyerName || "-",
        mcategory: "-",
        vtype: r.vehicleType || "-",
        vbrand: r.country || "-",
        image: (r.attachedImages && r.attachedImages[0]) || CarImage1.src,
        minformation: "Click to View",
        date: d ? d.toLocaleDateString() : "-",
        qrequests: quotedRequestIds.has(r.id)
          ? "Quotations Sent"
          : "New Quotations Requested",
        raw: r as QuotationRequest,
      };
    });
  }, [requests, vendorQuotations]);

  const filteredVendors = useMemo(() => {
    const list = (
      filter
        ? requestRows.filter((row) => row.qrequests === filter)
        : requestRows
    ).filter((row) => {
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

  const newQuotationsCount = useMemo(
    () =>
      requestRows.filter((r) => r.qrequests === "New Quotations Requested")
        .length,
    [requestRows]
  );
  const quotationsSentCount = useMemo(
    () => requestRows.filter((r) => r.qrequests === "Quotations Sent").length,
    [requestRows]
  );

  // const handleImageClick = (imageSrc: string) => {
  //   setPopupImage(imageSrc);
  // };
  const handleImageClick = (request: QuotationRequest) => {
    if (request.attachedImages && request.attachedImages.length > 0) {
      setCurrentRequestImages(request.attachedImages);
      setSelectedImageIndex(0);
    }
  };

  // const closePopup = () => {
  //   setPopupImage(null);
  // };

  // const handleConfirmChat = () => {
  //   console.log("Chat confirmed!");
  //   setIsModalOpen2(false);
  // };

  // const handleDeleteQuotation = () => {
  //   console.log("Quotation Deleted!");
  //   setIsModalOpen4(false);
  // };

  function normalizeSriLankaPhone(raw?: string): string | null {
    if (!raw) return null;
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("94") && digits.length === 11) return digits;
    if (digits.startsWith("0") && digits.length === 10)
      return "94" + digits.slice(1);
    if (digits.length === 9) return "94" + digits;
    return null;
  }

  async function upsertChatRoomForQuotationRequest(args: {
    requestId: string;
    buyerId: string;
    vendorId: string;
    buyerPhone: string;
    vendorPhone: string;
  }) {
    const refCode = `RC-${args.requestId}`;

    const existing = await FirestoreService.getAll<any>(
      COLLECTIONS.CHAT_ROOMS,
      [
        { field: "refCode", operator: "==", value: refCode },
        { field: "status", operator: "==", value: "open" },
      ]
    );

    if (existing?.[0]) return existing[0];

    const id = await FirestoreService.create<any>(COLLECTIONS.CHAT_ROOMS, {
      contextType: "QUOTATION_REQUEST",
      contextId: args.requestId,
      refCode,
      buyerId: args.buyerId,
      vendorId: args.vendorId,
      buyerPhone: args.buyerPhone,
      vendorPhone: args.vendorPhone,
      status: "open",
      isActive: true,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    });

    return { id, refCode };
  }

  function openMediatorWhatsApp(refCode: string, message: string) {
    const businessRaw = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER;
    if (!businessRaw)
      throw new Error("Missing NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER");

    const business = businessRaw.replace(/\D/g, ""); // wa.me needs digits only
    const url = `https://wa.me/${business}?text=${encodeURIComponent(
      `${message}\n\nRef: ${refCode}`
    )}`;
    window.open(url, "_blank");
  }

  return (
    <TabLayout type="vendor">
      <div
        className={`w-full lg:p-8 md:p-6  p-4 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] ${
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

        <div className="flex md:flex-row flex-col md:items-center md:justify-between space-y-4 sm:space-y-0  mb-4">
          <div className="flex sm:flex-row flex-col">
            <div className="sm:mb-0 mb-4">
              <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1">
                Show
              </div>
              <div className="flex space-x-4">
                <select
                  className="rounded-[5px] px-3 font-body  text-sm text-gray-600 w-[131px] h-[32px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  onChange={(e) => setEntries(Number(e.target.value))}
                  defaultValue="5"
                >
                  <option value="5">5 Entries</option>
                  <option value="10">10 Entries</option>
                  <option value="20">20 Entries</option>
                </select>
              </div>
            </div>
            <div className="sm:ml-10 ">
              <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1 ">
                Quotations
              </div>
              <div className="flex space-x-4">
                <select
                  className="rounded-[5px] px-3 font-body  text-sm text-gray-600 w-auto h-[32px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
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
            <div className="relative flex items-center rounded-[5px] text-sm text-gray-600 w-[263px] h-[32px]">
              <input
                type="text"
                placeholder="Search"
                className="w-full h-full pl-3 pr-8 font-body rounded-[5px] text-sm text-gray-600 outline-none focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
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
          <table className="w-full border-collapse min-w-[750px] overflow-x-auto">
            <thead>
              <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500] ">
                <th className="border border-r-2 border-b-2 border-white px-1  py-2 ">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Customer Name
                </th>
                {/* <th className="border border-r-2 border-b-2 border-white py-2">
                  Main Category
                </th> */}
                <th className="border border-r-2 border-b-2 border-white  py-2">
                  Vehicle Type
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Vehicle Brand
                </th>
                <th className="border border-r-2 border-b-2 border-white  py-2">
                  Vehicle Model
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
                <tr>
                  <td className="px-4 py-3" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td className="px-4 py-3" colSpan={8}>
                    No requests found.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor, index) => (
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
                    {/* <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {vendor.mcategory}
                    </td> */}
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {vendor.vtype}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {vendor.vbrand}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                      {vendor.raw.model}
                    </td>

                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {vendor.date}
                    </td>

                    {vendor.qrequests === "New Quotations Requested" ? (
                      <>
                        <td className="grid grid-cols-2 gap-1 text-center w-full h-full">
                          <button
                            className="bg-[#D1D1D1] py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500"
                            onClick={async () => {
                              setSelectedRequest(vendor.raw);

                              const ok = await ensureVendorBankDetails();
                              if (!ok) return;

                              setIsModalOpen2(true);
                            }}
                          >
                            Quotation
                          </button>
                          <button
                            className="bg-[#D1D1D1] py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500"
                            onClick={() => {
                              setSelectedRequest(vendor.raw);
                              setIsModalOpen(true);
                            }}
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
                              const quote = vendorQuotations.find(
                                (q: any) =>
                                  q.quotationRequestId === vendor.raw.id
                              );
                              setSelectedQuotation(quote || null);
                              setIsQuoteModalOpen(true);
                            }}
                          >
                            Quotation
                          </button>
                          <button
                            className="bg-[#D1D1D1] py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500"
                            onClick={() => {
                              setSelectedRequest(vendor.raw);
                              setIsModalOpen(true);
                            }}
                          >
                            Chat
                          </button>
                          <button
                            className="bg-[#D1D1D1] py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500"
                            onClick={() => {
                              setQuotationToDelete(vendor.raw.id);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing 1-{Math.min(entries, requestRows.length)} of{" "}
          {requestRows.length} Entries
        </div>

        <ViewQuotationRequestModal
          isOpen={isModalOpen2}
          onClose={() => setIsModalOpen2(false)}
          request={selectedRequest}
          onSubmitted={handleQuotationSubmitted}
        />

        <ViewQuotationModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          quotation={selectedQuotation as any}
        />

        <OpenChatConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          person="buyer"
          onConfirm={async () => {
            if (!selectedRequest) {
              alert("No request selected for chat.");
              setIsModalOpen(false);
              return;
            }

            try {
              const vendorPhoneRaw =
                currentUser?.whatsApp ||
                currentUser?.phone ||
                currentUser?.mobileNumber ||
                "";
              const vendorPhone = normalizeSriLankaPhone(vendorPhoneRaw);

              if (!vendorPhone) {
                alert(
                  "Your phone / WhatsApp number is missing. Please update your profile."
                );
                return;
              }

              let buyerPhoneRaw =
                (selectedRequest as any).buyerPhone ||
                (selectedRequest as any).whatsApp ||
                (selectedRequest as any).phone ||
                "";

              if (!buyerPhoneRaw && (selectedRequest as any).buyerId) {
                const buyer: any = await FirestoreService.getById(
                  COLLECTIONS.USERS,
                  (selectedRequest as any).buyerId
                );
                buyerPhoneRaw =
                  buyer?.whatsApp || buyer?.phone || buyer?.mobileNumber || "";
              }

              const buyerPhone = normalizeSriLankaPhone(buyerPhoneRaw);
              if (!buyerPhone) {
                alert("Buyer phone / WhatsApp number is not available.");
                return;
              }

              const room = await upsertChatRoomForQuotationRequest({
                requestId: (selectedRequest as any).id,
                buyerId: (selectedRequest as any).buyerId,
                vendorId: currentUser.id,
                buyerPhone,
                vendorPhone,
              });

              const vendorName =
                `${currentUser?.firstName || ""} ${
                  currentUser?.lastName || ""
                }`.trim() ||
                currentUser?.companyName ||
                "Vendor";

              const msg = `
Hi AutoOnline.lk,

This is ${vendorName}.

I need to chat regarding this price request:
Request Code: ${useRefactoredId("RC", (selectedRequest as any).id) || "-"}
Vehicle Type: ${selectedRequest.vehicleType || "-"}
Brand/Model: ${selectedRequest.brand || ""} ${selectedRequest.model || ""}
`.trim();

              openMediatorWhatsApp(room.refCode, msg);
            } catch (e) {
              console.error(
                "[NewPriceRequests] Failed to open mediator chat:",
                e
              );
              alert("Failed to open WhatsApp chat. Please try again.");
            } finally {
              setIsModalOpen(false);
            }
          }}
        />

        <DeleteItemConfirmation
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setQuotationToDelete(null);
          }}
          onConfirm={handleDeleteQuotation}
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

      {/* Image Lightbox Modal */}
      {selectedImageIndex !== null && currentRequestImages.length > 0 && (
        <Dialog.Root
          open={true}
          onOpenChange={() => setSelectedImageIndex(null)}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] md:w-auto md:max-w-[90vw] max-h-[90vh] focus:outline-none z-50 px-4 md:px-0">
              <Dialog.Title></Dialog.Title>
              <div className="relative flex flex-col items-center">
                {/* Main Image */}
                <Image
                  src={currentRequestImages[selectedImageIndex]}
                  alt={`Full size image ${selectedImageIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-[90vw] max-h-[85vh] w-auto h-auto rounded-lg object-contain"
                />

                {/* Image Counter */}
                <div className="absolute top-2 md:-top-12 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 md:px-4 py-1 md:py-2 rounded-full text-[10px] md:text-[12px] font-body z-10">
                  {selectedImageIndex + 1} / {currentRequestImages.length}
                </div>

                {/* Navigation Buttons */}
                {currentRequestImages.length > 1 && (
                  <>
                    {/* Previous Button */}
                    {selectedImageIndex > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex(selectedImageIndex - 1);
                        }}
                        className="absolute left-2 md:-left-14 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#F9C301] text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all z-10 text-lg md:text-xl"
                      >
                        ‹
                      </button>
                    )}

                    {/* Next Button */}
                    {selectedImageIndex < currentRequestImages.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex(selectedImageIndex + 1);
                        }}
                        className="absolute right-2 md:-right-14 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#F9C301] text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all z-10 text-lg md:text-xl"
                      >
                        ›
                      </button>
                    )}
                  </>
                )}

                {/* Close Button */}
                <Dialog.Close asChild>
                  <button
                    onClick={() => setSelectedImageIndex(null)}
                    className="absolute top-2 right-2 md:-top-12 md:-right-12 bg-black/70 hover:bg-red-500 text-white w-8 h-8 md: w-10 md:h-10 rounded-full flex items-center justify-center transition-all z-10"
                  >
                    <CirclePlus className="w-4 h-4 md:w-5 md:h-5 rotate-45" />
                  </button>
                </Dialog.Close>

                {/* Thumbnail Strip */}
                {currentRequestImages.length > 1 && (
                  <div className="absolute -bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 bg-black/70 p-1. 5 md:p-2 max-w-[90vw] overflow-x-auto no-scrollbar">
                    {currentRequestImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 overflow-hidden border-2 transition-all ${
                          idx === selectedImageIndex
                            ? "border-[#F9C301] scale-110"
                            : "border-white/30 hover:border-white/60"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      <BankDetailsRequiredModal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        onConfirm={() => {
          setBankModalOpen(false);
          router.push("/vendor/profile");
        }}
      />
    </TabLayout>
  );
};
export default withAuth(NewPriceRequests);
