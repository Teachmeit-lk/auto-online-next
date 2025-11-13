"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import { TabLayout, ViewCompletedOrderModal } from "@/components";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
  FirestoreService,
  COLLECTIONS,
  Order,
  PurchaseOrder,
} from "@/service/firestoreService";

const CompletedOrders: React.FC = () => {
  const [entries, setEntries] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveredPOs, setDeliveredPOs] = useState<PurchaseOrder[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [vendorNameMap, setVendorNameMap] = useState<Record<string, string>>(
    {}
  );

  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.id) return;
      setLoading(true);
      try {
        const list = await FirestoreService.getAll<Order>(COLLECTIONS.ORDERS, [
          { field: "buyerId", operator: "==", value: currentUser.id },
        ]);
        const toMs = (t: any) =>
          t?.seconds
            ? t.seconds * 1000 + (t.nanoseconds || 0) / 1e6
            : t instanceof Date
            ? t.getTime()
            : 0;
        const sorted = [...list].sort(
          (a: any, b: any) =>
            toMs(b?.completedDate || b?.createdAt) -
            toMs(a?.completedDate || a?.createdAt)
        );
        setOrders(sorted);

        // Also include delivered purchase orders
        const poList = await FirestoreService.getAll<PurchaseOrder>(
          COLLECTIONS.PURCHASE_ORDERS,
          [
            { field: "buyerId", operator: "==", value: currentUser.id },
            { field: "status", operator: "==", value: "delivered" },
          ]
        );
        const deliveredSorted = [...poList].sort(
          (a: any, b: any) =>
            toMs(b?.updatedAt || b?.createdAt) -
            toMs(a?.updatedAt || a?.createdAt)
        );
        setDeliveredPOs(deliveredSorted);
      } catch (e) {
        console.error("[CompletedOrders] Failed to load orders", e);
        setOrders([]);
        setDeliveredPOs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?.id]);

  useEffect(() => {
    const loadVendors = async () => {
      const ids = Array.from(
        new Set(
          [
            ...(orders || []).map((o: any) => o.vendorId),
            ...(deliveredPOs || []).map((o: any) => o.vendorId),
          ].filter(Boolean)
        )
      );
      const map: Record<string, string> = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const u: any = await FirestoreService.getById(
              COLLECTIONS.USERS,
              id
            );
            if (u) {
              const name =
                u.companyName ||
                `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                u.email ||
                id;
              map[id] = name;
            }
          } catch {}
        })
      );
      setVendorNameMap(map);
    };
    if (orders.length > 0 || deliveredPOs.length > 0) loadVendors();
  }, [orders, deliveredPOs]);

  const rows = useMemo(() => {
    const fromOrders = (orders || []).map((o: any) => {
      const ts = o.completedDate || o.createdAt;
      const d = ts?.seconds
        ? new Date(ts.seconds * 1000)
        : ts instanceof Date
        ? ts
        : null;
      return {
        orderNo: o.orderNumber || o.purchaseOrderId || o.id,
        vendorCode: o.vendorId,
        vendorName: vendorNameMap[o.vendorId] || o.vendorId || "-",
        totalAmount: o.totalAmount,
        dateCompleted: d ? d.toLocaleDateString() : "-",
        raw: o as any,
      };
    });
    const fromDelivered = (deliveredPOs || []).map((p: any) => {
      const ts = p.updatedAt || p.createdAt;
      const d = ts?.seconds
        ? new Date(ts.seconds * 1000)
        : ts instanceof Date
        ? ts
        : null;
      return {
        orderNo: p.orderNumber || p.id,
        vendorCode: p.vendorId,
        vendorName: vendorNameMap[p.vendorId] || p.vendorId || "-",
        totalAmount: p.totalAmount,
        dateCompleted: d ? d.toLocaleDateString() : "-",
        raw: p as any,
      };
    });
    const combined = [...fromOrders, ...fromDelivered];
    // sort by dateCompleted desc
    const toMs = (t: any) => (t ? new Date(t).getTime() : 0);
    const sorted = combined.sort(
      (a: any, b: any) =>
        new Date(b.dateCompleted).getTime() -
        new Date(a.dateCompleted).getTime()
    );
    return sorted.map((r: any, idx: number) => ({ no: idx + 1, ...r }));
  }, [orders, deliveredPOs, vendorNameMap]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows
      .filter(
        (r) =>
          !q ||
          String(r.orderNo).toLowerCase().includes(q) ||
          r.vendorCode.toLowerCase().includes(q) ||
          r.vendorName.toLowerCase().includes(q) ||
          String(r.totalAmount ?? "")
            .toLowerCase()
            .includes(q)
      )
      .slice(0, entries);
  }, [rows, search, entries]);

  return (
    <TabLayout type="user">
      <div
        className="w-full lg:p-8 md:p-6  p-4 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] "
        id="quotationrequests"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          Completed Orders
        </h1>

        <div className="flex sm:flex-row flex-col sm:items-center sm:justify-between space-y-4 sm:space-y-0  mb-4">
          <div>
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

        <div className="overflow-x-auto rounded-tl-[10px] rounded-tr-[10px]">
          <table className="w-full border-collapse min-w-[690px] overflow-x-auto">
            <thead>
              <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500] ">
                <th className="border border-r-2 border-b-2 border-white px-[5px]  py-2 ">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Order No
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Vendor Code
                </th>
                <th className="border border-r-2 border-b-2 border-white  py-2">
                  Company Name
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Total Amount
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Completed Date
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
                  <td className="px-4 py-3" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-3" colSpan={7}>
                    No completed orders.
                  </td>
                </tr>
              ) : (
                filtered.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 bg-white text-[12px] font-body text-[#111102] "
                  >
                    <td className="border border-r-2 border-b-2  border-[#F8F8F8]  py-2 text-center">
                      {row.no}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {row.orderNo}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {row.vendorCode}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {row.vendorName}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {row.totalAmount}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                      {row.dateCompleted}
                    </td>
                    <td className="grid grid-cols-1 text-center w-full h-full">
                      <button
                        className="bg-[#D1D1D1] px-3 font-body py-3 text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500 active:bg-yellow-500 focus:hover:bg-yellow-500"
                        onClick={() => {
                          setSelected(row.raw);
                          setIsModalOpen(true);
                        }}
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

        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing 1-{Math.min(entries, rows.length)} Entries
        </div>

        <ViewCompletedOrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selected as any}
        />
      </div>
    </TabLayout>
  );
};

export default CompletedOrders;
