"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import { useState } from "react";

interface IViewPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ViewPurchaseOrderModal: React.FC<IViewPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tableData] = useState(
    Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      itemName: `Item ${index + 1}`,
      unit: "Unit",
      description: "Item description",
      unitPrice: "1,000",
      totalPrice: "3,000",
      netTotal: "2,500",
      stock: "Available",
      comment: "N/A",
    }))
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body">
            View Purchase Order
          </Dialog.Title>

          {/* Gray Container */}
          <div className="bg-[#F8F8F8] rounded-[8px] p-8 space-y-6">
            {/* Form Section */}
            <form className="grid grid-cols-3 gap-y-4 gap-x-6">
              {/* Staff ID */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Staff ID
                </label>
                <input
                  type="text"
                  placeholder="154856565V"
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
                  placeholder="Praharsha"
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
                  placeholder="0714562541"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102]  text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Total Price */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Total Price (Rs.)
                </label>
                <input
                  type="text"
                  placeholder="12300.00"
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
                  placeholder="450.00"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102]  text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Total Cost */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Total Cost (Rs.)
                </label>
                <input
                  type="text"
                  placeholder="13100.00"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102]  text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>
            </form>

            {/* Scrollable Table */}
            <div className="overflow-y-auto  no-scrollbar max-h-[150px] rounded-tl-[8px] rounded-tr-[8px]">
              <table className="w-full text-[8px] text-center border font-body text-[#111102] border-white table-fixed">
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
