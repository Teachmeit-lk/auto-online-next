"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import Image from "next/image";

import { ViewEstimate1 } from "@/assets/Images";

interface IViewVendorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ViewVendorProfileModal: React.FC<IViewVendorProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body text-left">
            NMK Motors
          </Dialog.Title>

          {/* Gray Container */}
          <div className="bg-[#F8F8F8] rounded-[8px] p-8 space-y-6">
            {/* Logo and Company Name Row */}
            <div className="grid grid-cols-3 gap-x-6 items-center ">
              {/* Logo */}
              <div className="flex justify-center">
                <Image
                  src={ViewEstimate1}
                  alt="Vehicle Image"
                  className="w-[90px] h-[63px] rounded-[3px] object-cover"
                />
              </div>

              {/* Company Name */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="NMK Motors"
                  readOnly
                  className="w-full h-[36px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] "
                />
              </div>
            </div>

            {/* Form Section */}
            <form className="grid grid-cols-3 gap-y-2 gap-x-6">
              {/* Contact Person */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="John Hope"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="0774791034"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  placeholder="0773944180"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Email Address
                </label>
                <input
                  type="text"
                  placeholder="makarandapathirana@gmail.com"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Company BR */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Company BR
                </label>
                <input
                  type="text"
                  placeholder="PV98741"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* District */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  District
                </label>
                <input
                  type="text"
                  placeholder="Colombo"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Main Categories */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Main Categories
                </label>
                <input
                  type="text"
                  placeholder="Filters, Tyres, Body parts"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Vehicle Brand */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Brand
                </label>
                <input
                  type="text"
                  placeholder="Europe, Indian, Korean"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Vehicle Model */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  placeholder="Model 1"
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Company Description */}
              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Company Description
                </label>
                <textarea
                  rows={3}
                  readOnly
                  placeholder="Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups."
                  className="w-full placeholder:text-[#111102] h-[60px] mt-1 p-3 text-[10px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Gallery Images */}
              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Gallery Images
                </label>
                <div className="flex space-x-2 mt-2">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <Image
                      key={index}
                      src={ViewEstimate1}
                      alt={`Gallery Image ${index + 1}`}
                      className="w-[75px] h-[75px] rounded-[3px] object-cover"
                    />
                  ))}
                </div>
              </div>
            </form>
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
