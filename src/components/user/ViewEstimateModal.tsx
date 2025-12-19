"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import Image from "next/image";
import { QuotationRequest } from "@/service/firestoreService";
import { useState } from "react";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const createdAt: any = (request as any)?.createdAt;
  const createdDate = createdAt?.seconds
    ? new Date(createdAt.seconds * 1000)
    : createdAt instanceof Date
    ? createdAt
    : null;
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[700px] sm:w-[600px] w-full bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body text-left">
            {request?.vendorName
              ? `${request.vendorName} Estimate`
              : "Quotation Request"}
          </Dialog.Title>

          {/* Gray Container */}
          <div className="bg-[#F8F8F8] rounded-[8px] sm:p-8 p-4 space-y-6 sm:h-[550px] h-[600px] overflow-y-auto no-scrollbar">
            {/* Image Section - Multiple Images */}
            <div className="space-y-3">
              <label className="text-[12px] font-body font-[500] text-[#111102] block">
                Attached Images {request?.attachedImages && request.attachedImages.length > 0 && (
                  <span className="text-[10px] text-gray-500">
                    ({request.attachedImages.length} {request.attachedImages.length === 1 ? 'image' : 'images'})
                  </span>
                )}
              </label>
              
              {request?.attachedImages && request.attachedImages.length > 0 ?  (
                <div className="grid grid-cols-3 gap-3">
                  {request.attachedImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Attachment ${index + 1}`}
                        width={200}
                        height={150}
                        className="w-full h-[120px] rounded-[6px] object-cover border-2 border-transparent group-hover:border-[#F9C301] transition-all"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-body px-2 py-0.5 rounded-full">
                        {index + 1}/{request.attachedImages.length}
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-[6px] transition-all flex items-center justify-center">
                        <span className="text-white text-[10px] font-body opacity-0 group-hover:opacity-100 bg-[#F9C301] px-3 py-1 rounded-full">
                          View
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <p className="text-[10px] text-gray-500 font-body text-center mt-2">
                    No images attached
                  </p>
                </div>
              )}
            </div>

            {/* Form Section */}
            <form className="sm:grid sm:grid-cols-3 gap-y-4 gap-x-6 sm:space-y-0 space-y-2 ">
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

              {/* Vehicle Brand */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Brand
                </label>
                <input
                  type="text"
                  value={request?.brand || "-"}
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
                            
              {/* Requested Category */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Requested Category
                </label>
                <input
                  type="text"
                  value={request?.category || "-"}
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
                      const d = td?.seconds
                        ? new Date(td.seconds * 1000)
                        : td instanceof Date
                        ? td
                        : null;
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
        {/* Image Lightbox Modal */}
        {selectedImageIndex !== null && request?.attachedImages && (
          <Dialog.Root open={true} onOpenChange={() => setSelectedImageIndex(null)}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] md:w-auto md:max-w-[90vw] max-h-[90vh] focus:outline-none z-50 px-4 md:px-0">
                  <Dialog.Title></Dialog.Title>
                  <div className="relative flex flex-col items-center">
                  {/* Main Image */}
                  <Image
                    src={request.attachedImages[selectedImageIndex]}
                    alt={`Full size image ${selectedImageIndex + 1}`}
                    width={1200}
                    height={800}
                    className="max-w-[90vw] max-h-[85vh] w-auto h-auto rounded-lg object-contain"
                  />
                  
                  {/* Image Counter */}
                  <div className="absolute top-2 md:-top-12 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 md:px-4 py-1 md:py-2 rounded-full text-[10px] md:text-[12px] font-body z-10">
                    {selectedImageIndex + 1} / {request.attachedImages.length}
                  </div>

                  {/* Navigation Buttons */}
                  {request.attachedImages.length > 1 && (
                    <>
                      {/* Previous Button */}
                      {selectedImageIndex > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(selectedImageIndex - 1);
                          }}
                          className="absolute left-2 md:-left-14 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#F9C301] text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all z-10 text-lg md:text-xl"
                        >
                          ‹
                        </button>
                      )}
                      
                      {/* Next Button */}
                      {selectedImageIndex < request.attachedImages.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(selectedImageIndex + 1);
                          }}
                          className="absolute right-2 md:-right-14 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#F9C301] text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all z-10 text-lg md:text-xl"
                        >
                          ›
                        </button>
                      )}
                    </>
                  )}

                  {/* Close Button */}
                  <Dialog.Close asChild>
                    <button
                      onClick={() => setSelectedImageIndex(null)}
                      className="absolute top-2 right-2 md:-top-12 md:-right-12 bg-black/70 hover:bg-red-500 text-white w-8 h-8 md: w-10 md:h-10 rounded-full flex items-center justify-center transition-all z-10"
                    >
                      <CirclePlus className="w-4 h-4 md:w-5 md:h-5 rotate-45" />
                    </button>
                  </Dialog.Close>

                  {/* Thumbnail Strip */}
                  {request.attachedImages.length > 1 && (
                    <div className="absolute -bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 bg-black/70 p-1.5 md:p-2 max-w-[90vw] overflow-x-auto no-scrollbar">
                      {request.attachedImages. map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 overflow-hidden border-2 transition-all ${
                            idx === selectedImageIndex
                              ? 'border-[#F9C301] scale-110'
                              : 'border-white/30 hover: border-white/60'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
};
