"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { ViewEstimate1 } from "@/assets/Images";
import {
  COLLECTIONS,
  FirestoreService,
  Quotation,
  QuotationRequest,
} from "@/service/firestoreService";

interface IViewAcceptedPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation?: Quotation | null;
}

export const ViewAcceptedPOModal: React.FC<IViewAcceptedPOModalProps> = ({
  isOpen,
  onClose,
  quotation,
}) => {
  const [request, setRequest] = useState<QuotationRequest | null>(null);

  useEffect(() => {
    (async () => {
      if (quotation?.quotationRequestId) {
        const req = await FirestoreService.getById<QuotationRequest>(
          COLLECTIONS.QUOTATION_REQUESTS,
          quotation.quotationRequestId
        );
        setRequest(req);
      } else {
        setRequest(null);
      }
    })();
  }, [quotation?.quotationRequestId]);

  const acceptedDate = useMemo(() => {
    const ts: any =
      (quotation as any)?.updatedAt || (quotation as any)?.createdAt;
    if (ts?.seconds) return new Date(ts.seconds * 1000);
    return ts instanceof Date ? ts : null;
  }, [quotation]);

  const requestedDate = useMemo(() => {
    const ts: any = (request as any)?.createdAt;
    if (ts?.seconds) return new Date(ts.seconds * 1000);
    return ts instanceof Date ? ts : null;
  }, [request]);

  const firstImage = request?.attachedImages?.[0] || null;
  const partName = quotation?.products?.[0]?.partName || "-";

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[700px] sm:w-[600px] w-full bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body text-left">
            Accepted Purchase Order by {quotation?.vendorName || "Vendor"}
          </Dialog.Title>

          {/* Gray Container */}
          <div className="bg-[#F8F8F8] rounded-[8px] sm:p-8 p-4 space-y-6 sm:h-full h-[600px] overflow-y-auto">
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
                  className="w-[107px] h-[73px]  rounded-[3px] object-cover"
                />
              )}
            </div>

            {/* Form Section */}
            <form className="sm:grid sm:grid-cols-3 gap-y-4 gap-x-6 sm:space-y-0 space-y-2">
              {/* Estimate Code */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Estimate Code
                </label>
                <input
                  type="text"
                  value={(quotation as any)?.id || "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Request Code */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Request Code
                </label>
                <input
                  type="text"
                  value={quotation?.quotationRequestId || "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Company Name
                </label>
                <input
                  type="text"
                  value={quotation?.vendorName || "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Part Name */}
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

              {/* Requested Date */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Requested Date
                </label>
                <input
                  type="text"
                  value={
                    requestedDate ? requestedDate.toLocaleDateString() : "-"
                  }
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Accepted Date */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Accepted Date
                </label>
                <input
                  type="text"
                  value={acceptedDate ? acceptedDate.toLocaleDateString() : "-"}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              {/* Contact (Email) */}
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Contact Email
                </label>
                <input
                  type="text"
                  value={quotation?.vendorEmail || "-"}
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
                  value={
                    request?.numberOfUnits != null
                      ? String(request.numberOfUnits)
                      : "-"
                  }
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
