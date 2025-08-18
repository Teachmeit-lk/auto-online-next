"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import { TabLayout, ViewAcceptedPOModal } from "@/components";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { FirestoreService, COLLECTIONS, Quotation } from "@/service/firestoreService";

const AcceptedPO: React.FC = () => {
  const [entries, setEntries] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Quotation[]>([]);
  const [selected, setSelected] = useState<Quotation | null>(null);

  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.id) return;
      setLoading(true);
      try {
        const list = await FirestoreService.getAll<Quotation>(
          COLLECTIONS.QUOTATIONS,
          [
            { field: "buyerId", operator: "==", value: currentUser.id },
            { field: "status", operator: "==", value: "accepted" },
          ]
        );
        const toMs = (t: any) => t?.seconds ? (t.seconds * 1000 + (t.nanoseconds || 0) / 1e6) : (t instanceof Date ? t.getTime() : 0);
        const sorted = [...list].sort((a: any, b: any) => (toMs(b?.updatedAt || b?.createdAt) - toMs(a?.updatedAt || a?.createdAt)));
        setData(sorted);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?.id]);

  const rows = useMemo(() => {
    return (data || []).map((q: any) => {
      const ts = q.updatedAt || q.createdAt;
      const d = ts?.seconds ? new Date(ts.seconds * 1000) : (ts instanceof Date ? ts : null);
      return {
        id: q.id,
        cecode: q.id || "-",
        crcode: q.quotationRequestId || "-",
        cname: q.vendorName || "-",
        pname: (q.products?.[0]?.partName) || "-",
        adate: d ? d.toLocaleDateString() : "-",
        raw: q as Quotation,
      };
    });
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows
      .filter((r) =>
        !q ||
        r.cecode.toLowerCase().includes(q) ||
        r.crcode.toLowerCase().includes(q) ||
        r.cname.toLowerCase().includes(q) ||
        r.pname.toLowerCase().includes(q)
      )
      .slice(0, entries);
  }, [rows, search, entries]);

  return (
    <TabLayout type="user">
      <div
        className="w-full p-8 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] "
        id="quotationrequests"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          Accepted PO by Vendors
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
                <th className="border border-r-2 border-b-2 border-white px-[5px]  py-2 ">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Cus. Estimate Code
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Cus. Request Code
                </th>
                <th className="border border-r-2 border-b-2 border-white  py-2">
                  Company Name
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Part Name
                </th>
                <th className="border border-r-2 border-b-2 border-white  py-2">
                  Accepted Date
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
                <tr><td className="px-4 py-3" colSpan={7}>No accepted quotations.</td></tr>
              ) : filtered.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="hover:bg-gray-50 bg-white text-[12px] font-body text-[#111102] "
                >
                  <td className="border border-r-2 border-b-2  border-[#F8F8F8]  py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {row.cecode}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {row.crcode}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {row.cname}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {row.pname}
                  </td>
                  <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                    {row.adate}
                  </td>

                  <td className="grid grid-cols-1 text-center w-full h-full">
                    <button
                      className="bg-[#D1D1D1] px-3 font-body py-3 text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500 active:bg-yellow-500 focus:hover:bg-yellow-500"
                      onClick={() => { setSelected(row.raw); setIsModalOpen(true); }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing 1-{Math.min(entries, rows.length)} Entries
        </div>

        <ViewAcceptedPOModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          quotation={selected as any}
        />
      </div>
    </TabLayout>
  );
};
export default AcceptedPO;
