"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import {
  ConfirmQuotationConfirmationModal,
  OpenChatConfirmationModal,
  RejectPurchaseOrderModal,
  TabLayout,
  ViewPurchaseOrderModal,
} from "@/components";
import withAuth from "@/components/authGuard/withAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
  FirestoreService,
  COLLECTIONS,
  PurchaseOrder,
  OrderService,
} from "@/service/firestoreService";

// import {
//   NewPriceChatAlert,
//   ConfirmPurchaseOrderAlert,
//   ViewPurchaseOrderModal,
//   RejectPurchaseOrderModal,
// } from "@/app/modal";

const NewPurchaseOrders: React.FC = () => {
  const [entries, setEntries] = useState(5);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const [isModalOpen4, setIsModalOpen4] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [buyerNameMap, setBuyerNameMap] = useState<Record<string, string>>({});
  const [deliveryCostMap, setDeliveryCostMap] = useState<
    Record<string, number>
  >({});
  const [quotationDetailsMap, setQuotationDetailsMap] = useState<
    Record<
      string,
      {
        deliveryCost?: number;
        description?: string;
        terms?: string;
        imageUrl?: string;
      }
    >
  >({});

  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.id) return;
      setLoading(true);
      try {
        console.log(
          "[PurchaseOrders] Loading purchase orders for vendor:",
          currentUser.id
        );
        // Fetch actual Purchase Orders instead of quotations
        const list = await OrderService.getPurchaseOrdersByVendor(
          currentUser.id
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
        console.log(
          "[PurchaseOrders] Loaded",
          sorted.length,
          "purchase orders"
        );
        setOrders(sorted);
      } catch (error) {
        console.error(
          "[PurchaseOrders] Failed to load purchase orders:",
          error
        );
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?.id]);

  useEffect(() => {
    const loadBuyers = async () => {
      const ids = Array.from(
        new Set((orders || []).map((q: any) => q.buyerId).filter(Boolean))
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
                `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                u.companyName ||
                u.email ||
                id;
              map[id] = name;
            }
          } catch {}
        })
      );
      setBuyerNameMap(map);
    };
    if (orders.length > 0) loadBuyers();
  }, [orders]);

  useEffect(() => {
    const loadQuotationDetails = async () => {
      const quotationIds = Array.from(
        new Set((orders || []).map((o: any) => o.quotationId).filter(Boolean))
      );

      if (quotationIds.length === 0) return;

      const map: Record<
        string,
        {
          deliveryCost?: number;
          description?: string;
          terms?: string;
          imageUrl?: string;
        }
      > = {};

      await Promise.all(
        quotationIds.map(async (id) => {
          try {
            const quotation: any = await FirestoreService.getById(
              COLLECTIONS.QUOTATIONS,
              id
            );

            if (!quotation) return;

            let imageUrl: string | undefined;
            if (typeof quotation.notes === "string") {
              const match = quotation.notes.match(/https?:\/\/\S+/);
              if (match) {
                imageUrl = match[0];
              }
            }

            map[id] = {
              deliveryCost: quotation.deliveryCost,
              description: quotation.description,
              terms: quotation.terms,
              imageUrl,
            };
          } catch (e) {
            console.error("[PurchaseOrders] Failed to load quotation", id, e);
          }
        })
      );

      setQuotationDetailsMap(map);
    };

    if (orders.length > 0) {
      loadQuotationDetails();
    }
  }, [orders]);

  const rows = useMemo(() => {
    return (orders || []).map((order: any, idx: number) => {
      const ts = order.updatedAt || order.createdAt;
      const d = ts?.seconds
        ? new Date(ts.seconds * 1000)
        : ts instanceof Date
        ? ts
        : null;

      const quotationDetails =
        order.quotationId && quotationDetailsMap[order.quotationId]
          ? quotationDetailsMap[order.quotationId]
          : {};

      return {
        id: order.id,
        rcode: order.orderNumber || order.quotationRequestId || "-",
        ccode: order.buyerId || "-",
        cname: buyerNameMap[order.buyerId] || order.buyerId || "-",
        pname: order.products?.[0]?.partName || "-",
        bdate: d ? d.toLocaleDateString() : "-",
        status: order.status,

        raw: {
          ...(order as PurchaseOrder),
          deliveryCost: quotationDetails.deliveryCost,
          quotationDescription: quotationDetails.description,
          quotationTerms: quotationDetails.terms,
          quotationImageUrl: quotationDetails.imageUrl,
        },
        no: idx + 1,
      };
    });
  }, [orders, buyerNameMap, quotationDetailsMap]);

  // const handleConfirmAlert = () => {
  //   console.log("Estimate confirmed!");
  //   setIsModalOpen3(false);
  // };

  // const handleChatAlert = () => {
  //   console.log("Order Confirmed!");
  //   setIsModalOpen2(false);
  // };

  // const handleDeleteAlert = () => {
  //   console.log("Order Rejected!");
  //   setIsModalOpen4(false);
  // };

  return (
    <TabLayout type="vendor">
      <div
        className="w-full lg:p-8 md:p-6  p-4 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] "
        id="quotationsfromvendors"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          New Purchase Orders
        </h1>

        <div className="flex sm:flex-row flex-col sm:items-center sm:justify-between space-y-4 sm:space-y-0  mb-4">
          <div>
            <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1">
              Show
            </div>
            <div className="flex space-x-4">
              <select
                className="rounded-[5px] px-3 text-sm text-gray-600 w-[131px] h-[32px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
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
            <div className="relative flex items-center rounded-[5px] font-body text-[12px] text-gray-600 w-[263px] h-[32px]">
              <input
                type="text"
                placeholder="Search"
                className="w-full h-full pl-3 pr-8 rounded-[5px] font-body text-sm text-gray-600 outline-none focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
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
          <table className="w-full border-collapse min-w-[780px] overflow-x-auto">
            <thead>
              <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500] ">
                <th className="border border-r-2 border-b-2 border-white px-2  py-2 ">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Requested Code
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2">
                  Customer Code
                </th>
                <th className="border border-r-2 border-b-2 border-white  py-2 min-w-[150px]">
                  Customer Name
                </th>
                <th className="border border-r-2 border-b-2 border-white py-2 min-w-[150px]">
                  Part Name
                </th>
                <th className="border border-r-2 border-b-2 border-white  py-2">
                  Booked Date
                </th>
                <th className="border border-r-2 border-b-2 border-white  py-2">
                  Status
                </th>
                <th className="border px-1 py-2 border-b-1 min-w-[300px] border-white flex items-center justify-center space-x-2">
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
              ) : (
                rows
                  .filter((r) => {
                    const q = search.toLowerCase();
                    return (
                      !q ||
                      r.rcode.toLowerCase().includes(q) ||
                      r.ccode.toLowerCase().includes(q) ||
                      r.cname.toLowerCase().includes(q) ||
                      r.pname.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, entries)
                  .map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-gray-50 bg-white text-[12px] text-[#111102] font-body"
                    >
                      <td className="border border-r-2 border-b-2  border-[#F8F8F8]  py-2 text-center">
                        {vendor.no}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                        {vendor.rcode}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                        {vendor.ccode}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                        {vendor.cname}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                        {vendor.pname}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                        {vendor.bdate}
                      </td>
                      <td
                        className={`border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ${
                          vendor.status === "accepted"
                            ? "text-[#F9C301]"
                            : vendor.status === "in_progress"
                            ? "text-[#338B07]"
                            : "text-[#930000]"
                        }`}
                      >
                        {vendor.status}
                      </td>

                      <td className="grid grid-cols-5 text-center w-full h-full font-body">
                        <button
                          className="bg-[#D1D1D1]  border-r-2 px-1 py-3 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 "
                          onClick={() => {
                            setSelected(vendor.raw);
                            setIsModalOpen1(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="bg-[#D1D1D1] px-1 py-3 border-x-2 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 "
                          onClick={() => setIsModalOpen2(true)}
                        >
                          Chat
                        </button>
                        {vendor.status === "pending" && (
                          <>
                            <button
                              className="bg-[#D1D1D1] px-1 py-3 border-l-2 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500"
                              onClick={() => {
                                console.log(
                                  "[PurchaseOrders] Accept button clicked for order:",
                                  vendor.id
                                );
                                setSelected(vendor.raw);
                                setIsModalOpen3(true);
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              className="bg-[#D1D1D1] px-1 py-3 border-l-2 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500"
                              onClick={() => {
                                console.log(
                                  "[PurchaseOrders] Reject button clicked for order:",
                                  vendor.id
                                );
                                setSelected(vendor.raw);
                                setRejectionReason("");
                                setIsModalOpen4(true);
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {vendor.status === "confirmed" && (
                          <>
                            <button
                              className="bg-[#D1D1D1] px-1 py-3 border-l-2 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500"
                              onClick={async () => {
                                try {
                                  setSelected(vendor.raw);
                                  await OrderService.updatePurchaseOrderStatus(
                                    vendor.id,
                                    "in_progress"
                                  );
                                  const list =
                                    await OrderService.getPurchaseOrdersByVendor(
                                      currentUser.id
                                    );
                                  const toMs = (t: any) =>
                                    t?.seconds
                                      ? t.seconds * 1000 +
                                        (t.nanoseconds || 0) / 1e6
                                      : t instanceof Date
                                      ? t.getTime()
                                      : 0;
                                  const sorted = [...list].sort(
                                    (a: any, b: any) =>
                                      toMs(b?.createdAt) - toMs(a?.createdAt)
                                  );
                                  setOrders(sorted);
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                            >
                              Preparing
                            </button>
                            <button
                              className="bg-[#D1D1D1] px-1 py-3 border-l-2 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500"
                              onClick={async () => {
                                try {
                                  setSelected(vendor.raw);
                                  await OrderService.updatePurchaseOrderStatus(
                                    vendor.id,
                                    "shipped"
                                  );
                                  const list =
                                    await OrderService.getPurchaseOrdersByVendor(
                                      currentUser.id
                                    );
                                  const toMs = (t: any) =>
                                    t?.seconds
                                      ? t.seconds * 1000 +
                                        (t.nanoseconds || 0) / 1e6
                                      : t instanceof Date
                                      ? t.getTime()
                                      : 0;
                                  const sorted = [...list].sort(
                                    (a: any, b: any) =>
                                      toMs(b?.createdAt) - toMs(a?.createdAt)
                                  );
                                  setOrders(sorted);
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                            >
                              Dispatched
                            </button>
                            <button
                              className="bg-[#D1D1D1] px-1 py-3 border-l-2 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500"
                              onClick={async () => {
                                try {
                                  setSelected(vendor.raw);
                                  // Mark purchase order as delivered and create a completed order record
                                  await OrderService.updatePurchaseOrderStatus(
                                    vendor.id,
                                    "delivered"
                                  );
                                  await OrderService.completePurchaseOrder(
                                    vendor.id,
                                    {
                                      buyerId: (vendor.raw as any).buyerId,
                                      vendorId: (vendor.raw as any).vendorId,
                                      totalAmount: (vendor.raw as any)
                                        .totalAmount,
                                      currency:
                                        (vendor.raw as any).currency || "LKR",
                                    }
                                  );
                                  const list =
                                    await OrderService.getPurchaseOrdersByVendor(
                                      currentUser.id
                                    );
                                  const toMs = (t: any) =>
                                    t?.seconds
                                      ? t.seconds * 1000 +
                                        (t.nanoseconds || 0) / 1e6
                                      : t instanceof Date
                                      ? t.getTime()
                                      : 0;
                                  const sorted = [...list].sort(
                                    (a: any, b: any) =>
                                      toMs(b?.createdAt) - toMs(a?.createdAt)
                                  );
                                  setOrders(sorted);
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                            >
                              Complete
                            </button>
                          </>
                        )}
                        {vendor.status === "in_progress" && (
                          <>
                            <button
                              className="bg-[#D1D1D1] px-1 py-3 border-l-2 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500"
                              onClick={async () => {
                                try {
                                  setSelected(vendor.raw);
                                  await OrderService.updatePurchaseOrderStatus(
                                    vendor.id,
                                    "shipped"
                                  );
                                  const list =
                                    await OrderService.getPurchaseOrdersByVendor(
                                      currentUser.id
                                    );
                                  const toMs = (t: any) =>
                                    t?.seconds
                                      ? t.seconds * 1000 +
                                        (t.nanoseconds || 0) / 1e6
                                      : t instanceof Date
                                      ? t.getTime()
                                      : 0;
                                  const sorted = [...list].sort(
                                    (a: any, b: any) =>
                                      toMs(b?.createdAt) - toMs(a?.createdAt)
                                  );
                                  setOrders(sorted);
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                            >
                              Dispatched
                            </button>
                            <button
                              className="bg-[#D1D1D1] px-1 py-3 border-l-2 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500"
                              onClick={async () => {
                                try {
                                  setSelected(vendor.raw);
                                  await OrderService.updatePurchaseOrderStatus(
                                    vendor.id,
                                    "delivered"
                                  );
                                  const list =
                                    await OrderService.getPurchaseOrdersByVendor(
                                      currentUser.id
                                    );
                                  const toMs = (t: any) =>
                                    t?.seconds
                                      ? t.seconds * 1000 +
                                        (t.nanoseconds || 0) / 1e6
                                      : t instanceof Date
                                      ? t.getTime()
                                      : 0;
                                  const sorted = [...list].sort(
                                    (a: any, b: any) =>
                                      toMs(b?.createdAt) - toMs(a?.createdAt)
                                  );
                                  setOrders(sorted);
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                            >
                              Complete
                            </button>
                          </>
                        )}
                        {vendor.status === "shipped" && (
                          <>
                            <button
                              className="bg-[#D1D1D1] px-1 py-3 border-l-2 border-[#F8F8F8] text-[#111102] text-[12px] w-full h-full hover:bg-yellow-500"
                              onClick={async () => {
                                try {
                                  setSelected(vendor.raw);
                                  await OrderService.updatePurchaseOrderStatus(
                                    vendor.id,
                                    "delivered"
                                  );
                                  const list =
                                    await OrderService.getPurchaseOrdersByVendor(
                                      currentUser.id
                                    );
                                  const toMs = (t: any) =>
                                    t?.seconds
                                      ? t.seconds * 1000 +
                                        (t.nanoseconds || 0) / 1e6
                                      : t instanceof Date
                                      ? t.getTime()
                                      : 0;
                                  const sorted = [...list].sort(
                                    (a: any, b: any) =>
                                      toMs(b?.createdAt) - toMs(a?.createdAt)
                                  );
                                  setOrders(sorted);
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                            >
                              Complete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing 1-{entries} of {entries} Entries
        </div>
        <ViewPurchaseOrderModal
          isOpen={isModalOpen1}
          onClose={() => {
            console.log("[PurchaseOrders] Closing view modal");
            setIsModalOpen1(false);
          }}
          order={selected as any}
        />
        <ConfirmQuotationConfirmationModal
          isOpen={isModalOpen3}
          onClose={() => {
            console.log("[PurchaseOrders] Closing accept modal");
            setIsModalOpen3(false);
          }}
          onConfirm={async () => {
            if (!selected?.id) {
              console.error(
                "[PurchaseOrders] No order selected for acceptance"
              );
              return;
            }
            try {
              console.log(
                "[PurchaseOrders] Accepting purchase order:",
                selected.id
              );
              await OrderService.updatePurchaseOrderStatus(
                selected.id,
                "confirmed",
                {
                  estimatedDelivery:
                    selected.expectedDeliveryDate instanceof Date
                      ? selected.expectedDeliveryDate
                      : undefined,
                }
              );
              console.log(
                "[PurchaseOrders] Purchase order accepted successfully"
              );
              // TODO: Send order acceptance notification via WhatsApp
              console.log(
                "[PurchaseOrders] TODO: Send order acceptance notification via WhatsApp"
              );

              // Reload orders
              const list = await OrderService.getPurchaseOrdersByVendor(
                currentUser.id
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
              setOrders(sorted);
              setIsModalOpen3(false);
            } catch (error: any) {
              console.error(
                "[PurchaseOrders] Failed to accept purchase order:",
                error
              );
              alert(error.message || "Failed to accept purchase order");
            }
          }}
        />

        <RejectPurchaseOrderModal
          isOpen={isModalOpen4}
          onClose={() => {
            console.log("[PurchaseOrders] Closing reject modal");
            setIsModalOpen4(false);
            setRejectionReason("");
          }}
          onConfirm={async (reason: string) => {
            if (!selected?.id) {
              console.error("[PurchaseOrders] No order selected for rejection");
              return;
            }
            try {
              console.log(
                "[PurchaseOrders] Rejecting purchase order:",
                selected.id,
                "Reason:",
                reason
              );
              await OrderService.updatePurchaseOrderStatus(
                selected.id,
                "cancelled",
                {
                  rejectionReason: reason,
                }
              );
              console.log(
                "[PurchaseOrders] Purchase order rejected successfully"
              );
              // TODO: Send order rejection notification via WhatsApp
              console.log(
                "[PurchaseOrders] TODO: Send order rejection notification via WhatsApp"
              );

              // Reload orders
              const list = await OrderService.getPurchaseOrdersByVendor(
                currentUser.id
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
              setOrders(sorted);
              setIsModalOpen4(false);
              setRejectionReason("");
            } catch (error: any) {
              console.error(
                "[PurchaseOrders] Failed to reject purchase order:",
                error
              );
              alert(error.message || "Failed to reject purchase order");
            }
          }}
        />

        <OpenChatConfirmationModal
          isOpen={isModalOpen2}
          onClose={() => setIsModalOpen2(false)}
          onConfirm={() => {
            alert("in development");
            setIsModalOpen2(false);
          }}
        />
        {/*
      <NewPriceChatAlert
        isOpen={isModalOpen2}
        onClose={() => setIsModalOpen2(false)}
        onConfirm={handleChatAlert}
      />

 */}
      </div>
    </TabLayout>
  );
};
export default withAuth(NewPurchaseOrders);
