"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import { TabLayout, ViewCompletedOrderModal } from "@/components";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";

interface ITempCompletedOrderCommon {
  type: "vendor" | "user";
}

interface FirestoreProduct {
  partName: string;
  quantity: number;
  totalPrice: number;
  unitPrice: number;
}

interface FirestorePurchaseOrder {
  id: string;
  buyerId: string;
  vendorId: string;
  status: string;
  orderNumber?: string;
  createdAt?: any;
  products?: FirestoreProduct[];
  quotationRequestId?: string;
}

export const CompletedOrders: React.FC<ITempCompletedOrderCommon> = ({
  type,
}) => {
  const [entries, setEntries] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<FirestorePurchaseOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const authState = useSelector((state: RootState) => state.auth as any);
  const user = authState.user as any;

  useEffect(() => {
    if (!user) return;

    const colRef = collection(db, "purchaseOrders");

    const field = "vendorId";

    const q = query(
      colRef,
      where(field, "==", user.vendorId),
      where("status", "==", "delivered"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: FirestorePurchaseOrder[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<FirestorePurchaseOrder, "id">),
      }));
      setOrders(list);
    });

    return () => unsubscribe();
  }, [user, type]);

  const displayOrders = useMemo(() => {
    const term = search.toLowerCase();

    const filtered = orders.filter((o) => {
      const orderNumber = o.orderNumber || o.id;
      const vendorCode = o.vendorId || "";
      const partName = o.products?.[0]?.partName || "";
      return (
        orderNumber.toLowerCase().includes(term) ||
        vendorCode.toLowerCase().includes(term) ||
        partName.toLowerCase().includes(term)
      );
    });

    return filtered.slice(0, entries);
  }, [orders, search, entries]);

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "";
    return timestamp.toDate().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleViewOrder = async (order: FirestorePurchaseOrder) => {
    try {
      let buyerContactNumber = "-";

      if (order.quotationRequestId) {
        const qrRef = doc(db, "quotationRequests", order.quotationRequestId);
        const qrSnap = await getDoc(qrRef);

        if (qrSnap.exists()) {
          const qrData = qrSnap.data() as any;

          buyerContactNumber = qrData.buyerPhone;
          ("-");
        }
      }

      setSelectedOrder({ ...order, buyerContactNumber });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch quotation request:", err);

      setSelectedOrder(order);
      setIsModalOpen(true);
    }
  };

  return (
    <TabLayout type={type}>
      <div
        className="w-full lg:p-8 md:p-6 p-4 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px]"
        id="quotationrequests"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          Completed Orders
        </h1>

        <div className="flex sm:flex-row flex-col sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4">
          <div>
            <div className="font-body font-[500] text-[14px] text-[#111102] mb-1">
              Show
            </div>
            <div className="flex space-x-4">
              <select
                className="rounded-[5px] px-3 font-body text-sm text-gray-600 w-[131px] h-[32px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
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
            <div className="font-body font-[500] text-[14px] text-[#111102] mb-1">
              Search
            </div>
            <div className="relative flex items-center rounded-[5px] text-sm text-gray-600 w-[263px] h-[32px]">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-full pl-3 pr-8 font-body rounded-[5px] text-sm text-gray-600 outline-none focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
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
          <table className="w-full border-collapse min-w-[750px] overflow-x-auto">
            <thead>
              <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500]">
                <th className="border border-r-2 border-b-2 border-white px-[5px] py-2">
                  No.
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Booked ID
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Vendor Code
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Part Name
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Booked Date
                </th>
                <th className="border px-1 py-2 border-b-1 border-white flex items-center justify-center space-x-2">
                  <ClipboardCheck size="19px" />
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.map((order, index) => {
                const partName = order.products?.[0]?.partName || "-";
                const orderNumber = order.orderNumber || order.id;

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 bg-white text-[12px] font-body text-[#111102]"
                  >
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                      {orderNumber}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                      {order.vendorId}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                      {partName}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="grid grid-cols-1 text-center w-full h-full">
                      <button
                        className="bg-[#D1D1D1] px-3 font-body py-3 text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500 active:bg-yellow-500 focus:hover:bg-yellow-500"
                        onClick={() => handleViewOrder(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}

              {displayOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-[12px] text-gray-500 py-4"
                  >
                    No completed orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing {displayOrders.length} of {orders.length} Entries
        </div>

        <ViewCompletedOrderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      </div>
    </TabLayout>
  );
};
