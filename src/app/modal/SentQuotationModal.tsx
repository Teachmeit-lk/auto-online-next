"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import Image from "next/image";

import { ViewEstimate1 } from "@/app/assets/images";

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SentQuotationModal: React.FC<EstimateModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[89vh] bg-white py-8 px-6 rounded-[10px] shadow-lg focus:outline-none overflow-hidden">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body">
            Sent Quotation
          </Dialog.Title>
          <div className="h-full overflow-y-auto no-scrollbar pb-11">
            {/* Gray Container */}
            <div className="bg-[#F8F8F8] rounded-[8px] p-8 space-y-6">
              {/* Image Section */}
              <div className="flex justify-center">
                <Image
                  src={ViewEstimate1}
                  alt="Vehicle Image"
                  className="w-[107px] h-[73px]   rounded-[3px] object-cover"
                />
              </div>

              {/* Form Section */}
              <form className="grid grid-cols-3 gap-y-4 gap-x-6 ">
                {/* Vehicle Brand */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="Filter"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* Vehicle Model */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Item S/N
                  </label>
                  <input
                    type="text"
                    placeholder="XYZ"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Stock Availability
                  </label>
                  <input
                    type="text"
                    placeholder="In Stock"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* Year of Manufacturing */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Measurement
                  </label>
                  <input
                    type="text"
                    placeholder="Liters"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    No of Units
                  </label>
                  <input
                    type="text"
                    placeholder="10"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Unit Price (Rs.)
                  </label>
                  <input
                    type="text"
                    placeholder="500.00"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* Measurement */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Total Price (Rs.)
                  </label>
                  <input
                    type="text"
                    placeholder="5000.00"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* No of Units */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Net Total Price (Rs.)
                  </label>
                  <input
                    type="text"
                    placeholder="5600.00"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                <div>
                  <p className="text-[10px] text-[#930000] mt-12">
                    Net total includes 12% VAT rate.
                  </p>
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Vendor Comments
                  </label>
                  <textarea
                    rows={3}
                    readOnly
                    placeholder="Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups."
                    className="w-full placeholder:text-[#111102] h-[80px] mt-1 p-3 text-[10px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    readOnly
                    placeholder="Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups."
                    className="w-full placeholder:text-[#111102] h-[80px] mt-1 p-3 text-[10px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                <div className="text-[15px] font-bold mb-5 text-center text-[#111102] font-body col-span-3">
                  Sales Person Details
                </div>

                {/* Vehicle Brand */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    NIC
                  </label>
                  <input
                    type="text"
                    placeholder="200215482546"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Staff Name
                  </label>
                  <input
                    type="text"
                    placeholder="XYZ"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* Year of Manufacturing */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="0751424863"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Delivery Cost (Rs.)
                  </label>
                  <input
                    type="text"
                    placeholder="350.00"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>

                {/* Vehicle Model */}
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Validity Days
                  </label>
                  <input
                    type="text"
                    placeholder="4"
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>
              </form>
            </div>
          </div>
          {/* Close Button */}
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
