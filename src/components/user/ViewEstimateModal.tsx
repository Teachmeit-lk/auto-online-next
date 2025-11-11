"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import Image from "next/image";

import { ViewEstimate1 } from "@/assets/Images";
import { QuotationRequest } from "@/service/firestoreService";

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: QuotationRequest | null;
}

export const ViewEstimateModal: React.FC<EstimateModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const createdAt: any = (request as any)?.createdAt;
  const createdDate = createdAt?.seconds
    ? new Date(createdAt.seconds * 1000)
    : createdAt instanceof Date
    ? createdAt
    : null;
  const firstImage = request?.attachedImages?.[0];
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body text-left">
            {request?.vendorName ? `${request.vendorName} Estimate` : "Quotation Request"}
          </Dialog.Title>

          {/* Gray Container */}
          <div className="bg-[#F8F8F8] rounded-[8px] p-8 space-y-6">
            {/* Image Section */}
            <div className="flex justify-center">
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt="Attachment"
                  width={214}
                  height={146}
                  className="w-[214px] h-[146px] rounded-[6px] object-cover"
                />
              ) : (
                <Image
                  src={ViewEstimate1}
                  alt="No image"
                  width={107}
                  height={73}
                  className="w-[107px] h-[73px] rounded-[3px] object-cover"
                />
              )}
            </div>

            {/* Form Section */}
            <form className="grid grid-cols-3 gap-y-4 gap-x-6">
              {/* Vehicle Country */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Country
                </label>
                <input
                  type="text"
                  value={request?.country || "-"}
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
                  value={request?.model || "-"}
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
                  value={request?.district || "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Year of Manufacturing */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Year of Manufacturing
                </label>
                <input
                  type="text"
                  value={request?.manufacturingYear || "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  value={request?.vehicleType || "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Fuel Type */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Fuel Type
                </label>
                <input
                  type="text"
                  value={request?.fuelType || "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Measurement */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Measurement
                </label>
                <input
                  type="text"
                  value={request?.measurement || "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* No of Units */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  No of Units
                </label>
                <input
                  type="text"
                  value={request?.numberOfUnits?.toString() || "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
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
                  value={request?.description || "-"}
                  className="w-full placeholder:text-[#111102] h-[80px] mt-1 p-3 text-[10px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Optional fields */}
              {request?.maxBudget !== undefined && (
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Max Budget
                  </label>
                  <input
                    type="text"
                    value={String(request.maxBudget)}
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>
              )}
              {request?.targetDeliveryDate && (
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Target Delivery
                  </label>
                  <input
                    type="text"
                    value={((): string => {
                      const td: any = request.targetDeliveryDate as any;
                      const d = td?.seconds ? new Date(td.seconds * 1000) : (td instanceof Date ? td : null);
                      return d ? d.toLocaleDateString() : "-";
                    })()}
                    readOnly
                    className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                  />
                </div>
              )}
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
