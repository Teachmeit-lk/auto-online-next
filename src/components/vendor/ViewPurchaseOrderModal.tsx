"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import { useMemo } from "react";
import { PurchaseOrder } from "@/service/firestoreService";

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
  console.log(
    "[ViewPurchaseOrderModal] Opening modal for order:",
    order?.id,
    order?.orderNumber
  );

  const tableData = useMemo(() => {
    const items = order?.products || [];
    return items.map((p, idx) => ({
      id: idx + 1,
      itemName: p.partName,
      unit: "Unit",
      description: "-",
      unitPrice: p.unitPrice,
      totalPrice: p.totalPrice,
      netTotal: p.totalPrice,
      stock: "-",
      comment: "-",
    }));
  }, [order]);

  const getDeliveryMethodLabel = (method?: string) => {
    if (method === "arrange_delivery") return "Arrange delivery through vendor";
    if (method === "collect_from_shop") return "Collect from shop";
    return "-";
  };

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
                  value={order?.orderNumber || ""}
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

              {/* Total Amount */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Total Amount (Rs.)
                </label>
                <input
                  type="text"
                  value={order?.totalAmount?.toString() || ""}
                  readOnly
                  className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Delivery Cost */}
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

              {/* Status */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Status
                </label>
                <input
                  type="text"
                  value={order?.status || "-"}
                  readOnly
                  className="w-full h-[36px] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Payment Status */}
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
                      <td className="p-3 border">{item.itemName}</td>
                      <td className="p-3 border">{item.unit}</td>
                      <td className="p-3 border">{item.description}</td>
                      <td className="p-3 border">{item.unitPrice}</td>
                      <td className="p-3 border">{item.totalPrice}</td>
                      <td className="p-3 border">{item.netTotal}</td>
                      <td className="p-3 border">{item.stock}</td>
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
