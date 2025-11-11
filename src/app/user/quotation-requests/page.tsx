"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import { TabLayout } from "@/components";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { FirestoreService, COLLECTIONS, QuotationRequest } from "@/service/firestoreService";

import { ViewEstimateModal } from "@/components/user/ViewEstimateModal";

const QuotationRequests: React.FC = () => {
  const [entries, setEntries] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState<QuotationRequest[]>([] as any);
  const [selected, setSelected] = useState<QuotationRequest | null>(null);

  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.id) return;
      setLoading(true);
      try {
        const list = await FirestoreService.getAll<QuotationRequest>(
          COLLECTIONS.QUOTATION_REQUESTS,
          [{ field: "buyerId", operator: "==", value: currentUser.id }]
        );
        const toMs = (t: any) => t?.seconds ? (t.seconds * 1000 + (t.nanoseconds || 0) / 1e6) : (t instanceof Date ? t.getTime() : 0);
        const sorted = [...list].sort((a: any, b: any) => (toMs(b?.createdAt) - toMs(a?.createdAt)));
        setRequests(sorted as any);
      } catch (e) {
        console.error("Failed to load quotation requests", e);
        setRequests([] as any);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?.id]);

  const formatted = useMemo(() => {
    return requests.map((r) => {
      const ts: any = (r as any).createdAt;
      const date = ts?.seconds ? new Date(ts.seconds * 1000) : (ts instanceof Date ? ts : null);
      const rdate = date ? date.toLocaleDateString() : "-";
      return {
        id: (r as any).id,
        rcode: (r as any).id || "-",
        vcode: r.vendorId || "-",
        cname: r.vendorName || "-",
        pname: r.model || "-",
        rdate,
        raw: r,
      };
    });
  }, [requests]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return formatted
      .filter((row) => {
        if (!q) return true;
        return (
          row.rcode.toLowerCase().includes(q) ||
          row.vcode.toLowerCase().includes(q) ||
          row.cname.toLowerCase().includes(q) ||
          row.pname.toLowerCase().includes(q)
        );
      })
      .slice(0, entries);
  }, [formatted, search, entries]);

  return (
    <TabLayout type="user">
      <div
        className="w-full p-8 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] "
        id="quotationrequests"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          Quotations Requests
        </h1>

        <div className="flex flex-row items-center justify-between  mb-4">
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
                  Request Date
                </th>
                <th className="border px-1 py-2 border-b-1 border-white flex items-center justify-center space-x-2">
                  <ClipboardCheck size="19px" />
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-3" colSpan={7}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-4 py-3" colSpan={7}>No requests found.</td></tr>
              ) : (
                filtered.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="hover:bg-gray-50 bg-white text-[12px] font-body text-[#111102] "
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
                      {row.rdate}
                    </td>

                    <td className="grid grid-cols-1 text-center w-full h-full">
                      <button
                        className="bg-[#D1D1D1] px-3 font-body py-3 hover:bg-yellow-500 active:bg-yellow-500 focus:hover:bg-yellow-500 text-[#111102] text-[12px] w-full h-full"
                        onClick={() => { setSelected(row.raw); setIsModalOpen(true); }}
                      >
                        View
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
          Showing 1-{entries} Entries
        </div>

        <ViewEstimateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          request={selected}
        />
      </div>
    </TabLayout>
  );
};
export default QuotationRequests;
