"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import Image from "next/image";

interface IViewCompletedOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any | null;
}

export const ViewCompletedOrderModal: React.FC<
  IViewCompletedOrderModalProps
> = ({ isOpen, onClose, order }) => {
  const orderNo =
    order?.orderNumber || order?.purchaseOrderId || order?.id || "-";
  const vendorCode = order?.vendorId || "-";
  const partName = order?.products?.[0]?.partName || "-";
  const itemCount = Array.isArray(order?.products) ? order.products.length : 0;
  const totalAmount =
    order?.totalAmount != null ? String(order.totalAmount) : "-";
  const netTotal = totalAmount;
  const ts =
    order?.completedDate ||
    order?.deliveredDate ||
    order?.updatedAt ||
    order?.createdAt;
  const completedDate = ts?.seconds
    ? new Date(ts.seconds * 1000).toLocaleDateString()
    : ts instanceof Date
    ? ts.toLocaleDateString()
    : "-";
  const contactNumber = order?.buyerContactNumber || "-";

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[700px] sm:w-[600px] w-full bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body text-left">
            Completed Order
          </Dialog.Title>

          <div className="bg-[#F8F8F8] rounded-[8px] sm:p-8 p-4 space-y-6">
            <div className="flex justify-center"></div>

            <form className="sm:grid sm:grid-cols-3 gap-y-4 gap-x-6 sm:space-y-0 space-y-2 sm:h-full h-[500px] overflow-y-auto">
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Order No
                </label>
                <input
                  type="text"
                  value={orderNo}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vendor Code
                </label>
                <input
                  type="text"
                  value={vendorCode}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Part Name
                </label>
                <input
                  type="text"
                  value={partName}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Completed Date
                </label>
                <input
                  type="text"
                  value={completedDate}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Item Count
                </label>
                <input
                  type="text"
                  value={String(itemCount)}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Total Price (Rs.)
                </label>
                <input
                  type="text"
                  value={totalAmount}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Net Total Price (Rs.)
                </label>
                <input
                  type="text"
                  value={netTotal}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Description
                </label>
                <textarea
                  rows={3}
                  readOnly
                  placeholder="-"
                  className="w-full placeholder:text-[#111102] h-[80px] mt-1 p-3 text-[10px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>
            </form>
          </div>

          <Dialog.Close asChild>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#F9C301]"
            >
              <CirclePlus className="rotate-45" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
