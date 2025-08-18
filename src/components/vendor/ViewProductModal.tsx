"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import Image from "next/image";
import { Product } from "@/service/firestoreService";

interface IViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categoryLabelMap?: Record<string, string>;
  brandLabelMap?: Record<string, string>;
  modelLabelMap?: Record<string, string>;
  vehicleTypeLabelMap?: Record<string, string>;
}

export const ViewProductModal: React.FC<IViewProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categoryLabelMap,
  brandLabelMap,
  modelLabelMap,
  vehicleTypeLabelMap,
}) => {
  const mainImage = product?.images?.[0] || "";
  const partName = product?.partName || "-";
  const mainCategory = (categoryLabelMap && product?.mainCategory && categoryLabelMap[product.mainCategory]) || product?.mainCategory || "-";
  const brand = (brandLabelMap && product?.vehicleBrand && brandLabelMap[product.vehicleBrand]) || product?.vehicleBrand || "-";
  const model = (modelLabelMap && product?.vehicleModel && modelLabelMap[product.vehicleModel]) || product?.vehicleModel || "-";
  const vehicleType = (vehicleTypeLabelMap && product?.vehicleType && vehicleTypeLabelMap[product.vehicleType]) || product?.vehicleType || "-";
  const year = product?.yearOfManufacturing || "-";
  const description = product?.description || "-";
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body text-left">
            View Product
          </Dialog.Title>

          {/* Gray Container */}
          <div className="bg-[#F8F8F8] rounded-[8px] p-8 space-y-6">
            {/* Image Section */}
            <div className="flex justify-center">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt="Product Image"
                  width={160}
                  height={110}
                  className="w-[160px] h-[110px] rounded-[3px] object-cover"
                />
              ) : (
                <div className="w-[160px] h-[110px] rounded-[3px] bg-white flex items-center justify-center text-[10px] text-gray-500">No Image</div>
              )}
            </div>

            {/* Form Section */}
            <form className="grid grid-cols-3 gap-y-4 gap-x-6">
              {/* Vehicle Brand */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Part Name
                </label>
                <input type="text" readOnly value={partName} className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]" />
              </div>

              {/* Vehicle Model */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Main Category
                </label>
                <input type="text" readOnly value={mainCategory} className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]" />
              </div>

              {/* District */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Brand
                </label>
                <input type="text" readOnly value={brand} className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]" />
              </div>

              {/* Year of Manufacturing */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Model
                </label>
                <input type="text" readOnly value={model} className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]" />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Type
                </label>
                <input type="text" readOnly value={vehicleType} className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]" />
              </div>

              {/* Fuel Type */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">Year of Manufacturing</label>
                <input type="text" readOnly value={year} className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]" />
              </div>

              {/* Measurement */}
              <div>
                <div />
              </div>

              {/* Description */}
              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Description
                </label>
                <textarea rows={3} readOnly value={description} className="w-full placeholder:text-[#111102] h-[80px] mt-1 p-3 text-[10px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301]" />
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
