"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import Image from "next/image";
import { GalleryImage } from "@/service/firestoreService";

interface IViewVendorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor?: any | null;
  gallery?: GalleryImage[];
  categoryLabelMap?: Record<string, string>;
  brandLabelMap?: Record<string, string>;
  modelLabelMap?: Record<string, string>;
}

export const ViewVendorProfileModal: React.FC<IViewVendorProfileModalProps> = ({
  isOpen,
  onClose,
  vendor,
  gallery,
  categoryLabelMap,
  brandLabelMap,
  modelLabelMap,
}) => {
  const prettyList = (ids?: string[], map?: Record<string, string>) => {
    if (!ids || !ids.length) return "-";
    if (!map) return ids.join(", ");
    return ids.map((id) => map[id] || id).join(", ");
  };
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body text-left">
            {(vendor?.firstName || "") + " " + (vendor?.lastName || "")}
          </Dialog.Title>

          {/* Gray Container */}
          <div className="bg-[#F8F8F8] rounded-[8px] p-8 space-y-6">
            {/* Logo and Company Name Row */}
            <div className="grid grid-cols-3 gap-x-6 items-center ">
              {/* Logo */}
              <div className="flex justify-center">
                <div className="w-[90px] h-[63px] rounded-[3px] bg-white flex items-center justify-center text-[10px] text-gray-500">Logo</div>
              </div>

              {/* Company Name */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Company Name
                </label>
                <input
                  type="text"
                  value={(vendor?.firstName || "") + " " + (vendor?.lastName || "")}
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
                  value={vendor?.contactPerson || vendor?.firstName || ""}
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
                  value={vendor?.phone || ""}
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
                  value={vendor?.whatsApp || ""}
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
                  value={vendor?.email || ""}
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
                  value={vendor?.conmpanyBR || ""}
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
                  value={vendor?.district || ""}
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
                  value={prettyList(vendor?.mainCategories, categoryLabelMap)}
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
                  value={prettyList(vendor?.vehicleBrand, brandLabelMap)}
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
                  value={prettyList(vendor?.vehicleModel, modelLabelMap)}
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
                  value={vendor?.description || vendor?.address || ""}
                  className="w-full placeholder:text-[#111102] h-[60px] mt-1 p-3 text-[10px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Gallery Images */}
              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Gallery Images
                </label>
                <div className="flex space-x-2 mt-2">
                  {(gallery || []).slice(0, 7).map((g) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={g.imageUrl} src={g.imageUrl} alt={g.title} className="w-[75px] h-[75px] rounded-[3px] object-cover" />
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
