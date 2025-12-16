"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import { PurchaseOrder } from "@/service/firestoreService";
import Image from "next/image";
import { useRefactoredIdLast } from "../hooks/useRefactoredIdLast";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { date } from "yup";

interface IViewPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: PurchaseOrder | null;
}

export const ViewPurchaseOrderModal: React.FC<IViewPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [expiryDate, setExpiryDate] = useState<string>("-");
  const [expiryLoading, setExpiryLoading] = useState(false);

  const parsePeriodToMs = (period?: string) => {
    if (!period) return null;

    const m = String(period).match(
      /(\d+)\s*(hour|hours|day|days|week|weeks|month|months|year|years)/i
    );
    if (!m) return null;

    const amount = Number(m[1]);
    const unit = m[2].toLowerCase();

    const H = 60 * 60 * 1000;
    const D = 24 * H;

    if (unit.startsWith("hour")) return amount * H;
    if (unit.startsWith("day")) return amount * D;
    if (unit.startsWith("week")) return amount * 7 * D;

    return { amount, unit };
  };

  const formatYYYYMMDD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const quotationId = order?.quotationId;
    if (!quotationId) {
      setExpiryDate("-");
      return;
    }

    const run = async () => {
      try {
        setExpiryLoading(true);

        const snap = await getDoc(doc(db, "quotations", quotationId));
        if (!snap.exists()) {
          setExpiryDate("-");
          return;
        }

        const q: any = snap.data();

        const createdAt: Timestamp | undefined = q.createdAt;
        const createdDate = createdAt?.toDate?.() ?? null;

        const period = q.deliveryTimeframe as string | undefined;
        if (!createdDate || !period) {
          setExpiryDate("-");
          return;
        }

        const parsed = parsePeriodToMs(period);

        if (typeof parsed === "number") {
          const exp = new Date(createdDate.getTime() + parsed);
          setExpiryDate(formatYYYYMMDD(exp));
          return;
        }

        if (parsed && typeof parsed === "object") {
          const exp = new Date(createdDate);
          if (parsed.unit.startsWith("month"))
            exp.setMonth(exp.getMonth() + parsed.amount);
          else if (parsed.unit.startsWith("year"))
            exp.setFullYear(exp.getFullYear() + parsed.amount);

          setExpiryDate(formatYYYYMMDD(exp));
          return;
        }

        setExpiryDate("-");
      } catch (e) {
        console.error("Failed to compute expiry date:", e);
        setExpiryDate("-");
      } finally {
        setExpiryLoading(false);
      }
    };

    run();
  }, [order?.quotationId]);

  const isExpired =
    expiryDate !== "-" &&
    !expiryLoading &&
    new Date(expiryDate).getTime() < Date.now();

  const tableData = useMemo(() => {
    const items = order?.products || [];
    return items.map((p, idx) => ({
      id: idx + 1,
      itemName: p.partName,
      unit: p.quantity,
      description: order?.quotationDescription || "-",
      unitPrice: p.unitPrice,
      totalPrice: p.totalPrice,
      netTotal: p.totalPrice,
      stock: "-",
      comment: order?.quotationTerms || "-",
      stockAvailability: order?.stockAvailability || "-",
    }));
  }, [order]);

  const formatDeliveryAddress = (address?: {
    street: string;
    city: string;
    district: string;
    zipCode: string;
    country: string;
  }): string => {
    if (!address) return "-";

    const { street, city, district, zipCode, country } = address;

    const parts = [street, city, district, zipCode, country].filter(
      (part) => part && part.trim() !== ""
    );

    return parts.length > 0 ? parts.join(", ") : "-";
  };

  const getDeliveryMethodLabel = (method?: string) => {
    if (method === "arrange_delivery") return "Arrange delivery through vendor";
    if (method === "collect_from_shop") return "Collect from shop";
    return "-";
  };

  const netTotal = useMemo(() => {
    if (order?.netTotal) {
      return Number(order.netTotal);
    }
  }, [order]);

  const getPaymentMethodLabel = (method?: string) => {
    if (method === "cash_at_shop") return "Cash at shop";
    if (method === "bank_transfer") return "Bank transfer";
    if (method === "pay_online") return "Pay online";
    return "-";
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[700px] sm:w-[600px] w-full bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body">
            Purchase Order {order?.orderNumber || ""}
          </Dialog.Title>

          {/* Gray Container */}
          <div className="bg-[#F8F8F8] rounded-[8px] sm:p-8 p-4 space-y-6 overflow-y-auto h-[500px] no-scrollbar">
            {/* Form Section */}
            <form className="sm:grid sm:grid-cols-3 gap-y-4 gap-x-6 sm:space-y-0 space-y-2 ">
              {/* Order Number */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Order Number
                </label>
                <input
                  type="text"
                  value={useRefactoredIdLast("ON", order?.orderNumber) || ""}
                  readOnly
                  className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Delivery Method */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Delivery Method
                </label>
                <input
                  type="text"
                  value={getDeliveryMethodLabel(order?.deliveryMethod)}
                  readOnly
                  className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Payment Method
                </label>
                <input
                  type="text"
                  value={getPaymentMethodLabel(order?.paymentMethod)}
                  readOnly
                  className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Net Total */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Net Total (Rs.)
                </label>
                <input
                  type="text"
                  value={netTotal}
                  readOnly
                  className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Delivery Cost */}
              {order?.deliveryMethod === "arrange_delivery" && (
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Delivery Cost (Rs.)
                  </label>
                  <input
                    type="text"
                    value={order?.deliveryCost?.toString() || "-"}
                    readOnly
                    className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>
              )}

              {/* Total Amount */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Grand Total (Rs.)
                </label>
                <input
                  type="text"
                  value={order?.totalAmount?.toFixed(2) || ""}
                  readOnly
                  className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Order Status
                </label>
                <input
                  type="text"
                  value={
                    getDeliveryMethodLabel(order?.deliveryMethod) ==
                      "Collect from shop" &&
                    (order?.status == "shipped" || order?.status == "delivered")
                      ? "collected"
                      : order?.status
                  }
                  readOnly
                  className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {order?.status === "cancelled" && (
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Rejection Reason
                  </label>
                  <input
                    type="text"
                    value={order?.rejectionReason || "-"}
                    readOnly
                    className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>
              )}

              {order?.status === "pending" && (
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Payment Status
                  </label>
                  <input
                    type="text"
                    value={order?.paymentStatus || "pending"}
                    readOnly
                    className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>
              )}

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Special Note
                </label>
                <input
                  type="text"
                  value={order?.specialNotes || "-"}
                  readOnly
                  className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryLoading ? "loading..." : expiryDate}
                  readOnly
                  className={`w-full h-[36px] ${
                    isExpired ? "text-[#930000]" : "text-[#111102]"
                  } font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]`}
                />
              </div>

              {/* Delivery Address */}
              {order?.deliveryMethod === "arrange_delivery" && (
                <div className="col-span-3">
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={formatDeliveryAddress(order?.deliveryAddress)}
                    readOnly
                    className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus: outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>
              )}

              {/* Payment Slip */}
              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Payment Slip
                </label>
                {order?.paymentSlipUrl ? (
                  <div className="mt-1 text-[10px]">
                    <a
                      href={order.paymentSlipUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {order.paymentSlipUrl}
                    </a>
                  </div>
                ) : (
                  <input
                    type="text"
                    value="No payment slip uploaded"
                    readOnly
                    className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                )}
              </div>
            </form>

            {/* Scrollable Table */}
            <div className="overflow-y-auto  no-scrollbar max-h-[150px] rounded-tl-[8px] rounded-tr-[8px]">
              <table className="w-full text-[8px] text-center border font-body text-[#111102] border-white table-fixed min-w-[600px] overflow-x-auto">
                <thead className="bg-[#D1D1D1] ">
                  <tr>
                    <th className="p-3 border w-[5%] rounded-tl-[3px]"></th>
                    <th className="py-3 px-2  border w-[10%]">Item Name</th>
                    <th className="p-3 border w-[10%]">Image</th>
                    <th className="p-3 border w-[10%]">Unit</th>
                    <th className="p-3 border w-[15%]">Description</th>
                    <th className="py-3 border w-[10%]">Unit Price</th>
                    <th className="py-3 border w-[10%]">Total Price</th>
                    <th className="p-3 border w-[10%]">Net Total</th>
                    <th className="p-3 border w-[10%]">Stock</th>
                    <th className="p-3 border w-[10%] rounded-tr-[3px]">
                      Comment
                    </th>
                  </tr>
                </thead>

                <tbody className=" overflow-y-auto max-h-[120px] no-scrollbar">
                  {tableData.map((item, index) => (
                    <tr
                      key={index}
                      className="odd:bg-white text-[8px] font-body even:bg-gray-50 border-b border-white"
                    >
                      <td className="p-3 border "> {item.id}</td>
                      <td className="p-3 border">{item.itemName}</td>
                      <td className="p-3 border">
                        <Image
                          className="w-20 h-10"
                          src={
                            order?.quotationImageUrl ||
                            "/images/placeholder.png"
                          }
                          alt="order image"
                          width={200}
                          height={200}
                        />
                      </td>
                      <td className="p-3 border">{item.unit}</td>
                      <td className="p-3 border">{item.description}</td>
                      <td className="p-3 border">{item.unitPrice}</td>
                      <td className="p-3 border">{item.totalPrice}</td>
                      <td className="p-3 border">{netTotal}</td>
                      <td className="p-3 border">{item.stockAvailability}</td>
                      <td className="p-3 border">{item.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <p className="text-[10px] text-[#930000] mt-5 text-right">
                Net total includes 12% VAT rate.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#F9C301] rotate-45"
            >
              <CirclePlus />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
