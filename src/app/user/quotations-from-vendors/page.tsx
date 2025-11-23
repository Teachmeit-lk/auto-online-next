"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import {
  CreatePurchaseOrderModal,
  OpenChatConfirmationModal,
  TabLayout,
  ViewQuotationModal,
} from "@/components";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
  FirestoreService,
  COLLECTIONS,
  Quotation,
} from "@/service/firestoreService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

const QuotationsFromVendors: React.FC = () => {
  const [entries, setEntries] = useState(5);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [openChatOpenConfirmation, setOpenChatOpenConfirmation] =
    useState(false);
  const [openQuotationConfirmation, setOpenQuotationConfirmation] =
    useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null
  );
  const [requestImageUrl, setRequestImageUrl] = useState<string | null>(null);
  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;

  const loadRequestImage = async (quotationRequestId?: string | null) => {
    if (!quotationRequestId) {
      setRequestImageUrl(null);
      return;
    }

    try {
      const ref = doc(db, "quotationRequests", quotationRequestId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setRequestImageUrl(null);
        return;
      }

      const data = snap.data() as any;
      const firstImage =
        Array.isArray(data.attachedImages) && data.attachedImages.length > 0
          ? data.attachedImages[0]
          : null;

      setRequestImageUrl(firstImage || null);
    } catch (e) {
      console.error("Failed to load quotationRequest image", e);
      setRequestImageUrl(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.id) return;
      setLoading(true);
      try {
        const list = await FirestoreService.getAll<Quotation>(
          COLLECTIONS.QUOTATIONS,
          [{ field: "buyerId", operator: "==", value: currentUser.id }]
        );
        const toMs = (t: any) =>
          t?.seconds
            ? t.seconds * 1000 + (t.nanoseconds || 0) / 1e6
            : t instanceof Date
            ? t.getTime()
            : 0;
        const sorted = [...list].sort(
          (a: any, b: any) => toMs(b?.createdAt) - toMs(a?.createdAt)
        );
        setQuotations(sorted);
      } catch (e) {
        console.error("Failed to load quotations", e);
        setQuotations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?.id]);

  const rows = useMemo(() => {
    return (quotations || []).map((q) => {
      const createdAt: any = (q as any).createdAt;
      const d = createdAt?.seconds
        ? new Date(createdAt.seconds * 1000)
        : createdAt instanceof Date
        ? createdAt
        : null;
      const idate = d ? d.toLocaleDateString() : "-";
      const pname = (q.products && q.products[0]?.partName) || "-";
      return {
        id: (q as any).id,
        rcode: q.quotationRequestId,
        vcode: q.vendorId,
        cname: q.vendorName || "-",
        pname,
        idate,
        status: q.status,
        raw: q,
      };
    });
  }, [quotations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows
      .filter(
        (r) =>
          !q ||
          r.rcode.toLowerCase().includes(q) ||
          r.vcode.toLowerCase().includes(q) ||
          r.cname.toLowerCase().includes(q) ||
          r.pname.toLowerCase().includes(q)
      )
      .slice(0, entries);
  }, [rows, search, entries]);

  return (
    <TabLayout type="user">
      <div
        className="w-full lg:p-8 md:p-6  p-4 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] "
        id="quotationsfromvendors"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          Quotations from Vendors
        </h1>

        <div className="flex sm:flex-row flex-col sm:items-center sm:justify-between space-y-4 sm:space-y-0  mb-4">
          <div>
            <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1">
              Show
            </div>
            <div className="flex space-x-4">
              <select
                className="rounded-[5px] px-3 text-sm font-body text-gray-600 w-[131px] h-[32px]"
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
            <div className="relative flex items-center rounded-[5px] text-sm text-gray-600 w-[263px] h-[32px]">
              <input
                type="text"
                placeholder="Search"
                className="w-full h-full pl-3 pr-8 rounded-[5px] text-sm font-body text-gray-600 outline-none focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
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
                <th className="border border-r-2 border-b-2 border-white px-2  py-2 ">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Requested Code
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Vendor Code
                </th>
                <th className="border border-r-2 min-w-[150px] border-b-2 border-white  py-2">
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
                <th className="border min-w-[200px] px-1 py-2 border-b-1 border-white flex items-center justify-center space-x-2">
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-3" colSpan={8}>
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filtered.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="hover:bg-gray-50 bg-white text-[12px] text-[#111102] font-body"
                  >
                    <td className="border border-r-2 border-b-2  border-[#F8F8F8]  py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {row.rcode}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {row.vcode}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {row.cname}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {row.pname}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {row.idate}
                    </td>
                    <td
                      className={`border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ${
                        row.status === "pending"
                          ? "text-[#F9C301]"
                          : row.status === "accepted"
                          ? "text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      {row.status}
                    </td>

                    <td className="grid grid-cols-3 text-center w-full h-full font-body">
                      <button
                        className="bg-[#D1D1D1]  border-r-2 px-1 py-3 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500 active:bg-yellow-500 focus:hover:bg-yellow-500"
                        onClick={() => {
                          setSelectedQuotation(row.raw);
                          setViewOpen(true);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="bg-[#D1D1D1] px-1 py-3 border-x-2 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500 active:bg-yellow-500 focus:hover:bg-yellow-500"
                        onClick={() => setOpenChatOpenConfirmation(true)}
                      >
                        Chat
                      </button>
                      <button
                        disabled={row.status === "accepted"}
                        className={`${
                          row.status === "accepted"
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-[#D1D1D1] hover:bg-yellow-500 active:bg-yellow-500 focus:hover:bg-yellow-500"
                        } px-1 border-l-2 py-3 border-[#F8F8F8] text-[12px] w-full h-full`}
                        onClick={async () => {
                          if (row.status === "accepted") return;

                          console.log(
                            "[QuotationsFromVendors] Opening CreatePurchaseOrderModal for quotation:",
                            row.id
                          );

                          setSelectedQuotation(row.raw);

                          await loadRequestImage(row.raw.quotationRequestId);
                          setOpenQuotationConfirmation(true);
                        }}
                      >
                        Confirm
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing 1-{Math.min(entries, rows.length)} Entries
        </div>
      </div>
      <ViewQuotationModal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        quotation={selectedQuotation as any}
        onOpenPurchaseOrder={async (quotation) => {
          console.log("[QuotationsFromVendors] Opening CreatePurchaseOrderModal from ViewQuotationModal");
          setSelectedQuotation(quotation);
          await loadRequestImage(quotation?.quotationRequestId);
          setOpenQuotationConfirmation(true);
        }}
      />
      <OpenChatConfirmationModal
        isOpen={openChatOpenConfirmation}
        onClose={() => setOpenChatOpenConfirmation(false)}
        onConfirm={() => {
          alert("In development");
          setOpenChatOpenConfirmation(false);
        }}
      />
      <CreatePurchaseOrderModal
        isOpen={openQuotationConfirmation}
        requestImageUrl={requestImageUrl}
        onClose={() => {
          console.log(
            "[QuotationsFromVendors] Closing CreatePurchaseOrderModal"
          );
          setOpenQuotationConfirmation(false);
        }}
        quotation={selectedQuotation}
        onSuccess={() => {
          console.log(
            "[QuotationsFromVendors] Purchase order created successfully, refreshing list"
          );
          // Reload quotations list
          const load = async () => {
            if (!currentUser?.id) return;
            try {
              const list = await FirestoreService.getAll<Quotation>(
                COLLECTIONS.QUOTATIONS,
                [{ field: "buyerId", operator: "==", value: currentUser.id }]
              );
              const toMs = (t: any) =>
                t?.seconds
                  ? t.seconds * 1000 + (t.nanoseconds || 0) / 1e6
                  : t instanceof Date
                  ? t.getTime()
                  : 0;
              const sorted = [...list].sort(
                (a: any, b: any) => toMs(b?.createdAt) - toMs(a?.createdAt)
              );
              setQuotations(sorted);
            } catch (e) {
              console.error("Failed to reload quotations", e);
            }
          };
          load();
          setOpenQuotationConfirmation(false);
        }}
      />
    </TabLayout>
  );
};
export default QuotationsFromVendors;
