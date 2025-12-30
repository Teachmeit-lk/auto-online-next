"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import { useMemo } from "react";
import { Quotation } from "@/service/firestoreService";
import { useRefactoredId } from "../hooks/useRefactoredId";

interface IViewQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation?: Quotation | null;
  onOpenPurchaseOrder?: (quotation: Quotation) => void;
}

export const ViewQuotationModal: React.FC<IViewQuotationModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onOpenPurchaseOrder,
}) => {
  const tableData = useMemo(() => {
    const items = quotation?.products || [];
    return items.map((p, idx) => ({
      id: idx + 1,
      itemName: p.partName,
      imageUrl: p.imageUrl || null,
      unit: p.quantity,
      description: p.description || "-",
      unitPrice: p.unitPrice,
      totalPrice: p.totalPrice,
      netTotal: p.totalPrice,
      stock: p.stockAvailability || "-",
      comment: p.vendorComments || p.warranty || "-",
    }));
  }, [quotation]);

  type StaffInfo = {
    nic?: string;
    staffId?: string;
    staffName?: string;
    phone?: string;
  };

  const parseStaffInfo = (notes?: string): StaffInfo => {
    if (!notes) return {};

    const get = (re: RegExp) => notes.match(re)?.[1]?.trim();

    return {
      nic: get(/NIC[:\s]+([0-9]{9,12}[VvXx]?)/),
      staffId:
        get(/Staff\s*[:\s]+([^,]+)/i) ||
        get(/Staff[:\s]+([^,]+)/i) ||
        get(/Staff[:\s]+([0-9]+)/),
      staffName: get(/Staff\s*Name[:\s]+([^,]+)/i) || get(/Name[:\s]+([^,]+)/i),
      phone: get(/Phone[:\s]+([0-9+]{9,15})/i),
    };
  };

  const staffInfo = useMemo(
    () => parseStaffInfo(quotation?.notes),
    [quotation?.notes]
  );

  const staffIdForDisplay = staffInfo.nic ?? "";

  const extractDeliveryCost = (notes?: string): string => {
    if (!notes) return "-";

    const match = notes.match(/Delivery Cost[:\s]+([0-9]+(?:\.[0-9]{1,2})?)/i);
    if (match && match[1]) {
      return match[1];
    }

    return "-";
  };

  const getCreatedAtDate = (): Date | null => {
    const ts: any = quotation?.createdAt;
    if (!ts) return null;

    if (typeof ts.toDate === "function") return ts.toDate();

    if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000);

    return null;
  };

  const computeExpiryDate = (): string => {
    const base = getCreatedAtDate();
    const tf = quotation?.deliveryTimeframe;
    if (!base || !tf) return "-";

    const match = String(tf).match(
      /(\d+)\s*(hour|hours|day|days|week|weeks|month|months|year|years)/i
    );
    if (!match) return "-";

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const d = new Date(base);

    if (unit.startsWith("hour")) d.setHours(d.getHours() + amount);
    else if (unit.startsWith("day")) d.setDate(d.getDate() + amount);
    else if (unit.startsWith("week")) d.setDate(d.getDate() + amount * 7);
    else if (unit.startsWith("month")) d.setMonth(d.getMonth() + amount);
    else if (unit.startsWith("year")) d.setFullYear(d.getFullYear() + amount);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const expiryDateStr = useMemo(
    () => computeExpiryDate(),
    [quotation?.createdAt, quotation?.deliveryTimeframe]
  );

  const isExpired = useMemo(() => {
    if (!expiryDateStr || expiryDateStr === "-") return false;
    const t = new Date(expiryDateStr).getTime();
    return Number.isFinite(t) && t < Date.now();
  }, [expiryDateStr]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[700px] sm:w-[600px] w-full bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body">
            {quotation?.vendorName || "Vendor"} Estimate
          </Dialog.Title>

          {/* Gray Container */}
          <div className="bg-[#F8F8F8] rounded-[8px] sm:p-8 p-4 space-y-6 sm:h-full h-[600px] overflow-y-auto">
            {/* Form Section */}
            <form className="sm:grid sm:grid-cols-2 gap-y-4 gap-x-6 sm:space-y-0 space-y-2">
              {/* Staff ID */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Staff ID
                </label>

                <input
                  type="text"
                  placeholder="200212904000"
                  value={staffIdForDisplay || "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102]  text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Staff Name */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Staff Name
                </label>
                <input
                  type="text"
                  placeholder="Shehan Maduranga"
                  value={
                    staffInfo.staffId == "undefined" ? "-" : staffInfo.staffId
                  }
                  readOnly
                  className="w-full h-[36px]  placeholder:text-[#111102]  text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Contact Number
                </label>
                <input
                  type="text"
                  placeholder="0778903648"
                  value={staffInfo.phone || "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102]  text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Delivery Charge */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Delivery Charge (Rs.)
                </label>
                <input
                  type="text"
                  value={extractDeliveryCost(quotation?.notes)}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102]  text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryDateStr}
                  readOnly
                  className={`w-full h-[36px] placeholder:text-[#111102] ${
                    isExpired ? "text-[#930000]" : "text-[#111102]"
                  } font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]`}
                />
              </div>

              {/* Total Cost */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  {/* Total Cost (Rs.) */}Net Total (Rs.)
                </label>
                <input
                  type="text"
                  value={quotation?.totalAmount?.toString() || ""}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102]  text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />

                <p className="text-[10px] text-[#930000] mt-1">
                  Net total includes 12% VAT rate.
                </p>
              </div>
            </form>

            {/* Scrollable Table */}
            <div className="overflow-y-auto  no-scrollbar max-h-[150px] rounded-tl-[8px] rounded-tr-[8px] ">
              <table className="w-full text-[8px] text-center border font-body text-[#111102] border-white table-fixed overflow-x-auto min-w-[600px]">
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

                <tbody className=" overflow-y-auto max-h-[120px] no-scrollbar ">
                  {tableData.map((item, index) => (
                    <tr
                      key={index}
                      className="odd:bg-white text-[8px] font-body even:bg-gray-50 border-b border-white"
                    >
                      <td className="p-3 border "> {item.id}</td>
                      <td className="p-3 border">{item.itemName}</td>
                      <td className="p-3 border">
                        {item.imageUrl ? (
                          <div className="flex justify-center items-center">
                            <img
                              src={item.imageUrl}
                              alt={item.itemName}
                              className="w-[40px] h-[30px] object-cover rounded"
                            />
                          </div>
                        ) : (
                          <span className="text-[8px] text-gray-400">
                            No image
                          </span>
                        )}
                      </td>
                      <td className="p-3 border">{item.unit}</td>
                      <td className="p-3 border">{item.description}</td>
                      <td className="p-3 border">{item.unitPrice}</td>
                      <td className="p-3 border">{item.totalPrice}</td>
                      <td className="p-3 border">
                        {quotation?.totalAmount?.toString()}
                      </td>
                      <td className="p-3 border">{item.stock}</td>
                      <td className="p-3 border">{item.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {quotation?.status !== "accepted" && (
              <div className="flex justify-center">
                <button
                  type="button"
                  className="w-[164px] h-[36px] font-[600] font-body text-[14px] rounded-[3px] bg-[#F9C301] text-[#111102] hover:bg-yellow-500"
                  onClick={() => {
                    if (quotation && onOpenPurchaseOrder) {
                      onClose();
                      onOpenPurchaseOrder(quotation);
                    }
                  }}
                >
                  Confirm Estimate
                </button>
              </div>
            )}
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
